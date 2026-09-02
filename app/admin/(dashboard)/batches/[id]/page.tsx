import { createClient } from '@/lib/supabase/server'
import { formatLBP } from '@/lib/utils'
import { ArrowLeft, CheckCircle, ArrowRightLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function fmtBoxes(qty: number, qtyPerBox: number): string {
  if (qtyPerBox <= 1) return `${qty} units`
  const boxes = Math.floor(qty / qtyPerBox)
  const units = qty % qtyPerBox
  if (boxes === 0) return `${units} units`
  if (units === 0) return `${boxes} box${boxes !== 1 ? 'es' : ''}`
  return `${boxes}b + ${units}`
}

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: batch } = await supabase
    .from('weekly_batches')
    .select('*, school:schools(name)')
    .eq('id', id)
    .single()

  if (!batch) notFound()

  const [{ data: deliveryItems }, { data: closingCounts }, { data: wasteEntries }, { data: cashCollection }, { data: transfers }] = await Promise.all([
    supabase.from('delivery_items').select('*, product:products(*)').eq('batch_id', id),
    supabase.from('closing_counts').select('*, product:products(*)').eq('batch_id', id),
    supabase.from('waste_entries').select('*, product:products(*)').eq('batch_id', id),
    supabase.from('cash_collections').select('*').eq('batch_id', id).maybeSingle(),
    supabase.from('stock_transfers')
      .select('*, product:products(name,qty_per_box), from_batch:weekly_batches!from_batch_id(week_start,school:schools(name)), to_batch:weekly_batches!to_batch_id(week_start,school:schools(name))')
      .or(`from_batch_id.eq.${id},to_batch_id.eq.${id}`)
      .order('transferred_at', { ascending: false }),
  ])

  const closingMap = Object.fromEntries((closingCounts ?? []).map(c => [c.product_id, c.remaining_qty]))
  const wasteMap: Record<string, number> = {}
  for (const w of (wasteEntries ?? [])) {
    wasteMap[w.product_id] = (wasteMap[w.product_id] ?? 0) + w.waste_qty
  }

  let expectedCash = 0
  const rows = (deliveryItems ?? []).map((item) => {
    const product = item.product as { id: string; name: string; qty_per_box: number; cost_price_usd: number; selling_price_lbp: number } | null
    const remaining = closingMap[item.product_id] ?? null
    const waste = wasteMap[item.product_id] ?? 0
    const sold = remaining !== null ? item.delivered_qty - remaining - waste : null
    const revenueLbp = sold !== null && product ? sold * product.selling_price_lbp : 0
    expectedCash += revenueLbp
    return { item, product, remaining, waste, sold, revenueLbp }
  })

  const actualCash = cashCollection?.amount_collected_lbp ?? 0
  const variance = expectedCash - actualCash

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/batches" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {(batch.school as { name: string })?.name}
            <span className="ml-2 text-base font-medium text-amber-600">· {batch.kiosk_label ?? 'Main'}</span>
          </h2>
          <p className="text-gray-500 text-sm">{batch.week_start} → {batch.week_end} · <StatusText status={batch.status} /></p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Delivery Sign-off</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Driver signed: </span>
            <span className={batch.delivery_signed_driver ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {batch.delivery_signed_driver ?? 'Not signed'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Staff signed: </span>
            <span className={batch.delivery_signed_staff ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {batch.delivery_signed_staff ?? 'Not signed'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Items Reconciliation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Product</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Delivered</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Remaining</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Waste</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Sold</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Revenue (LBP)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, product, remaining, waste, sold, revenueLbp }) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900" dir="rtl">{product?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{item.delivered_qty}</td>
                  <td className="px-5 py-3 text-center">
                    {remaining !== null ? (
                      <span className="text-gray-700">
                        {remaining}
                        {product && product.qty_per_box > 1 && (
                          <span className="text-gray-400 text-xs ml-1">({fmtBoxes(remaining, product.qty_per_box)})</span>
                        )}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {waste > 0 ? <span className="text-red-500">{waste}</span> : <span className="text-gray-300">0</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {sold !== null ? <span className="text-amber-600 font-medium">{sold}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right text-green-600">{revenueLbp > 0 ? formatLBP(revenueLbp) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={5} className="px-5 py-3 font-medium text-gray-600">Expected Cash</td>
                <td className="px-5 py-3 text-right font-bold text-gray-900">{formatLBP(expectedCash)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td colSpan={5} className="px-5 py-2 font-medium text-gray-600">Collected Cash</td>
                <td className="px-5 py-2 text-right font-bold text-gray-900">{formatLBP(actualCash)}</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td colSpan={5} className="px-5 py-3 font-semibold text-gray-900">Variance</td>
                <td className={`px-5 py-3 text-right font-bold text-lg ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {variance === 0 ? '✓ Clear' : (variance > 0 ? '+' : '') + formatLBP(variance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Transfers */}
      {(transfers ?? []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200 flex items-center gap-2">
            <ArrowRightLeft size={15} className="text-amber-600" />
            <h3 className="font-semibold text-gray-900">Stock Transfers</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {(transfers ?? []).map((t) => {
              const isOut = t.from_batch_id === id
              const otherBatch = isOut
                ? (t.to_batch as { week_start: string; school: { name: string } } | null)
                : (t.from_batch as { week_start: string; school: { name: string } } | null)
              const product = t.product as { name: string; qty_per_box: number } | null
              return (
                <div key={t.id} className="px-5 py-3 flex items-center gap-4 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isOut ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {isOut ? '↑ Out' : '↓ In'}
                  </span>
                  <span className="font-medium text-gray-900" dir="rtl">{product?.name ?? '—'}</span>
                  <span className="text-gray-500">
                    {t.qty} units
                    {product && product.qty_per_box > 1 && (
                      <span className="text-gray-400 ml-1">({fmtBoxes(t.qty, product.qty_per_box)})</span>
                    )}
                  </span>
                  <span className="text-gray-400">{isOut ? '→' : '←'} {otherBatch?.school?.name}</span>
                  {t.notes && <span className="text-gray-400 italic">{t.notes}</span>}
                  <span className="ml-auto text-gray-400 text-xs">{new Date(t.transferred_at).toLocaleDateString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link href={`/admin/reconciliation/${id}`} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <CheckCircle size={16} /> Enter Closing Count & Cash
        </Link>
        <Link href={`/admin/transfers/new?from=${id}`} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <ArrowRightLeft size={16} /> Transfer Stock
        </Link>
      </div>
    </div>
  )
}

function StatusText({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'text-blue-600',
    counted: 'text-amber-600',
    closed: 'text-green-600',
  }
  return <span className={`font-medium text-sm ${map[status] ?? 'text-gray-500'}`}>{status}</span>
}
