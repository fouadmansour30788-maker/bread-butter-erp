import { createClient } from '@/lib/supabase/server'
import { formatLBP } from '@/lib/utils'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: summaries } = await supabase
    .from('reconciliation_summary')
    .select('*')
    .eq('status', 'closed')
    .order('week_start', { ascending: false })

  const { data: waste } = await supabase
    .from('waste_entries')
    .select('*, product:products(name, selling_price_lbp)')
    .order('logged_at', { ascending: false })
    .limit(50)

  const totalExpected = summaries?.reduce((a, s) => a + Number(s.expected_cash_lbp), 0) ?? 0
  const totalCollected = summaries?.reduce((a, s) => a + Number(s.actual_cash_lbp), 0) ?? 0
  const totalVariance = totalExpected - totalCollected

  const wasteByProduct: Record<string, { name: string; qty: number; lbp: number }> = {}
  for (const w of (waste ?? [])) {
    const p = w.product as { name: string; selling_price_lbp: number } | null
    if (!p) continue
    if (!wasteByProduct[w.product_id]) wasteByProduct[w.product_id] = { name: p.name, qty: 0, lbp: 0 }
    wasteByProduct[w.product_id].qty += w.waste_qty
    wasteByProduct[w.product_id].lbp += w.waste_qty * p.selling_price_lbp
  }
  const topWaste = Object.values(wasteByProduct).sort((a, b) => b.lbp - a.lbp).slice(0, 10)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-500 text-sm mt-1">Closed batches summary</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-gray-500 text-sm">Total Expected (closed)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatLBP(totalExpected)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-gray-500 text-sm">Total Collected</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatLBP(totalCollected)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-gray-500 text-sm">Total Variance</p>
          <p className={`text-2xl font-bold mt-1 ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {totalVariance === 0 ? 'Clear' : (totalVariance > 0 ? '+' : '') + formatLBP(totalVariance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Closed Batches</h3>
          </div>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-gray-500 font-medium">School</th>
                  <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Week</th>
                  <th className="text-right px-4 py-2.5 text-gray-500 font-medium">Variance</th>
                </tr>
              </thead>
              <tbody>
                {summaries?.map((s) => {
                  const v = Number(s.variance_lbp)
                  return (
                    <tr key={s.batch_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-900 text-xs">{s.school_name}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{s.week_start}</td>
                      <td className={`px-4 py-2.5 text-right text-xs font-medium ${v > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {v === 0 ? '✓' : formatLBP(v)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!summaries?.length && <p className="p-5 text-center text-gray-400 text-sm">No closed batches yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Top Waste Items</h3>
          </div>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Product</th>
                  <th className="text-center px-4 py-2.5 text-gray-500 font-medium">Qty</th>
                  <th className="text-right px-4 py-2.5 text-gray-500 font-medium">Value Lost</th>
                </tr>
              </thead>
              <tbody>
                {topWaste.map((w) => (
                  <tr key={w.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-900 text-xs" dir="rtl">{w.name}</td>
                    <td className="px-4 py-2.5 text-center text-red-500 text-xs">{w.qty}</td>
                    <td className="px-4 py-2.5 text-right text-red-500 text-xs">{formatLBP(w.lbp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!topWaste.length && <p className="p-5 text-center text-gray-400 text-sm">No waste recorded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
