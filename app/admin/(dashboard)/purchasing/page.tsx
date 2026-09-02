import { createClient } from '@/lib/supabase/server'
import { formatUSD } from '@/lib/utils'
import { PlusCircle, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { DeletePurchaseOrderButton } from '@/components/DeletePurchaseOrderButton'

export default async function PurchasingPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('purchase_orders')
    .select('*, purchase_order_items(quantity, unit_cost_usd)')
    .order('created_at', { ascending: false })

  const rows = (orders ?? []).map(po => {
    const items = (po.purchase_order_items ?? []) as { quantity: number; unit_cost_usd: number }[]
    const itemCount = items.length
    const total = items.reduce((s, i) => s + i.quantity * Number(i.unit_cost_usd), 0)
    return { ...po, itemCount, total }
  })

  const grandTotal = rows.reduce((s, r) => s + r.total, 0)

  return (
    <div className="p-8 space-y-8" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchasing</h2>
          <p className="text-gray-500 text-sm mt-0.5">Create purchase orders and generate supplier-ready PDFs</p>
        </div>
        <Link
          href="/admin/purchasing/new"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.30)' }}
        >
          <PlusCircle size={16} />
          New Purchase Order
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">All Purchase Orders</h3>
          <span className="text-sm text-gray-500">{rows.length} orders</span>
        </div>

        {rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <FileText size={28} className="text-amber-600" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No purchase orders yet</p>
            <p className="text-gray-400 text-sm mt-1">Create one to restock from a supplier and generate a PDF</p>
            <Link
              href="/admin/purchasing/new"
              className="inline-flex items-center gap-2 mt-5 bg-amber-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors"
            >
              <PlusCircle size={15} /> Create First Purchase Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Supplier</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium">Items</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Total (USD)</th>
                  <th className="px-3 py-3" />
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(po => (
                  <tr key={po.id} className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(po.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-gray-900 font-medium">{po.supplier_name}</td>
                    <td className="px-5 py-3 text-center text-gray-500">{po.itemCount}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatUSD(po.total)}</td>
                    <td className="px-3 py-3">
                      <a
                        href={`/admin/purchasing/${po.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Download size={13} /> PDF
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      <DeletePurchaseOrderButton id={po.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td colSpan={3} className="px-5 py-3 font-semibold text-gray-700">Total</td>
                  <td className="px-5 py-3 text-right font-bold text-gray-900">{formatUSD(grandTotal)}</td>
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
