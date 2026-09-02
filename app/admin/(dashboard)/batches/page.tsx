import { createClient } from '@/lib/supabase/server'
import { getWeekRange } from '@/lib/utils'
import { Plus, Truck } from 'lucide-react'
import Link from 'next/link'

export default async function BatchesPage({ searchParams }: { searchParams: Promise<{ school?: string }> }) {
  const { school: schoolFilter } = await searchParams
  const supabase = await createClient()

  const { data: schools } = await supabase.from('schools').select('*').eq('is_active', true).order('name')

  let query = supabase
    .from('weekly_batches')
    .select('*, school:schools(name)')
    .order('week_start', { ascending: false })
  if (schoolFilter) query = query.eq('school_id', schoolFilter)
  const { data: batches } = await query

  const { week_start, week_end } = getWeekRange()

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Batches</h2>
          <p className="text-gray-500 text-sm mt-1">Current week: {week_start} → {week_end}</p>
        </div>
        <Link href="/admin/batches/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> New Batch
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href="/admin/batches" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!schoolFilter ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          All Schools
        </Link>
        {schools?.map((s) => (
          <Link key={s.id} href={`/admin/batches?school=${s.id}`} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${schoolFilter === s.id ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s.name}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {batches?.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Truck size={32} className="mx-auto mb-3 text-gray-300" />
            <p>No batches found.</p>
            <Link href="/admin/batches/new" className="text-amber-600 hover:underline mt-2 inline-block">Create first weekly batch →</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">School</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Kiosk</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Week</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Driver</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Staff</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {batches?.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{(b.school as { name: string })?.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium">{b.kiosk_label ?? 'Main'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{b.week_start} → {b.week_end}</td>
                  <td className="px-5 py-3.5 text-center"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-3.5 text-gray-500">{b.delivery_signed_driver ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500">{b.delivery_signed_staff ?? '—'}</td>
                  <td className="px-5 py-3.5 flex gap-3">
                    <Link href={`/admin/batches/${b.id}`} className="text-xs text-amber-600 hover:underline">Manage</Link>
                    <Link href={`/admin/reconciliation/${b.id}`} className="text-xs text-blue-600 hover:underline">Reconcile</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700',
    counted: 'bg-amber-50 text-amber-700',
    closed: 'bg-green-50 text-green-700',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}
