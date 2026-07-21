import { createClient } from '@/lib/supabase/server'
import { ArrowRightLeft, Plus } from 'lucide-react'
import Link from 'next/link'

function fmtBoxes(qty: number, qtyPerBox: number): string {
  if (qtyPerBox <= 1) return `${qty} units`
  const boxes = Math.floor(qty / qtyPerBox)
  const units = qty % qtyPerBox
  if (boxes === 0) return `${units} units`
  if (units === 0) return `${boxes} box${boxes !== 1 ? 'es' : ''}`
  return `${boxes}b + ${units}`
}

export default async function TransfersPage() {
  const supabase = await createClient()

  const { data: transfers } = await supabase
    .from('stock_transfers')
    .select('*, product:products(name,qty_per_box), from_batch:weekly_batches!from_batch_id(week_start,school:schools(name)), to_batch:weekly_batches!to_batch_id(week_start,school:schools(name))')
    .order('transferred_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Transfers</h2>
          <p className="text-gray-500 text-sm mt-1">Move stock between kiosks / schools</p>
        </div>
        <Link href="/admin/transfers/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> New Transfer
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {!transfers || transfers.length === 0 ? (
          <div className="p-16 text-center">
            <ArrowRightLeft size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No transfers yet</p>
            <p className="text-gray-400 text-sm mt-1">Use &quot;New Transfer&quot; to move stock between schools.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">From</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">To</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Qty</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => {
                const fromBatch = t.from_batch as { week_start: string; school: { name: string } } | null
                const toBatch   = t.to_batch   as { week_start: string; school: { name: string } } | null
                const product   = t.product    as { name: string; qty_per_box: number } | null
                return (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(t.transferred_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900">{fromBatch?.school?.name ?? '—'}</div>
                      <div className="text-xs text-gray-400">{fromBatch?.week_start}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900">{toBatch?.school?.name ?? '—'}</div>
                      <div className="text-xs text-gray-400">{toBatch?.week_start}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-900" dir="rtl">{product?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="font-semibold text-gray-900">{t.qty}</span>
                      {product && product.qty_per_box > 1 && (
                        <span className="text-gray-400 text-xs ml-1">({fmtBoxes(t.qty, product.qty_per_box)})</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{t.notes ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
