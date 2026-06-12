import { createClient } from '@/lib/supabase/server'
import { formatLBP } from '@/lib/utils'
import { ReconciliationSummary } from '@/lib/types'
import {
  AlertTriangle, TrendingUp, School, Package,
  Truck, ClipboardCheck, BarChart2, Store
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: summaries } = await supabase
    .from('reconciliation_summary')
    .select('*')
    .order('week_start', { ascending: false })

  const { data: schools } = await supabase.from('schools').select('*').eq('is_active', true)
  const { data: products } = await supabase.from('products').select('id').eq('is_active', true)

  const latestBySchool: Record<string, ReconciliationSummary> = {}
  for (const s of (summaries ?? [])) {
    if (!latestBySchool[s.school_id]) latestBySchool[s.school_id] = s
  }
  const schoolSummaries = Object.values(latestBySchool)

  const totalExpected = schoolSummaries.reduce((a, s) => a + Number(s.expected_cash_lbp), 0)
  const totalActual = schoolSummaries.reduce((a, s) => a + Number(s.actual_cash_lbp), 0)
  const totalVariance = totalExpected - totalActual
  const alertCount = schoolSummaries.filter(s => Number(s.variance_lbp) > 50000).length

  return (
    <div className="p-8 space-y-8" style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 220, background: 'linear-gradient(110deg, #78350f 0%, #92400e 30%, #b45309 60%, #d97706 85%, #f59e0b 100%)' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Content */}
        <div className="relative z-10 p-8 h-full flex flex-col justify-between">
          <div>
            <p className="text-amber-200 text-xs font-semibold uppercase tracking-widest mb-1">Management System</p>
            <h1 className="text-2xl font-bold text-white">Bread & Butter ERP</h1>
            <p className="text-amber-100 text-sm mt-1 max-w-xs">5 school kiosks across North Lebanon — track deliveries, stock, and cash weekly.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/batches/new" className="inline-flex items-center gap-2 bg-white text-amber-800 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
              <Truck size={15} /> New Batch
            </Link>
            <Link href="/reconciliation" className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-lg transition-colors text-white" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(6px)' }}>
              <ClipboardCheck size={15} /> Reconcile
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Active Schools" value={String(schools?.length ?? 0)} icon={<School size={20} />} color="blue" />
        <KPICard label="Products" value={String(products?.length ?? 0)} icon={<Package size={20} />} color="purple" />
        <KPICard label="Expected Cash" value={formatLBP(totalExpected)} icon={<TrendingUp size={20} />} color="amber" />
        <KPICard label="Variance Alerts" value={String(alertCount)} icon={<AlertTriangle size={20} />} color={alertCount > 0 ? 'red' : 'green'} />
      </div>

      {/* Photo + feature cards row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Kiosk locations card */}
        <FeatureCard
          icon={<Store size={22} />}
          label="5 Kiosk Locations"
          sub="North Lebanon — Tripoli area schools"
          iconBg="linear-gradient(135deg, #3b82f6, #1d4ed8)"
          iconShadow="rgba(59,130,246,0.35)"
          cardBg="linear-gradient(135deg, #eff6ff, #dbeafe)"
          border="#bfdbfe"
        />

        {/* Feature card */}
        <FeatureCard
          icon={<Truck size={22} />}
          label="Weekly Deliveries"
          sub="$5,000 stock per school per week"
          iconBg="linear-gradient(135deg, #f59e0b, #b45309)"
          iconShadow="rgba(245,158,11,0.35)"
          cardBg="linear-gradient(135deg, #fffbeb, #fef3c7)"
          border="#fde68a"
        />

        {/* Feature card */}
        <FeatureCard
          icon={<BarChart2 size={22} />}
          label="Live Reconciliation"
          sub="Track cash variance per school weekly"
          iconBg="linear-gradient(135deg, #10b981, #047857)"
          iconShadow="rgba(16,185,129,0.35)"
          cardBg="linear-gradient(135deg, #ecfdf5, #d1fae5)"
          border="#a7f3d0"
        />
      </div>

      {/* School Status Table */}
      <div className="bg-white rounded-2xl border border-gray-200" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">School Reconciliation Status</h3>
          <Link href="/batches" className="text-sm text-amber-600 hover:text-amber-700 font-medium">View all batches →</Link>
        </div>
        {schoolSummaries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <Store size={28} className="text-amber-600" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No batches yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first weekly delivery batch to get started</p>
            <Link href="/batches/new" className="inline-flex items-center gap-2 mt-5 bg-amber-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-amber-400 transition-colors">
              <Truck size={15} /> Create First Batch
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">School</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Week</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Expected (LBP)</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Collected (LBP)</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Variance</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {schoolSummaries.map((s) => {
                  const variance = Number(s.variance_lbp)
                  const isAlert = variance > 50000
                  return (
                    <tr key={s.batch_id} className="border-b border-gray-50 hover:bg-amber-50/40 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{s.school_name}</td>
                      <td className="px-5 py-3.5 text-gray-500">{s.week_start} → {s.week_end}</td>
                      <td className="px-5 py-3.5 text-right text-gray-700">{formatLBP(Number(s.expected_cash_lbp))}</td>
                      <td className="px-5 py-3.5 text-right text-gray-700">{formatLBP(Number(s.actual_cash_lbp))}</td>
                      <td className={`px-5 py-3.5 text-right font-semibold ${isAlert ? 'text-red-600' : 'text-green-600'}`}>
                        {variance === 0 ? '—' : (variance > 0 ? '+' : '') + formatLBP(variance)}
                      </td>
                      <td className="px-5 py-3.5 text-center"><StatusBadge status={s.status} /></td>
                      <td className="px-5 py-3.5">
                        <Link href={`/batches/${s.batch_id}`} className="text-xs text-amber-600 hover:underline font-medium">Details</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td colSpan={2} className="px-5 py-3 text-gray-600 font-semibold">Total</td>
                  <td className="px-5 py-3 text-right font-bold text-gray-900">{formatLBP(totalExpected)}</td>
                  <td className="px-5 py-3 text-right font-bold text-gray-900">{formatLBP(totalActual)}</td>
                  <td className={`px-5 py-3 text-right font-bold ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {totalVariance === 0 ? '—' : formatLBP(totalVariance)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function FeatureCard({ icon, label, sub, iconBg, iconShadow, cardBg, border }: {
  icon: React.ReactNode; label: string; sub: string
  iconBg: string; iconShadow: string; cardBg: string; border: string
}) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4" style={{
      background: cardBg, border: `1px solid ${border}`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      height: 160,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: iconBg, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 16px ${iconShadow}, 0 2px 4px rgba(0,0,0,0.08)`,
      }}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{sub}</p>
      </div>
    </div>
  )
}

function KPICard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const styles: Record<string, { iconBg: string; shadow: string }> = {
    blue:   { iconBg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', shadow: 'rgba(59,130,246,0.25)' },
    purple: { iconBg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', shadow: 'rgba(139,92,246,0.25)' },
    green:  { iconBg: 'linear-gradient(135deg,#10b981,#047857)', shadow: 'rgba(16,185,129,0.25)' },
    amber:  { iconBg: 'linear-gradient(135deg,#f59e0b,#b45309)', shadow: 'rgba(245,158,11,0.25)' },
    red:    { iconBg: 'linear-gradient(135deg,#ef4444,#b91c1c)', shadow: 'rgba(239,68,68,0.25)' },
  }
  const s = styles[color] ?? styles.blue
  return (
    <div className="rounded-2xl p-5 bg-white" style={{ border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, marginBottom: 14,
        background: s.iconBg, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 12px ${s.shadow}`,
      }}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open:    'bg-blue-50 text-blue-700 border border-blue-100',
    counted: 'bg-amber-50 text-amber-700 border border-amber-100',
    closed:  'bg-green-50 text-green-700 border border-green-100',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}
