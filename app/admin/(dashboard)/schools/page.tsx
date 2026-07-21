import { createClient } from '@/lib/supabase/server'
import { School, Phone, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function SchoolsPage() {
  const supabase = await createClient()
  const { data: schools } = await supabase.from('schools').select('*').order('name')

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schools</h2>
          <p className="text-gray-500 text-sm mt-1">{schools?.length ?? 0} school kiosks registered</p>
        </div>
        <Link href="/admin/schools/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Add School
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {schools?.map((school) => (
          <div key={school.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                <School size={18} className="text-amber-600" />
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${school.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {school.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{school.name}</h3>
              {school.location && (
                <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <MapPin size={13} /> {school.location}
                </p>
              )}
              {school.contact_name && (
                <p className="text-sm text-gray-500 mt-0.5">{school.contact_name}</p>
              )}
              {school.contact_phone && (
                <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                  <Phone size={13} /> {school.contact_phone}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Link href={`/schools/${school.id}/edit`} className="flex-1 text-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition-colors">
                Edit
              </Link>
              <Link href={`/batches?school=${school.id}`} className="flex-1 text-center text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 py-1.5 rounded-lg transition-colors">
                View Batches
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
