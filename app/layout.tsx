import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Bread & Butter ERP',
  description: 'Kiosk Management System for North Lebanon Schools',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'light', background: '#f8fafc' }}>
      <body className="min-h-screen flex text-gray-900" style={{ background: '#f8fafc' }}>
        <Sidebar />
        <main className="flex-1 overflow-auto" style={{ background: '#f8fafc' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
