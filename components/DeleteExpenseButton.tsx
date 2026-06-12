'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this expense entry?')) return
    const supabase = createClient()
    await supabase.from('expenses').delete().eq('id', id)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      title="Delete"
    >
      <Trash2 size={14} />
    </button>
  )
}
