import { createAdminClient } from '@/lib/supabase/admin'
import { SchoolApplication } from '@/lib/types'
import { ApplicationStatusSelect } from '@/components/ApplicationStatusSelect'
import { Inbox } from 'lucide-react'

// createAdminClient() doesn't touch cookies/headers, so Next can't infer this
// needs per-request data — without this it gets statically prerendered and
// new submissions from the public form would never show up without a rebuild.
export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('school_applications')
    .select('*')
    .order('created_at', { ascending: false })

  const applications = (data ?? []) as SchoolApplication[]

  return (
    <div className="p-8 space-y-6" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">School Applications</h2>
        <p className="text-gray-500 text-sm mt-0.5">Schools that applied via the public website questionnaire</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">All Applications</h3>
          <span className="text-sm text-gray-500">{applications.length} submissions</span>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <Inbox size={28} className="text-amber-600" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No applications yet</p>
            <p className="text-gray-400 text-sm mt-1">Submissions from the public website&apos;s &quot;Apply Your School&quot; form will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">School</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Contact</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Location</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-medium">Students</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Current Provider</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Submitted</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-50 hover:bg-amber-50/30 transition-colors align-top">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{app.school_name}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      <div>{app.contact_name}</div>
                      <div className="text-xs text-gray-400">{app.phone}</div>
                      <div className="text-xs text-gray-400">{app.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{app.location ?? '—'}</td>
                    <td className="px-5 py-3.5 text-right text-gray-700">{app.student_count ?? '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{app.current_provider ?? '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-center">
                      <ApplicationStatusSelect id={app.id} status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
