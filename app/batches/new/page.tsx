'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getWeekRange } from '@/lib/utils'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/types'

export default function NewBatchPage() {
  const router = useRouter()
  const { week_start, week_end } = getWeekRange()

  const [schools, setSchools] = useState<{ id: string; name: string }[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [schoolId, setSchoolId] = useState('')
  const [weekStart, setWeekStart] = useState(week_start)
  const weekEnd = week_end
  const [signedDriver, setSignedDriver] = useState('')
  const [signedStaff, setSignedStaff] = useState('')
  const [items, setItems] = useState<{ product_id: string; delivered_qty: number }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('schools').select('id, name').eq('is_active', true).order('name').then(({ data }) => setSchools(data ?? []))
    supabase.from('products').select('*').eq('is_active', true).order('category').order('name').then(({ data }) => setProducts(data ?? []))
  }, [])

  function addItem() {
    setItems([...items, { product_id: '', delivered_qty: 0 }])
  }

  function updateItem(index: number, field: string, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function addAllProducts() {
    setItems(products.map(p => ({ product_id: p.id, delivered_qty: 0 })))
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!schoolId) { setError('Select a school'); return }
    if (items.length === 0) { setError('Add at least one item'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()

    const { data: batch, error: batchErr } = await supabase
      .from('weekly_batches')
      .insert({ school_id: schoolId, week_start: weekStart, week_end: weekEnd, delivery_signed_driver: signedDriver || null, delivery_signed_staff: signedStaff || null, delivery_date: new Date().toISOString() })
      .select()
      .single()

    if (batchErr || !batch) { setError(batchErr?.message ?? 'Failed to create batch'); setSaving(false); return }

    const deliveries = items.filter(i => i.product_id).map(i => ({ batch_id: batch.id, product_id: i.product_id, delivered_qty: Number(i.delivered_qty) }))
    if (deliveries.length > 0) await supabase.from('delivery_items').insert(deliveries)

    router.push(`/batches/${batch.id}`)
  }

  const usedProductIds = new Set(items.map(i => i.product_id))

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/batches" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">New Weekly Batch</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Batch Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">School</label>
              <select value={schoolId} onChange={e => setSchoolId(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500">
                <option value="">Select school...</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Week Start</label>
              <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Driver Signature</label>
              <input type="text" placeholder="Driver name" value={signedDriver} onChange={e => setSignedDriver(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Staff Signature</label>
              <input type="text" placeholder="Staff name" value={signedStaff} onChange={e => setSignedStaff(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Delivered Items</h3>
            <div className="flex gap-2">
              <button type="button" onClick={addAllProducts} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                Add All Products
              </button>
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={13} /> Add Item
              </button>
            </div>
          </div>

          {items.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No items added yet. Click &quot;Add All Products&quot; or add individually.</p>
          )}

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <select
                  value={item.product_id}
                  onChange={e => updateItem(index, 'product_id', e.target.value)}
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select product...</option>
                  {products.filter(p => p.id === item.product_id || !usedProductIds.has(p.id)).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  placeholder="Qty (units)"
                  value={item.delivered_qty || ''}
                  onChange={e => updateItem(index, 'delivered_qty', e.target.value)}
                  className="w-32 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500"
                />
                <button type="button" onClick={() => removeItem(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
          {saving ? 'Creating...' : 'Create Batch'}
        </button>
      </form>
    </div>
  )
}
