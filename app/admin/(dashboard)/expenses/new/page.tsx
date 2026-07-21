'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { School } from '@/lib/types'

const CATEGORIES = [
  { value: 'salary',         label: 'Salaries & Wages' },
  { value: 'electricity',    label: 'Electricity' },
  { value: 'rent',           label: 'Rent' },
  { value: 'transport',      label: 'Transport / Delivery' },
  { value: 'maintenance',    label: 'Maintenance & Repairs' },
  { value: 'marketing',      label: 'Marketing' },
  { value: 'communications', label: 'Communications' },
  { value: 'other',          label: 'Other' },
]

export default function NewExpensePage() {
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [schoolId, setSchoolId] = useState<string>('global')
  const [category, setCategory] = useState('salary')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'LBP' | 'USD'>('LBP')
  const [weekStart, setWeekStart] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('schools').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setSchools(data)
    })
    // Default week_start to last Monday
    const today = new Date()
    const day = today.getDay()
    const diffToMonday = (day === 0 ? -6 : 1 - day)
    const monday = new Date(today)
    monday.setDate(today.getDate() + diffToMonday)
    setWeekStart(monday.toISOString().split('T')[0])
  }, [])

  const amountLBP = currency === 'USD'
    ? (parseFloat(amount) || 0) * 90000
    : parseFloat(amount) || 0

  const amountDisplay = currency === 'LBP'
    ? `≈ $${(amountLBP / 90000).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD`
    : `= ${amountLBP.toLocaleString('en-LB')} LBP`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return }
    if (!weekStart) { setError('Select a week start date'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('expenses').insert({
      school_id: schoolId === 'global' ? null : schoolId,
      category,
      description: description.trim() || null,
      amount_lbp: Math.round(amountLBP),
      week_start: weekStart,
    })
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/admin/expenses')
  }

  return (
    <div className="p-8 max-w-lg" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/expenses" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
          <p className="text-gray-500 text-sm mt-0.5">Record a new indirect cost entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

          {/* Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Week Start <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(Monday)</span>
            </label>
            <input
              type="date"
              value={weekStart}
              onChange={e => setWeekStart(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Applies To</label>
            <select
              value={schoolId}
              onChange={e => setSchoolId(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="global">Company-Wide (split equally across schools)</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Driver salary - June, School 3 electricity bill"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Amount with currency toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(['LBP', 'USD'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${currency === c ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0"
                step={currency === 'USD' ? '0.01' : '1000'}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={currency === 'USD' ? '500.00' : '45,000,000'}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Live preview */}
        {amount && parseFloat(amount) > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-3">
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 4px 12px rgba(99,102,241,0.30)',
              }}>
                <DollarSign size={18} color="white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{amountLBP.toLocaleString('en-LB')} LBP</p>
                <p className="text-xs text-gray-400 mt-0.5">{amountDisplay}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex gap-3">
          <Link
            href="/admin/expenses"
            className="flex-1 text-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {saving ? 'Saving…' : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  )
}
