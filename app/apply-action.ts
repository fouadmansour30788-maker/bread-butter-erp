'use server'

import { createClient } from '@/lib/supabase/server'
import type { DeliveryFrequency, ReferralSource, SchoolType, ServiceInterest } from '@/lib/types'

export type ApplyFormState = { success: boolean; error?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SCHOOL_TYPES: SchoolType[] = ['kindergarten', 'primary', 'secondary', 'mixed']
const DELIVERY_FREQUENCIES: DeliveryFrequency[] = ['daily', 'few_times_week', 'events_only']
const REFERRAL_SOURCES: ReferralSource[] = ['referral', 'social_media', 'search', 'other']
const SERVICE_OPTIONS: ServiceInterest[] = ['brunch_box', 'bakery_menu', 'catering']

function oneOf<T extends string>(value: string, allowed: T[]): T | null {
  return (allowed as string[]).includes(value) ? (value as T) : null
}

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
  const dietary_considerations = String(formData.get('dietary_considerations') ?? '').trim() || null
  const message = String(formData.get('message') ?? '').trim() || null

  const studentCountRaw = String(formData.get('student_count') ?? '').trim()
  const student_count = studentCountRaw ? Number(studentCountRaw) : null

  const school_type = oneOf(String(formData.get('school_type') ?? ''), SCHOOL_TYPES)
  const delivery_frequency = oneOf(String(formData.get('delivery_frequency') ?? ''), DELIVERY_FREQUENCIES)
  const referral_source = oneOf(String(formData.get('referral_source') ?? ''), REFERRAL_SOURCES)

  const services_interested = formData
    .getAll('services_interested')
    .map((v) => String(v))
    .filter((v): v is ServiceInterest => (SERVICE_OPTIONS as string[]).includes(v))

  const preferred_start_date_raw = String(formData.get('preferred_start_date') ?? '').trim()
  const preferred_start_date = preferred_start_date_raw || null

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
    school_type,
    student_count,
    services_interested,
    delivery_frequency,
    preferred_start_date,
    current_provider,
    dietary_considerations,
    referral_source,
    message,
  })

  if (error) {
    return { success: false, error: 'Something went wrong submitting your application. Please try again.' }
  }

  return { success: true }
}
