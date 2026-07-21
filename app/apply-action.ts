'use server'

import { createClient } from '@/lib/supabase/server'

export type ApplyFormState = { success: boolean; error?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitSchoolApplication(
  _prev: ApplyFormState,
  formData: FormData
): Promise<ApplyFormState> {
  const school_name = String(formData.get('school_name') ?? '').trim()
  const contact_name = String(formData.get('contact_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim() || null
  const current_provider = String(formData.get('current_provider') ?? '').trim() || null
  const message = String(formData.get('message') ?? '').trim() || null
  const studentCountRaw = String(formData.get('student_count') ?? '').trim()
  const student_count = studentCountRaw ? Number(studentCountRaw) : null

  if (!school_name || !contact_name || !phone || !email) {
    return { success: false, error: 'Please fill in the school name, contact name, phone, and email.' }
  }
  if (!EMAIL_RE.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }
  if (student_count !== null && (!Number.isFinite(student_count) || student_count < 0)) {
    return { success: false, error: 'Number of students must be a positive number.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('school_applications').insert({
    school_name,
    contact_name,
    phone,
    email,
    location,
    student_count,
    current_provider,
    message,
  })

  if (error) {
    return { success: false, error: 'Something went wrong submitting your application. Please try again.' }
  }

  return { success: true }
}
