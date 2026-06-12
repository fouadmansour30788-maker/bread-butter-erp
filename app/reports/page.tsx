import { createClient } from '@/lib/supabase/server'
import { formatLBP } from '@/lib/utils'
import { BarChart2, TrendingUp, TrendingDown, Target, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { ProfitChartsWrapper as ProfitCharts } from '@/components/ProfitChartsWrapper'
import type { WeeklyPL, SchoolPL, CategoryBreakdown } from '@/components/ProfitCharts'

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
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return dateStr }
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

  // Direct cost per batch: sold qty × product cost × 90,000 LBP/USD
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

  // Weekly P&L
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

  const weeklyData: WeeklyPL[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, d]) => ({
      week:         fmtWeek(week),
      sales:        d.sales / 1e6,
      directCost:   d.dc   / 1e6,
      grossProfit:  (d.sales - d.dc)         / 1e6,
      indirectCost: d.ic   / 1e6,
      netProfit:    (d.sales - d.dc - d.ic)  / 1e6,
    }))

  // Global KPIs
  const totalSales     = recon.reduce((s, r) => s + Number(r.expected_cash_lbp), 0)
  const totalDC        = recon.reduce((s, r) => s + (batchDC.get(r.batch_id) ?? 0), 0)
  const totalIC        = expenses.reduce((s, e) => s + Number(e.amount_lbp), 0)
  const grossProfit    = totalSales - totalDC
  const netProfit      = grossProfit - totalIC
  const grossMarginPct = totalSales > 0 ? (grossProfit / totalSales * 100) : 0
  const netMarginPct   = totalSales > 0 ? (netProfit   / totalSales * 100) : 0
  const breakEvenSales = grossMarginPct > 0 ? totalIC / (grossMarginPct / 100) : 0

  // Per-school P&L
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

  // Expense categories
  const catMap = new Map<string, number>()
  for (const exp of expenses) catMap.set(exp.category, (catMap.get(exp.category) ?? 0) + Number(exp.amount_lbp))
  const categoryData: CategoryBreakdown[] = Array.from(catMap.entries()).map(([cat, amt]) => ({
    name:  CATEGORY_LABELS[cat] ?? cat,
    value: amt / 1e6,
    color: CATEGORY_COLORS[cat] ?? '#94a3b8',
  }))

  // P&L table rows (descending)
  const plTable = Array.from(weekMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([week, d]) => {
      const gp = d.sales - d.dc
      const np = gp - d.ic
      return {
        week,
        sales: d.sales, dc: d.dc, gp, ic: d.ic, np,
        gm: d.sales > 0 ? (gp / d.sales * 100) : 0,
        nm: d.sales > 0 ? (np / d.sales * 100) : 0,
      }
    })

  const hasData = recon.length > 0 || expenses.length > 0

  return (
    <div className="p-8 space-y-8" style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profit &amp; Loss Report</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {recon.length} reconciled batches · {expenses.length} expense entries
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
          <PlusCircle size={15} className="text-indigo-500" /> Add Expense
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard label="Total Sales"   value={formatLBP(totalSales)}  sub="Gross revenue"            accent="#f59e0b" />
        <KPICard label="Direct Cost"   value={formatLBP(totalDC)}     sub={`${grossMarginPct.toFixed(1)}% gross margin`} accent="#ef4444" />
        <KPICard label="Gross Profit"  value={formatLBP(grossProfit)} sub="After product costs"      accent="#10b981" positive={grossProfit} />
        <KPICard label="Indirect Cost" value={formatLBP(totalIC)}     sub="Salaries, bills…"         accent="#6366f1" />
        <KPICard label="Net Profit"    value={formatLBP(netProfit)}   sub={`${netMarginPct.toFixed(1)}% net margin`} accent={netProfit >= 0 ? '#06b6d4' : '#ef4444'} positive={netProfit} />
      </div>

      {/* Break-Even */}
      {totalSales > 0 && grossMarginPct > 0 && (
        <BreakEvenCard breakEvenSales={breakEvenSales} totalSales={totalSales} grossMarginPct={grossMarginPct} />
      )}

      {/* Charts */}
      {hasData ? (
        <ProfitCharts
          weeklyData={weeklyData}
          schoolData={schoolData}
          categoryData={categoryData}
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

function KPICard({ label, value, sub, accent, positive }: {
  label: string; value: string; sub: string; accent: string; positive?: number
}) {
  const numColor = positive === undefined ? '#111827' : positive >= 0 ? '#10b981' : '#ef4444'
  return (
    <div className="bg-white rounded-2xl p-5" style={{
      borderTop: `4px solid ${accent}`, border: '1px solid #e5e7eb', borderTopColor: accent,
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    }}>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{label}</p>
      <p className="text-lg font-bold leading-tight" style={{ color: numColor }}>{value}</p>
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
  const isAbove      = totalSales >= breakEvenSales
  const safety       = totalSales - breakEvenSales
  const barMax       = Math.max(totalSales, breakEvenSales) * 1.1 || 1
  const bePct        = Math.min(96, (breakEvenSales / barMax) * 100)
  const sPct         = Math.min(96, (totalSales     / barMax) * 100)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139,92,246,0.28)',
          }}>
            <Target size={20} color="white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Break-Even Analysis</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              At {grossMarginPct.toFixed(1)}% gross margin — need {formatLBP(breakEvenSales)} in sales to cover all indirect costs
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
          ${isAbove ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
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
      {/* Gauge */}
      <div style={{ height: 28, background: '#f3f4f6', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%', width: `${sPct}%`, borderRadius: 14,
          background: isAbove ? 'linear-gradient(90deg,#fde68a,#34d399)' : 'linear-gradient(90deg,#fde68a,#fca5a5)',
        }} />
        <div style={{ position: 'absolute', left: `${bePct}%`, top: 0, height: '100%', width: 3, background: '#8b5cf6', transform: 'translateX(-1px)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: '#9ca3af' }}>
        <span>0</span>
        <span style={{ color: '#8b5cf6', fontWeight: 600 }}>▲ Break-even</span>
        <span>Current sales →</span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
        style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
        <BarChart2 size={28} className="text-blue-600" />
      </div>
      <p className="text-gray-700 font-semibold text-lg">No data yet</p>
      <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
        Create reconciled weekly batches and add expense entries to generate your P&amp;L report.
      </p>
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
