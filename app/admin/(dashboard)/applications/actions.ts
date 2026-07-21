'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ApplicationStatus } from '@/lib/types'

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const supabase = createAdminClient()
  await supabase.from('school_applications').update({ status }).eq('id', id)
  revalidatePath('/admin/applications')
}
