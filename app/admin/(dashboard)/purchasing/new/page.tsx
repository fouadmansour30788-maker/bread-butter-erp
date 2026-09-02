'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatUSD } from '@/lib/utils'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/types'

type LineItem = { product_id: string; quantity: number }

export default function NewPurchaseOrderPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [supplierName, setSupplierName] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('products').select('*').eq('is_active', true).order('category').order('name').then(({ data }) => setProducts(data ?? []))
  }, [])

  function addItem() {
    setItems([...items, { product_id: '', quantity: 0 }])
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  const usedProductIds = new Set(items.map(i => i.product_id))
  const productById = Object.fromEntries(products.map(p => [p.id, p]))
  const grandTotal = items.reduce((sum, i) => {
    const p = productById[i.product_id]
    return sum + (p ? Number(p.cost_price_usd) * Number(i.quantity || 0) : 0)
  }, 0)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!supplierName.trim()) { setError('Supplier name is required'); return }
    const validItems = items.filter(i => i.product_id && i.quantity > 0)
    if (validItems.length === 0) { setError('Add at least one item with a quantity'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { data: po, error: poErr } = await supabase
      .from('purchase_orders')
      .insert({ supplier_name: supplierName.trim(), notes: notes.trim() || null })
      .select()
      .single()

    if (poErr || !po) { setError(poErr?.message ?? 'Failed to create purchase order'); setSaving(false); return }

    const poItems = validItems.map(i => {
      const p = productById[i.product_id]
      return {
        purchase_order_id: po.id,
        product_id: i.product_id,
        product_name: p?.name ?? '—',
        quantity: Number(i.quantity),
        unit_cost_usd: Number(p?.cost_price_usd ?? 0),
      }
    })
    await supabase.from('purchase_order_items').insert(poItems)

    router.push('/admin/purchasing')
  }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/purchasing" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Purchase Order</h2>
          <p className="text-gray-500 text-sm mt-0.5">Cost auto-fills from your product catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Order Details</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Supplier Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={supplierName}
              onChange={e => setSupplierName(e.target.value)}
              placeholder="e.g. Al-Amir Distributors"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional delivery instructions or notes"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Items</h3>
            <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={13} /> Add Item
            </button>
          </div>

          {items.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No items added yet. Click &quot;Add Item&quot; to start.</p>
          )}

          <div className="space-y-2">
            {items.map((item, index) => {
              const p = productById[item.product_id]
              const lineTotal = p ? Number(p.cost_price_usd) * Number(item.quantity || 0) : 0
              return (
                <div key={index} className="flex gap-3 items-center">
                  <select
                    value={item.product_id}
                    onChange={e => updateItem(index, 'product_id', e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select product...</option>
                    {products.filter(pr => pr.id === item.product_id || !usedProductIds.has(pr.id)).map(pr => (
                      <option key={pr.id} value={pr.id}>{pr.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={item.quantity || ''}
                    onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                    className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500"
                  />
                  <span className="w-24 text-right text-xs text-gray-500">{p ? formatUSD(Number(p.cost_price_usd)) + ' ea' : '—'}</span>
                  <span className="w-24 text-right text-sm font-semibold text-gray-900">{formatUSD(lineTotal)}</span>
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>

          {items.length > 0 && (
            <div className="flex justify-end pt-3 border-t border-gray-100">
              <div className="text-sm">
                <span className="text-gray-500 mr-3">Grand Total</span>
                <span className="font-bold text-gray-900 text-base">{formatUSD(grandTotal)}</span>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
          {saving ? 'Creating...' : 'Create Purchase Order'}
        </button>
      </form>
    </div>
  )
}
