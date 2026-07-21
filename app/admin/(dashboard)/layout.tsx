import type { Metadata } from 'next'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Bread & Butter ERP',
  description: 'Kiosk Management System for North Lebanon Schools',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex text-gray-900" style={{ background: '#f8fafc' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto" style={{ background: '#f8fafc' }}>
        {children}
      </main>
    </div>
  )
}
