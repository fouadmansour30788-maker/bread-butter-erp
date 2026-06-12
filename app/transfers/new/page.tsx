'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRightLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface Batch {
  id: string
  week_start: string
  week_end: string
  school: { name: string }
}

interface Product {
  id: string
  name: string
  qty_per_box: number
}

function NewTransferForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedFrom = searchParams.get('from') ?? ''

  const [batches,    setBatches]    = useState<Batch[]>([])
  const [products,   setProducts]   = useState<Product[]>([])
  const [fromBatch,  setFromBatch]  = useState(preselectedFrom)
  const [toBatch,    setToBatch]    = useState('')
  const [productId,  setProductId]  = useState('')
  const [qty,        setQty]        = useState('')
  const [notes,      setNotes]      = useState('')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(true)

  // Load all open batches
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('weekly_batches')
      .select('id, week_start, week_end, school:schools(name)')
      .neq('status', 'closed')
      .order('week_start', { ascending: false })
      .then(({ data }) => {
        setBatches((data ?? []) as unknown as Batch[])
        setLoading(false)
      })
  }, [])

  // Load products in the selected source batch
  useEffect(() => {
    if (!fromBatch) { setProducts([]); setProductId(''); return }
    const supabase = createClient()
    supabase
      .from('delivery_items')
      .select('product:products(id, name, qty_per_box)')
      .eq('batch_id', fromBatch)
      .then(({ data }) => {
        const prods = (data ?? []).map((d) => d.product as unknown as Product).filter(Boolean)
        setProducts(prods)
        setProductId('')
      })
  }, [fromBatch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fromBatch || !toBatch || !productId || !qty) { setError('All fields are required.'); return }
    if (fromBatch === toBatch) { setError('Source and destination must be different.'); return }
    if (Number(qty) <= 0) { setError('Quantity must be greater than 0.'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('stock_transfers').insert({
      from_batch_id: fromBatch,
      to_batch_id:   toBatch,
      product_id:    productId,
      qty:           Number(qty),
      notes:         notes.trim() || null,
    })
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/transfers')
  }

  const destBatches = batches.filter((b) => b.id !== fromBatch)
  const selectedProduct = products.find((p) => p.id === productId)

  if (loading) return <div className="p-8 text-gray-500">Loading…</div>


  return (
    <div className="p-8 max-w-lg" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/transfers" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Transfer</h2>
          <p className="text-gray-500 text-sm mt-0.5">Move stock from one school kiosk to another</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">From School <span className="text-red-500">*</span></label>
              <select value={fromBatch} onChange={e => setFromBatch(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500">
                <option value="">Select…</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.school.name} ({b.week_start})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">To School <span className="text-red-500">*</span></label>
              <select value={toBatch} onChange={e => setToBatch(e.target.value)} disabled={!fromBatch}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50">
                <option value="">Select…</option>
                {destBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.school.name} ({b.week_start})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Arrow indicator */}
          {fromBatch && toBatch && (
            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-xs font-medium text-gray-600">{batches.find(b => b.id === fromBatch)?.school.name}</span>
              <ArrowRightLeft size={14} className="text-amber-500" />
              <span className="text-xs font-medium text-gray-600">{batches.find(b => b.id === toBatch)?.school.name}</span>
            </div>
          )}

          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product <span className="text-red-500">*</span></label>
            <select value={productId} onChange={e => setProductId(e.target.value)} disabled={!fromBatch || products.length === 0}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50">
              <option value="">{products.length === 0 && fromBatch ? 'No products in this batch' : 'Select product…'}</option>
              {products.map(p => (
                <option key={p.id} value={p.id} dir="rtl">{p.name} ({p.qty_per_box}/box)</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity (units) <span className="text-red-500">*</span></label>
            <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 24"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
            {selectedProduct && qty && Number(qty) > 0 && selectedProduct.qty_per_box > 1 && (
              <p className="text-xs text-gray-400 mt-1">
                = {Math.floor(Number(qty) / selectedProduct.qty_per_box)} box{Math.floor(Number(qty) / selectedProduct.qty_per_box) !== 1 ? 'es' : ''}
                {Number(qty) % selectedProduct.qty_per_box > 0 && ` + ${Number(qty) % selectedProduct.qty_per_box} units`}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for transfer…"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <Link href="/transfers" className="flex-1 text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            <ArrowRightLeft size={14} />
            {saving ? 'Saving…' : 'Record Transfer'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewTransferPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading…</div>}>
      <NewTransferForm />
    </Suspense>
  )
}
