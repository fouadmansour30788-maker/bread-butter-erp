import { createClient } from '@/lib/supabase/server'
import { formatLBP } from '@/lib/utils'
import Link from 'next/link'

export default async function ReconciliationPage() {
  const supabase = await createClient()
  const { data: summaries } = await supabase
    .from('reconciliation_summary')
    .select('*')
    .order('week_start', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reconciliation</h2>
        <p className="text-gray-500 text-sm mt-1">Expected vs collected cash per school per week</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-gray-500 font-medium">School</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Week</th>
              <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Delivered Value</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Expected Cash</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Collected</th>
              <th className="text-right px-5 py-3 text-gray-500 font-medium">Variance</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {summaries?.map((s) => {
              const variance = Number(s.variance_lbp)
              const isAlert = variance > 50000
              return (
                <tr key={s.batch_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{s.school_name}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{s.week_start} → {s.week_end}</td>
                  <td className="px-5 py-3.5 text-center"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3.5 text-right text-gray-500">{formatLBP(Number(s.total_value_delivered_lbp))}</td>
                  <td className="px-5 py-3.5 text-right text-gray-700">{formatLBP(Number(s.expected_cash_lbp))}</td>
                  <td className="px-5 py-3.5 text-right text-gray-700">{formatLBP(Number(s.actual_cash_lbp))}</td>
                  <td className={`px-5 py-3.5 text-right font-semibold ${isAlert ? 'text-red-600' : variance === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                    {variance === 0 ? '✓' : (variance > 0 ? '+' : '') + formatLBP(variance)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/reconciliation/${s.batch_id}`} className="text-xs text-amber-600 hover:underline">Enter</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!summaries?.length && (
          <div className="p-10 text-center text-gray-400">No batches to reconcile yet.</div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700',
    counted: 'bg-amber-50 text-amber-700',
    closed: 'bg-green-50 text-green-700',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}
