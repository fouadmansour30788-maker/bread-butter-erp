'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatLBP } from '@/lib/utils'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

type ItemRow = {
  delivery_id: string
  product_id: string
  product_name: string
  selling_price_lbp: number
  delivered_qty: number
  remaining_qty: number
  waste_qty: number
  waste_reason: string
}

export default function ReconciliationEntryPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [batch, setBatch] = useState<{ school_name: string; week_start: string; week_end: string; status: string } | null>(null)
  const [items, setItems] = useState<ItemRow[]>([])
  const [cashCollected, setCashCollected] = useState('')
  const [cashReceivedBy, setCashReceivedBy] = useState('')
  const [countedBy, setCountedBy] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: b } = await supabase
        .from('weekly_batches')
        .select('status, week_start, week_end, school:schools(name)')
        .eq('id', id)
        .single()
      if (b) setBatch({ school_name: (b.school as unknown as { name: string })?.name, week_start: b.week_start, week_end: b.week_end, status: b.status })

      const { data: deliveries } = await supabase
        .from('delivery_items')
        .select('id, product_id, delivered_qty, product:products(name, selling_price_lbp)')
        .eq('batch_id', id)

      const { data: existingCounts } = await supabase.from('closing_counts').select('*').eq('batch_id', id)
      const { data: existingWaste } = await supabase.from('waste_entries').select('*').eq('batch_id', id)
      const { data: existingCash } = await supabase.from('cash_collections').select('*').eq('batch_id', id).maybeSingle()

      const countMap = Object.fromEntries((existingCounts ?? []).map(c => [c.product_id, c.remaining_qty]))
      const wasteMap: Record<string, { qty: number; reason: string }> = {}
      for (const w of existingWaste ?? []) wasteMap[w.product_id] = { qty: w.waste_qty, reason: w.reason ?? '' }

      setItems((deliveries ?? []).map(d => {
        const p = d.product as unknown as { name: string; selling_price_lbp: number } | null
        return {
          delivery_id: d.id,
          product_id: d.product_id,
          product_name: p?.name ?? '—',
          selling_price_lbp: p?.selling_price_lbp ?? 0,
          delivered_qty: d.delivered_qty,
          remaining_qty: countMap[d.product_id] ?? 0,
          waste_qty: wasteMap[d.product_id]?.qty ?? 0,
          waste_reason: wasteMap[d.product_id]?.reason ?? '',
        }
      }))

      if (existingCash) {
        setCashCollected(String(existingCash.amount_collected_lbp))
        setCashReceivedBy(existingCash.received_by ?? '')
      }
    }
    load()
  }, [id])

  function updateItem(index: number, field: keyof ItemRow, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const sold = items.map(i => Math.max(0, i.delivered_qty - i.remaining_qty - i.waste_qty))
  const expectedCash = items.reduce((sum, item, i) => sum + sold[i] * item.selling_price_lbp, 0)
  const actualCash = Number(cashCollected) || 0
  const variance = expectedCash - actualCash

  async function handleSave(closeWeek = false) {
    setSaving(true)
    const supabase = createClient()

    await supabase.from('closing_counts').delete().eq('batch_id', id)
    await supabase.from('waste_entries').delete().eq('batch_id', id)
    await supabase.from('cash_collections').delete().eq('batch_id', id)

    const counts = items.map(item => ({ batch_id: id, product_id: item.product_id, remaining_qty: item.remaining_qty, counted_by: countedBy || null }))
    const wastes = items.filter(i => i.waste_qty > 0).map(item => ({ batch_id: id, product_id: item.product_id, waste_qty: item.waste_qty, reason: item.waste_reason || null }))

    if (counts.length > 0) await supabase.from('closing_counts').insert(counts)
    if (wastes.length > 0) await supabase.from('waste_entries').insert(wastes)
    if (cashCollected) await supabase.from('cash_collections').insert({ batch_id: id, amount_collected_lbp: actualCash, received_by: cashReceivedBy || null })

    await supabase.from('weekly_batches').update({ status: closeWeek ? 'closed' : 'counted' }).eq('id', id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push(`/admin/batches/${id}`), 800)
  }

  if (!batch) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/batches/${id}`} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Closing Count — {batch.school_name}</h2>
          <p className="text-gray-500 text-sm">{batch.week_start} → {batch.week_end}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <label className="block text-sm text-gray-600 mb-1">Counted by</label>
        <input type="text" value={countedBy} onChange={e => setCountedBy(e.target.value)} placeholder="Name of person counting" className="w-64 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Item Count</h3>
          <p className="text-gray-500 text-xs mt-0.5">Enter remaining qty and waste for each item</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Delivered</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Remaining</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Waste</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Waste Reason</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Sold</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-900 text-sm font-medium" dir="rtl">{item.product_name}</td>
                <td className="px-4 py-2.5 text-center text-gray-500">{item.delivered_qty}</td>
                <td className="px-4 py-2.5">
                  <input
                    type="number" min="0" max={item.delivered_qty}
                    value={item.remaining_qty}
                    onChange={e => updateItem(i, 'remaining_qty', Number(e.target.value))}
                    className="w-20 bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm text-center focus:outline-none focus:border-amber-500 mx-auto block"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number" min="0"
                    value={item.waste_qty || ''}
                    onChange={e => updateItem(i, 'waste_qty', Number(e.target.value))}
                    className="w-20 bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm text-center focus:outline-none focus:border-red-400 mx-auto block"
                  />
                </td>
                <td className="px-4 py-2.5">
                  {item.waste_qty > 0 && (
                    <input
                      type="text"
                      placeholder="Reason..."
                      value={item.waste_reason}
                      onChange={e => updateItem(i, 'waste_reason', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:outline-none focus:border-amber-500"
                    />
                  )}
                </td>
                <td className="px-4 py-2.5 text-center font-medium text-amber-600">{sold[i]}</td>
                <td className="px-4 py-2.5 text-right text-green-600 text-xs">{formatLBP(sold[i] * item.selling_price_lbp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-gray-900">Cash Collection</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Amount Collected (LBP)</label>
            <input type="number" min="0" value={cashCollected} onChange={e => setCashCollected(e.target.value)} placeholder="0" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Received By</label>
            <input type="text" value={cashReceivedBy} onChange={e => setCashReceivedBy(e.target.value)} placeholder="Name" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Expected Cash</span>
            <span className="font-medium">{formatLBP(expectedCash)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Collected Cash</span>
            <span className="font-medium">{formatLBP(actualCash)}</span>
          </div>
          <div className={`flex justify-between font-bold pt-2 border-t border-gray-200 ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            <span>Variance</span>
            <span>{variance === 0 ? '✓ All clear' : (variance > 0 ? '+' : '') + formatLBP(variance)}</span>
          </div>
        </div>
      </div>

      {saved && <p className="text-green-600 text-sm font-medium">Saved successfully!</p>}

      <div className="flex gap-3">
        <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
          <Save size={15} /> Save Draft
        </button>
        <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
          Close Week
        </button>
      </div>
    </div>
  )
}
