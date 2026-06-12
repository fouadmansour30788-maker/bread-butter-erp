'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

export default function EditSchoolPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('schools').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setName(data.name)
        setLocation(data.location ?? '')
        setContactName(data.contact_name ?? '')
        setContactPhone(data.contact_phone ?? '')
        setIsActive(data.is_active)
      }
      setLoading(false)
    })
  }, [id])

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('School name is required'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('schools').update({
      name: name.trim(),
      location: location.trim() || null,
      contact_name: contactName.trim() || null,
      contact_phone: contactPhone.trim() || null,
      is_active: isActive,
    }).eq('id', id)
    if (err) { setError(err.message); setSaving(false); return }
    router.push('/schools')
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8 max-w-lg" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/schools" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit School</h2>
          <p className="text-gray-500 text-sm mt-0.5">Update kiosk location details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">School Name <span className="text-red-500">*</span></label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Tripoli" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Name</label>
          <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone</label>
          <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-700">Active</span>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-11 h-6 rounded-full transition-colors relative ${isActive ? 'bg-amber-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="flex gap-3 pt-2">
          <Link href="/schools" className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg text-sm transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
