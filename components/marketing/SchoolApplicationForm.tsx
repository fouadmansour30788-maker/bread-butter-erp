'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { submitSchoolApplication, type ApplyFormState } from '@/app/apply-action'
import { ConfettiBurst } from './ConfettiBurst'
import { colors } from './theme'

const initialState: ApplyFormState = { success: false }

const inputStyle = {
  border: `1px solid ${colors.sageLight}`,
  background: 'white',
} as const

const SERVICE_OPTIONS = [
  { value: 'brunch_box', label: 'Brunch Box (daily boxed meal)' },
  { value: 'bakery_menu', label: 'Bakery menu (croissants, manakish, sandwiches)' },
  { value: 'catering', label: 'Event catering' },
]

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: colors.forestDeep }}>{label}</span>
      {children}
      {hint && <span className="block text-xs mt-1" style={{ color: colors.inkSoft }}>{hint}</span>}
    </label>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="uppercase tracking-[0.15em] text-xs font-semibold" style={{ color: colors.goldDark }}>
      {children}
    </p>
  )
}

export function SchoolApplicationForm() {
  const [state, formAction, pending] = useActionState(submitSchoolApplication, initialState)

  if (state.success) {
    return (
      <div
        className="relative overflow-hidden rounded-3xl p-10 text-center"
        style={{ background: 'white', border: `1px solid ${colors.sageLight}` }}
      >
        <ConfettiBurst />
        <Image src="/logo.png" alt="Bread & Butter" width={56} height={56} className="mx-auto mb-4" />
        <p className="font-display text-xl mb-2" style={{ color: colors.forestDeep }}>Thank you!</p>
        <p className="text-sm" style={{ color: colors.inkSoft }}>
          We&apos;ve received your school&apos;s application. Our team will reach out shortly to discuss next steps.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="rounded-3xl p-7 sm:p-10 space-y-8" style={{ background: 'white', border: `1px solid ${colors.sageLight}` }}>
      <div className="space-y-5">
        <SectionLabel>School details</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="School name *">
            <input name="school_name" required className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
          </Field>
          <Field label="Contact person *">
            <input name="contact_name" required className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
          </Field>
          <Field label="Phone *">
            <input name="phone" type="tel" required className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
          </Field>
          <Field label="Email *">
            <input name="email" type="email" required className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
          </Field>
          <Field label="Location">
            <input name="location" placeholder="City / area" className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
          </Field>
          <Field label="School type">
            <select name="school_type" defaultValue="" className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle}>
              <option value="" disabled>Select one</option>
              <option value="kindergarten">Kindergarten</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="mixed">Mixed / all levels</option>
            </select>
          </Field>
          <Field label="Number of students">
            <input name="student_count" type="number" min={0} className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
          </Field>
          <Field label="Current food provider (optional)">
            <input name="current_provider" className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
          </Field>
        </div>
      </div>

      <div className="space-y-5">
        <SectionLabel>What you need</SectionLabel>

        <Field label="Services you're interested in">
          <div className="grid sm:grid-cols-2 gap-2.5 mt-1">
            {SERVICE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm cursor-pointer"
                style={inputStyle}
              >
                <input type="checkbox" name="services_interested" value={opt.value} className="accent-current" style={{ accentColor: colors.forest }} />
                {opt.label}
              </label>
            ))}
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Delivery frequency">
            <select name="delivery_frequency" defaultValue="" className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle}>
              <option value="" disabled>Select one</option>
              <option value="daily">Daily</option>
              <option value="few_times_week">A few days a week</option>
              <option value="events_only">Special events only</option>
            </select>
          </Field>
          <Field label="Preferred start date">
            <input name="preferred_start_date" type="date" className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
          </Field>
        </div>

        <Field label="Allergies or dietary considerations we should know about">
          <textarea name="dietary_considerations" rows={3} placeholder="e.g. nut allergies, vegetarian options needed..." className="w-full rounded-xl px-4 py-2.5 text-sm resize-none" style={inputStyle} />
        </Field>
      </div>

      <div className="space-y-5">
        <SectionLabel>Anything else</SectionLabel>

        <Field label="How did you hear about us?">
          <select name="referral_source" defaultValue="" className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle}>
            <option value="" disabled>Select one</option>
            <option value="referral">Referral from another school</option>
            <option value="social_media">Social media</option>
            <option value="search">Search engine</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Tell us about your school">
          <textarea name="message" rows={4} placeholder="Anything that helps us understand your school's needs..." className="w-full rounded-xl px-4 py-2.5 text-sm resize-none" style={inputStyle} />
        </Field>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 text-sm rounded-xl px-4 py-3" style={{ background: '#FDECEC', color: '#9B2C2C' }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
        style={{ background: colors.gold, color: colors.forestDeep }}
      >
        {pending ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  )
}
