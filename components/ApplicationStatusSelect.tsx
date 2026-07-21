'use client'

import { useTransition } from 'react'
import { updateApplicationStatus } from '@/app/admin/(dashboard)/applications/actions'
import type { ApplicationStatus } from '@/lib/types'

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string }> = {
  new:        { bg: '#dbeafe', text: '#1e40af' },
  contacted:  { bg: '#fef3c7', text: '#92400e' },
  onboarded:  { bg: '#d1fae5', text: '#065f46' },
  rejected:   { bg: '#fee2e2', text: '#991b1b' },
}

export function ApplicationStatusSelect({ id, status }: { id: string; status: ApplicationStatus }) {
  const [pending, startTransition] = useTransition()
  const col = STATUS_COLORS[status]

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateApplicationStatus(id, e.target.value as ApplicationStatus))}
      className="text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer disabled:opacity-60"
      style={{ background: col.bg, color: col.text }}
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="onboarded">Onboarded</option>
      <option value="rejected">Rejected</option>
    </select>
  )
}
