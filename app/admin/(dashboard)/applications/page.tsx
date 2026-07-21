import { createAdminClient } from '@/lib/supabase/admin'
import { SchoolApplication } from '@/lib/types'
import { ApplicationStatusSelect } from '@/components/ApplicationStatusSelect'
import { Inbox, Phone, Mail, MapPin, Users, Truck, CalendarDays, ShieldAlert, MessageSquare } from 'lucide-react'

// createAdminClient() doesn't touch cookies/headers, so Next can't infer this
// needs per-request data — without this it gets statically prerendered and
// new submissions from the public form would never show up without a rebuild.
export const dynamic = 'force-dynamic'

const SCHOOL_TYPE_LABELS: Record<string, string> = {
  kindergarten: 'Kindergarten',
  primary: 'Primary',
  secondary: 'Secondary',
  mixed: 'Mixed / all levels',
}

const SERVICE_LABELS: Record<string, string> = {
  brunch_box: 'Brunch Box',
  bakery_menu: 'Bakery menu',
  catering: 'Event catering',
}

const DELIVERY_LABELS: Record<string, string> = {
  daily: 'Daily',
  few_times_week: 'A few days a week',
  events_only: 'Special events only',
}

const REFERRAL_LABELS: Record<string, string> = {
  referral: 'Referral from another school',
  social_media: 'Social media',
  search: 'Search engine',
  other: 'Other',
}

export default async function ApplicationsPage() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('school_applications')
    .select('*')
    .order('created_at', { ascending: false })

  const applications = (data ?? []) as SchoolApplication[]

  return (
    <div className="p-8 space-y-6" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">School Applications</h2>
          <p className="text-gray-500 text-sm mt-0.5">Schools that applied via the public website questionnaire</p>
        </div>
        <span className="text-sm text-gray-500">{applications.length} submissions</span>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
            <Inbox size={28} className="text-amber-600" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">No applications yet</p>
          <p className="text-gray-400 text-sm mt-1">Submissions from the public website&apos;s &quot;Apply Your School&quot; form will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{app.school_name}</h3>
                    {app.school_type && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {SCHOOL_TYPE_LABELS[app.school_type] ?? app.school_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Submitted {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <ApplicationStatusSelect id={app.id} status={app.status} />
              </div>

              {/* Contact */}
              <div className="px-5 pt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-gray-700">
                <span className="flex items-center gap-1.5"><Users size={14} className="text-gray-400" /> {app.contact_name}</span>
                <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 hover:text-amber-600"><Phone size={14} className="text-gray-400" /> {app.phone}</a>
                <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 hover:text-amber-600"><Mail size={14} className="text-gray-400" /> {app.email}</a>
                {app.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {app.location}</span>}
              </div>

              {/* Body */}
              <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                <InfoRow icon={<Users size={14} />} caption="Students" value={app.student_count != null ? String(app.student_count) : '—'} />
                <InfoRow icon={<Truck size={14} />} caption="Delivery frequency" value={app.delivery_frequency ? DELIVERY_LABELS[app.delivery_frequency] : '—'} />
                <InfoRow icon={<CalendarDays size={14} />} caption="Preferred start" value={app.preferred_start_date ? new Date(app.preferred_start_date).toLocaleDateString() : '—'} />
                <InfoRow caption="Current provider" value={app.current_provider ?? '—'} />
                <InfoRow caption="Heard about us via" value={app.referral_source ? REFERRAL_LABELS[app.referral_source] : '—'} />
              </div>

              {app.services_interested?.length > 0 && (
                <div className="px-5 pb-4 flex flex-wrap gap-1.5">
                  {app.services_interested.map((s) => (
                    <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                      {SERVICE_LABELS[s] ?? s}
                    </span>
                  ))}
                </div>
              )}

              {(app.dietary_considerations || app.message) && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {app.dietary_considerations && (
                    <div className="px-5 py-3 flex items-start gap-2.5">
                      <ShieldAlert size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 leading-relaxed"><span className="font-medium text-gray-800">Dietary / allergies: </span>{app.dietary_considerations}</p>
                    </div>
                  )}
                  {app.message && (
                    <div className="px-5 py-3 flex items-start gap-2.5">
                      <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600 leading-relaxed">{app.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, caption, value }: { icon?: React.ReactNode; caption: string; value: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
      <div className="min-w-0">
        <p className="text-xs text-gray-400 truncate">{caption}</p>
        <p className="text-gray-800 truncate">{value}</p>
      </div>
    </div>
  )
}
