import { createClient } from '@/lib/supabase/server'
import { formatLBP } from '@/lib/utils'
import {
  BarChart2, TrendingUp, TrendingDown, Target, PlusCircle,
  CheckCircle, AlertTriangle, AlertCircle, Info, Lightbulb, Zap,
} from 'lucide-react'
import Link from 'next/link'
import { ProfitChartsWrapper } from '@/components/ProfitChartsWrapper'
import type { WeeklyPL, SchoolPL, CategoryBreakdown, WeeklyMargin } from '@/components/ProfitCharts'
import type { RevBreakdown } from '@/components/ProfitCharts'

const CATEGORY_LABELS: Record<string, string> = {
  salary: 'Salaries', electricity: 'Electricity', rent: 'Rent',
  transport: 'Transport', maintenance: 'Maintenance',
  marketing: 'Marketing', communications: 'Communications', other: 'Other',
}
const CATEGORY_COLORS: Record<string, string> = {
  salary: '#f59e0b', electricity: '#3b82f6', rent: '#10b981',
  transport: '#8b5cf6', maintenance: '#ef4444',
  marketing: '#ec4899', communications: '#06b6d4', other: '#94a3b8',
}

function fmtWeek(dateStr: string) {
  try { return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  catch { return dateStr }
}

function fmtM(v: number) {
  const a = Math.abs(v)
  return a >= 1 ? `${v.toFixed(1)}M` : `${(v * 1000).toFixed(0)}K`
}

// ── Insight / Recommendation types ──────────────────────────────────────────
type Level = 'success' | 'info' | 'warning' | 'danger'

interface Insight {
  level: Level
  title: string
  detail: string
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  title: string
  action: string
}

export default async function ReportsPage() {
  const supabase = await createClient()

  const [reconRes, diRes, ccRes, weRes, expRes] = await Promise.all([
    supabase.from('reconciliation_summary').select('*').order('week_start'),
    supabase.from('delivery_items').select('batch_id, product_id, delivered_qty, products(cost_price_usd)'),
    supabase.from('closing_counts').select('batch_id, product_id, remaining_qty'),
    supabase.from('waste_entries').select('batch_id, product_id, waste_qty'),
    supabase.from('expenses').select('*, schools(name)').order('week_start'),
  ])

  const recon       = reconRes.data ?? []
  const delivItems  = diRes.data    ?? []
  const closeCounts = ccRes.data    ?? []
  const wasteItems  = weRes.data    ?? []
  const expenses    = expRes.data   ?? []

  // ── Direct cost per batch ────────────────────────────────────────────────
  const ccMap = new Map<string, number>()
  for (const c of closeCounts) {
    const k = `${c.batch_id}:${c.product_id}`
    ccMap.set(k, (ccMap.get(k) ?? 0) + c.remaining_qty)
  }
  const weMap = new Map<string, number>()
  for (const w of wasteItems) {
    const k = `${w.batch_id}:${w.product_id}`
    weMap.set(k, (weMap.get(k) ?? 0) + w.waste_qty)
  }
  const batchDC = new Map<string, number>()
  for (const di of delivItems) {
    const k       = `${di.batch_id}:${di.product_id}`
    const sold    = Math.max(0, di.delivered_qty - (ccMap.get(k) ?? 0) - (weMap.get(k) ?? 0))
    const costUsd = (di.products as unknown as { cost_price_usd: number } | null)?.cost_price_usd ?? 0
    batchDC.set(di.batch_id, (batchDC.get(di.batch_id) ?? 0) + sold * costUsd * 90_000)
  }

  // ── Weekly P&L ───────────────────────────────────────────────────────────
  type WE = { sales: number; dc: number; ic: number }
  const weekMap = new Map<string, WE>()
  for (const r of recon) {
    const w = weekMap.get(r.week_start) ?? { sales: 0, dc: 0, ic: 0 }
    w.sales += Number(r.expected_cash_lbp)
    w.dc    += batchDC.get(r.batch_id) ?? 0
    weekMap.set(r.week_start, w)
  }
  for (const exp of expenses) {
    const w = weekMap.get(exp.week_start)
    if (w) { w.ic += Number(exp.amount_lbp) }
    else weekMap.set(exp.week_start, { sales: 0, dc: 0, ic: Number(exp.amount_lbp) })
  }

  const sortedWeeks = Array.from(weekMap.entries()).sort(([a], [b]) => a.localeCompare(b))

  const weeklyData: WeeklyPL[] = sortedWeeks.map(([week, d]) => ({
    week:         fmtWeek(week),
    sales:        d.sales / 1e6,
    directCost:   d.dc   / 1e6,
    grossProfit:  (d.sales - d.dc)        / 1e6,
    indirectCost: d.ic   / 1e6,
    netProfit:    (d.sales - d.dc - d.ic) / 1e6,
  }))

  const marginData: WeeklyMargin[] = sortedWeeks.map(([week, d]) => ({
    week: fmtWeek(week),
    gm:   d.sales > 0 ? (d.sales - d.dc) / d.sales * 100 : 0,
    nm:   d.sales > 0 ? (d.sales - d.dc - d.ic) / d.sales * 100 : 0,
  }))

  // ── Global KPIs ──────────────────────────────────────────────────────────
  const totalSales     = recon.reduce((s, r) => s + Number(r.expected_cash_lbp), 0)
  const totalDC        = recon.reduce((s, r) => s + (batchDC.get(r.batch_id) ?? 0), 0)
  const totalIC        = expenses.reduce((s, e) => s + Number(e.amount_lbp), 0)
  const grossProfit    = totalSales - totalDC
  const netProfit      = grossProfit - totalIC
  const grossMarginPct = totalSales > 0 ? (grossProfit / totalSales * 100) : 0
  const netMarginPct   = totalSales > 0 ? (netProfit   / totalSales * 100) : 0
  const breakEvenSales = grossMarginPct > 0 ? totalIC / (grossMarginPct / 100) : 0

  const revBreakdown: RevBreakdown = totalSales > 0
    ? { dc: totalDC / totalSales * 100, ic: totalIC / totalSales * 100, np: netProfit / totalSales * 100 }
    : { dc: 0, ic: 0, np: 0 }

  // ── Per-school P&L ───────────────────────────────────────────────────────
  type SE = { name: string; sales: number; dc: number; ic: number }
  const schoolMap = new Map<string, SE>()
  for (const r of recon) {
    const s = schoolMap.get(r.school_id) ?? { name: r.school_name ?? '', sales: 0, dc: 0, ic: 0 }
    s.sales += Number(r.expected_cash_lbp)
    s.dc    += batchDC.get(r.batch_id) ?? 0
    schoolMap.set(r.school_id, s)
  }
  const numSchools = schoolMap.size || 1
  for (const exp of expenses) {
    if (!exp.school_id) {
      for (const s of schoolMap.values()) s.ic += Number(exp.amount_lbp) / numSchools
    } else {
      const s = schoolMap.get(exp.school_id)
      if (s) s.ic += Number(exp.amount_lbp)
    }
  }
  const schoolData: SchoolPL[] = Array.from(schoolMap.values()).map(s => ({
    name:        s.name.length > 22 ? s.name.slice(0, 20) + '…' : s.name,
    sales:       s.sales / 1e6,
    grossProfit: (s.sales - s.dc)        / 1e6,
    netProfit:   (s.sales - s.dc - s.ic) / 1e6,
  }))

  // ── Expense categories ───────────────────────────────────────────────────
  const catMap = new Map<string, number>()
  for (const exp of expenses) catMap.set(exp.category, (catMap.get(exp.category) ?? 0) + Number(exp.amount_lbp))
  const categoryData: CategoryBreakdown[] = Array.from(catMap.entries()).map(([cat, amt]) => ({
    name:  CATEGORY_LABELS[cat] ?? cat,
    value: amt / 1e6,
    color: CATEGORY_COLORS[cat] ?? '#94a3b8',
  }))

  // ── Detailed table ───────────────────────────────────────────────────────
  const plTable = Array.from(weekMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([week, d]) => {
      const gp = d.sales - d.dc
      const np = gp - d.ic
      return { week, sales: d.sales, dc: d.dc, gp, ic: d.ic, np,
        gm: d.sales > 0 ? gp / d.sales * 100 : 0,
        nm: d.sales > 0 ? np / d.sales * 100 : 0 }
    })

  // ── Auto Insights ────────────────────────────────────────────────────────
  const insights: Insight[] = []

  // 1. Sales week-over-week
  if (sortedWeeks.length >= 2) {
    const [, prev] = sortedWeeks[sortedWeeks.length - 2]
    const [, curr] = sortedWeeks[sortedWeeks.length - 1]
    if (prev.sales > 0) {
      const chg = (curr.sales - prev.sales) / prev.sales * 100
      if (chg >= 10)
        insights.push({ level: 'success', title: `Sales up ${chg.toFixed(0)}% this week`, detail: `${fmtM(curr.sales / 1e6)}M vs ${fmtM(prev.sales / 1e6)}M LBP last week` })
      else if (chg <= -10)
        insights.push({ level: 'warning', title: `Sales dropped ${Math.abs(chg).toFixed(0)}% this week`, detail: `From ${fmtM(prev.sales / 1e6)}M to ${fmtM(curr.sales / 1e6)}M LBP` })
      else
        insights.push({ level: 'info', title: `Sales stable (${chg > 0 ? '+' : ''}${chg.toFixed(1)}% WoW)`, detail: `${fmtM(curr.sales / 1e6)}M LBP this week — consistent performance` })
    }
  }

  // 2. Gross margin health
  if (totalSales > 0) {
    if (grossMarginPct >= 30)
      insights.push({ level: 'success', title: `Excellent gross margin: ${grossMarginPct.toFixed(1)}%`, detail: 'Above the 25–30% benchmark for school food kiosks' })
    else if (grossMarginPct >= 25)
      insights.push({ level: 'success', title: `Gross margin on target: ${grossMarginPct.toFixed(1)}%`, detail: 'Meeting the 25% benchmark — keep pricing steady' })
    else if (grossMarginPct >= 15)
      insights.push({ level: 'warning', title: `Gross margin below target: ${grossMarginPct.toFixed(1)}%`, detail: 'Target is 25%+ — review pricing or negotiate supplier rates' })
    else
      insights.push({ level: 'danger', title: `Critical gross margin: ${grossMarginPct.toFixed(1)}%`, detail: 'Product costs are consuming nearly all revenue — urgent action needed' })
  }

  // 3. Net profit status
  if (totalSales > 0) {
    if (netProfit > 0)
      insights.push({ level: 'success', title: `Net profitable: ${formatLBP(netProfit)}`, detail: `${netMarginPct.toFixed(1)}% net margin — all costs covered` })
    else if (netProfit < 0)
      insights.push({ level: 'danger', title: `Operating at a loss: ${formatLBP(Math.abs(netProfit))}`, detail: `Indirect costs exceed gross profit by ${formatLBP(Math.abs(netProfit))}` })
  }

  // 4. Break-even safety margin
  if (breakEvenSales > 0 && totalSales > 0) {
    const safetyPct = (totalSales - breakEvenSales) / totalSales * 100
    if (safetyPct >= 30)
      insights.push({ level: 'success', title: `Strong safety margin: ${safetyPct.toFixed(0)}% above break-even`, detail: `Sales can fall ${safetyPct.toFixed(0)}% before losses — very stable` })
    else if (safetyPct >= 10)
      insights.push({ level: 'info', title: `Safety margin: ${safetyPct.toFixed(0)}% above break-even`, detail: `${formatLBP(totalSales - breakEvenSales)} buffer — moderate resilience to revenue dips` })
    else if (safetyPct >= 0)
      insights.push({ level: 'warning', title: `Thin safety margin: only ${safetyPct.toFixed(0)}% above break-even`, detail: 'A small revenue drop could push you into losses' })
    else
      insights.push({ level: 'danger', title: `Below break-even by ${formatLBP(breakEvenSales - totalSales)}`, detail: 'Every week at this volume still loses money' })
  }

  // 5. Dominant expense category
  if (categoryData.length > 0 && totalIC > 0) {
    const top = [...categoryData].sort((a, b) => b.value - a.value)[0]
    const topPct = (top.value * 1e6 / totalIC) * 100
    if (topPct > 50)
      insights.push({ level: 'info', title: `${top.name} = ${topPct.toFixed(0)}% of indirect costs`, detail: 'Single category dominates expenses — review for optimization' })
  }

  // 6. Best vs worst school
  if (schoolData.length >= 2) {
    const byNP  = [...schoolData].sort((a, b) => b.netProfit - a.netProfit)
    const best  = byNP[0]
    const worst = byNP[byNP.length - 1]
    if (best.netProfit > worst.netProfit + 0.3)
      insights.push({ level: 'info', title: `${best.name} leads with ${fmtM(best.netProfit)}M net profit`, detail: `${fmtM(best.netProfit - worst.netProfit)}M ahead of ${worst.name} — investigate the gap` })
    if (worst.netProfit < 0)
      insights.push({ level: 'danger', title: `${worst.name} running at a loss`, detail: `Net: ${fmtM(worst.netProfit)}M LBP — costs exceed its revenue share` })
  }

  // 7. Best week ever
  if (weeklyData.length > 0) {
    const best = [...weeklyData].sort((a, b) => b.netProfit - a.netProfit)[0]
    if (best.netProfit > 0)
      insights.push({ level: 'info', title: `Best week: ${best.week} with ${fmtM(best.netProfit)}M net profit`, detail: 'Use this as your performance benchmark for all locations' })
  }

  // 8. Unreconciled batches
  const openBatches = recon.filter(r => r.status !== 'closed')
  if (openBatches.length > 0) {
    const names = [...new Set(openBatches.map(r => r.school_name ?? ''))].join(', ')
    insights.push({ level: 'warning', title: `${openBatches.length} batch(es) not yet closed`, detail: `Pending: ${names} — close to finalize the financial picture` })
  }

  // ── Recommendations ──────────────────────────────────────────────────────
  const recs: Recommendation[] = []

  if (grossMarginPct > 0 && grossMarginPct < 25)
    recs.push({ priority: 'high', title: 'Improve gross margin to 25%+', action: `Current GM is ${grossMarginPct.toFixed(1)}%. Raise selling prices by ~${(25 - grossMarginPct).toFixed(0)}% or renegotiate supplier costs on high-volume products` })

  if (netProfit < 0)
    recs.push({ priority: 'high', title: 'Cut costs to reach profitability', action: `You need ${formatLBP(Math.abs(netProfit))} less in expenses OR more sales. Start by reviewing the largest expense category` })

  if (breakEvenSales > 0 && totalSales < breakEvenSales)
    recs.push({ priority: 'high', title: 'Increase sales volume to break even', action: `You need ${formatLBP(breakEvenSales - totalSales)} more in sales at your current margin to cover indirect costs` })

  if (openBatches.length > 0)
    recs.push({ priority: 'high', title: `Close ${openBatches.length} pending reconciliation(s)`, action: 'Unreconciled batches mean you are working with incomplete financial data — close them before the next delivery' })

  if (categoryData.length > 0 && totalIC > 0) {
    const topCat = [...categoryData].sort((a, b) => b.value - a.value)[0]
    const topPct = (topCat.value * 1e6 / totalIC) * 100
    if (topPct > 50)
      recs.push({ priority: 'medium', title: `Optimize ${topCat.name} (${topPct.toFixed(0)}% of expenses)`, action: `Your largest cost category is ${topCat.name}. Explore if there are cheaper alternatives, part-time options, or operational changes to reduce this` })
  }

  if (schoolData.length >= 2) {
    const worst = [...schoolData].sort((a, b) => a.netProfit - b.netProfit)[0]
    if (worst.netProfit < 0)
      recs.push({ priority: 'medium', title: `Review operations at ${worst.name}`, action: `This location is loss-making. Conduct a site visit to review cash handling, waste levels, and local pricing` })
  }

  if (grossMarginPct >= 25 && netMarginPct >= 10 && openBatches.length === 0)
    recs.push({ priority: 'low', title: 'Consider expanding to a 6th school', action: 'Business fundamentals are strong. Your current cost structure may scale well with one additional location at low marginal cost' })

  const hasData = recon.length > 0 || expenses.length > 0

  return (
    <div className="p-8 space-y-8" style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profit &amp; Loss Report</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {recon.length} reconciled batches · {expenses.length} expense entries · {insights.length} insights
          </p>
        </div>
        <Link href="/expenses/new"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <PlusCircle size={15} className="text-indigo-500" /> Add Expense
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard label="Total Sales"   value={formatLBP(totalSales)}  sub="Gross revenue"            accent="#f59e0b" />
        <KPICard label="Direct Cost"   value={formatLBP(totalDC)}     sub={`${grossMarginPct.toFixed(1)}% gross margin`} accent="#ef4444" />
        <KPICard label="Gross Profit"  value={formatLBP(grossProfit)} sub="After product costs"      accent="#10b981" signed={grossProfit} />
        <KPICard label="Indirect Cost" value={formatLBP(totalIC)}     sub="Salaries, bills…"         accent="#6366f1" />
        <KPICard label="Net Profit"    value={formatLBP(Math.abs(netProfit))} sub={`${netMarginPct.toFixed(1)}% net margin`}
          accent={netProfit >= 0 ? '#06b6d4' : '#ef4444'} signed={netProfit} prefix={netProfit < 0 ? '−' : ''} />
      </div>

      {/* Break-Even */}
      {totalSales > 0 && grossMarginPct > 0 && (
        <BreakEvenCard breakEvenSales={breakEvenSales} totalSales={totalSales} grossMarginPct={grossMarginPct} />
      )}

      {/* ── Insights + Recommendations ──────────────────────────────────── */}
      {hasData && (
        <div className="grid grid-cols-2 gap-6">

          {/* Auto Analysis */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="white" />
              </div>
              <h3 className="font-semibold text-gray-900">Auto Analysis</h3>
            </div>
            {insights.length === 0 ? (
              <p className="text-gray-400 text-sm">Add data to generate insights</p>
            ) : (
              <div className="space-y-2.5">
                {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#f59e0b,#b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lightbulb size={16} color="white" />
              </div>
              <h3 className="font-semibold text-gray-900">Recommendations</h3>
            </div>
            {recs.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Looking good!</p>
                  <p className="text-xs text-green-600 mt-0.5">No critical recommendations right now. Keep monitoring weekly.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recs.map((rec, i) => <RecCard key={i} rec={rec} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts */}
      {hasData ? (
        <ProfitChartsWrapper
          weeklyData={weeklyData}
          schoolData={schoolData}
          categoryData={categoryData}
          marginData={marginData}
          revBreakdown={revBreakdown}
          breakEvenSales={breakEvenSales / 1e6}
          totalSales={totalSales / 1e6}
        />
      ) : (
        <EmptyState />
      )}

      {/* Detailed P&L Table */}
      {plTable.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Weekly P&amp;L Detail</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Week', 'Sales', 'Direct Cost', 'Gross Profit', 'GM%', 'Indirect Cost', 'Net Profit', 'NM%'].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-gray-500 font-medium ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plTable.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-amber-50/25 transition-colors">
                    <td className="px-5 py-3 text-gray-500 text-xs font-medium">{row.week}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{formatLBP(row.sales)}</td>
                    <td className="px-5 py-3 text-right text-red-500">{formatLBP(row.dc)}</td>
                    <td className="px-5 py-3 text-right text-green-600 font-medium">{formatLBP(row.gp)}</td>
                    <td className="px-5 py-3 text-right"><PctBadge val={row.gm} hi={25} lo={10} /></td>
                    <td className="px-5 py-3 text-right text-indigo-500">{formatLBP(row.ic)}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${row.np >= 0 ? 'text-cyan-600' : 'text-red-600'}`}>
                      {row.np < 0 ? '−' : ''}{formatLBP(Math.abs(row.np))}
                    </td>
                    <td className="px-5 py-3 text-right"><PctBadge val={row.nm} hi={10} lo={0} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                  <td className="px-5 py-3 text-gray-700">Total</td>
                  <td className="px-5 py-3 text-right text-gray-900">{formatLBP(totalSales)}</td>
                  <td className="px-5 py-3 text-right text-red-500">{formatLBP(totalDC)}</td>
                  <td className="px-5 py-3 text-right text-green-600">{formatLBP(grossProfit)}</td>
                  <td className="px-5 py-3 text-right"><PctBadge val={grossMarginPct} hi={25} lo={10} /></td>
                  <td className="px-5 py-3 text-right text-indigo-500">{formatLBP(totalIC)}</td>
                  <td className={`px-5 py-3 text-right ${netProfit >= 0 ? 'text-cyan-600' : 'text-red-600'}`}>
                    {netProfit < 0 ? '−' : ''}{formatLBP(Math.abs(netProfit))}
                  </td>
                  <td className="px-5 py-3 text-right"><PctBadge val={netMarginPct} hi={10} lo={0} /></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const config: Record<Level, { border: string; bg: string; icon: React.ReactNode }> = {
    success: { border: '#10b981', bg: '#f0fdf4', icon: <CheckCircle size={14} className="text-green-600 flex-shrink-0" /> },
    info:    { border: '#3b82f6', bg: '#eff6ff', icon: <Info         size={14} className="text-blue-500 flex-shrink-0" /> },
    warning: { border: '#f59e0b', bg: '#fffbeb', icon: <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" /> },
    danger:  { border: '#ef4444', bg: '#fef2f2', icon: <AlertCircle  size={14} className="text-red-500 flex-shrink-0" /> },
  }
  const c = config[insight.level]
  return (
    <div style={{ borderLeft: `3px solid ${c.border}`, background: c.bg, borderRadius: '0 10px 10px 0', padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ marginTop: 1 }}>{c.icon}</div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>{insight.title}</p>
        <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>{insight.detail}</p>
      </div>
    </div>
  )
}

function RecCard({ rec }: { rec: Recommendation }) {
  const pMap = {
    high:   { bg: '#fef2f2', border: '#fecaca', badge: '#ef4444', label: 'High Priority' },
    medium: { bg: '#fffbeb', border: '#fde68a', badge: '#f59e0b', label: 'Medium' },
    low:    { bg: '#f0fdf4', border: '#bbf7d0', badge: '#10b981', label: 'Low' },
  }
  const p = pMap[rec.priority]
  return (
    <div style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: p.badge, padding: '2px 8px', borderRadius: 20 }}>{p.label}</span>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{rec.title}</p>
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{rec.action}</p>
    </div>
  )
}

function KPICard({ label, value, sub, accent, signed, prefix = '' }: {
  label: string; value: string; sub: string; accent: string; signed?: number; prefix?: string
}) {
  const numColor = signed === undefined ? '#111827' : signed >= 0 ? '#10b981' : '#ef4444'
  return (
    <div className="bg-white rounded-2xl p-5" style={{
      borderTop: `4px solid ${accent}`, border: '1px solid #e5e7eb', borderTopColor: accent,
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    }}>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{label}</p>
      <p className="text-lg font-bold leading-tight" style={{ color: numColor }}>{prefix}{value}</p>
      <p className="text-xs text-gray-400 mt-1 leading-snug">{sub}</p>
    </div>
  )
}

function PctBadge({ val, hi, lo }: { val: number; hi: number; lo: number }) {
  const cls = val >= hi ? 'bg-green-50 text-green-700' : val >= lo ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{val.toFixed(1)}%</span>
}

function BreakEvenCard({ breakEvenSales, totalSales, grossMarginPct }: {
  breakEvenSales: number; totalSales: number; grossMarginPct: number
}) {
  const isAbove = totalSales >= breakEvenSales
  const safety  = totalSales - breakEvenSales
  const barMax  = Math.max(totalSales, breakEvenSales) * 1.1 || 1
  const bePct   = Math.min(96, (breakEvenSales / barMax) * 100)
  const sPct    = Math.min(96, (totalSales     / barMax) * 100)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.28)' }}>
            <Target size={20} color="white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Break-Even Analysis</h3>
            <p className="text-xs text-gray-400 mt-0.5">At {grossMarginPct.toFixed(1)}% gross margin — need {formatLBP(breakEvenSales)} in sales to cover all indirect costs</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isAbove ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {isAbove ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isAbove ? 'Above Break-Even' : 'Below Break-Even'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Break-Even Sales', value: formatLBP(breakEvenSales), color: '#8b5cf6' },
          { label: 'Actual Sales',     value: formatLBP(totalSales),     color: '#f59e0b' },
          { label: 'Safety Margin',    value: (isAbove ? '+' : '') + formatLBP(safety), color: isAbove ? '#10b981' : '#ef4444' },
        ].map(m => (
          <div key={m.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{m.label}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>
      <div style={{ height: 28, background: '#f3f4f6', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${sPct}%`, borderRadius: 14, background: isAbove ? 'linear-gradient(90deg,#fde68a,#34d399)' : 'linear-gradient(90deg,#fde68a,#fca5a5)' }} />
        <div style={{ position: 'absolute', left: `${bePct}%`, top: 0, height: '100%', width: 3, background: '#8b5cf6', transform: 'translateX(-1px)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: '#9ca3af' }}>
        <span>0</span><span style={{ color: '#8b5cf6', fontWeight: 600 }}>▲ Break-even</span><span>Current sales →</span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
        <BarChart2 size={28} className="text-blue-600" />
      </div>
      <p className="text-gray-700 font-semibold text-lg">No data yet</p>
      <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Create reconciled batches and add expenses to generate your P&amp;L report.</p>
      <div className="flex items-center justify-center gap-3 mt-5">
        <Link href="/batches/new" className="inline-flex items-center gap-2 bg-amber-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-amber-400 transition-colors">
          <PlusCircle size={15} /> New Batch
        </Link>
        <Link href="/expenses/new" className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <PlusCircle size={15} /> Add Expense
        </Link>
      </div>
    </div>
  )
}
