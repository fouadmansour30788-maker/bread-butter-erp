'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Chocolate', 'Snacks', 'Drinks', 'Bakery', 'Meals']

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Snacks')
  const [weight, setWeight] = useState('')
  const [qtyPerBox, setQtyPerBox] = useState('')
  const [costUsd, setCostUsd] = useState('')
  const [saleLbp, setSaleLbp] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Product name is required'); return }
    if (!costUsd || !saleLbp || !qtyPerBox) { setError('All price and quantity fields are required'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('products').insert({
      name: name.trim(),
      category,
      weight: weight.trim() || null,
      qty_per_box: Number(qtyPerBox),
      cost_price_usd: Number(costUsd),
      selling_price_lbp: Number(saleLbp),
    })
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/admin/products')
  }

  const costLbp = costUsd ? Number(costUsd) * 90000 : 0
  const profitLbp = saleLbp ? Number(saleLbp) - costLbp : 0
  const margin = saleLbp && profitLbp ? ((profitLbp / Number(saleLbp)) * 100).toFixed(0) : '—'

  return (
    <div className="p-8 max-w-lg" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Product</h2>
          <p className="text-gray-500 text-sm mt-0.5">Add a new item to the catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Twix" dir="rtl" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 45g, 330ml" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Qty per Box <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={qtyPerBox} onChange={e => setQtyPerBox(e.target.value)} placeholder="e.g. 24" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cost Price (USD/unit) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" min="0" value={costUsd} onChange={e => setCostUsd(e.target.value)} placeholder="0.44" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sale Price (LBP/unit) <span className="text-red-500">*</span></label>
              <input type="number" min="0" value={saleLbp} onChange={e => setSaleLbp(e.target.value)} placeholder="100000" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
            </div>
          </div>
        </div>

        {/* Live margin preview */}
        {costUsd && saleLbp && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Profit Preview</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Cost (LBP)</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{Math.round(costLbp).toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Profit</p>
                <p className="font-bold text-green-600 text-sm mt-0.5">{Math.round(profitLbp).toLocaleString()}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Margin</p>
                <p className="font-bold text-amber-600 text-sm mt-0.5">{margin}%</p>
              </div>
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <Link href="/admin/products" className="flex-1 text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {saving ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
