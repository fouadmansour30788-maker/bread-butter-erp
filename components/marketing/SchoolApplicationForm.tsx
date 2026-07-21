'use client'

import { useActionState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { submitSchoolApplication, type ApplyFormState } from '@/app/apply-action'
import { colors } from './theme'

const initialState: ApplyFormState = { success: false }

const inputStyle = {
  border: `1px solid ${colors.sageLight}`,
  background: 'white',
} as const

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: colors.forestDeep }}>{label}</span>
      {children}
    </label>
  )
}

export function SchoolApplicationForm() {
  const [state, formAction, pending] = useActionState(submitSchoolApplication, initialState)

  if (state.success) {
    return (
      <div
        className="rounded-3xl p-10 text-center"
        style={{ background: 'white', border: `1px solid ${colors.sageLight}` }}
      >
        <CheckCircle2 size={40} color={colors.forest} className="mx-auto mb-4" />
        <p className="font-display text-xl mb-2" style={{ color: colors.forestDeep }}>Thank you!</p>
        <p className="text-sm" style={{ color: colors.inkSoft }}>
          We&apos;ve received your school&apos;s application. Our team will reach out shortly to discuss next steps.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="rounded-3xl p-7 sm:p-10 space-y-5" style={{ background: 'white', border: `1px solid ${colors.sageLight}` }}>
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
        <Field label="Number of students">
          <input name="student_count" type="number" min={0} className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
        </Field>
      </div>

      <Field label="Current food provider (optional)">
        <input name="current_provider" className="w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
      </Field>

      <Field label="Tell us about your school">
        <textarea name="message" rows={4} placeholder="Anything that helps us understand your school's needs..." className="w-full rounded-xl px-4 py-2.5 text-sm resize-none" style={inputStyle} />
      </Field>

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
