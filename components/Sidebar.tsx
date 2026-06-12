'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, School, Package, Truck,
  ClipboardList, BarChart3, ShoppingBag
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schools', label: 'Schools', icon: School },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/batches', label: 'Weekly Batches', icon: Truck },
  { href: '/reconciliation', label: 'Reconciliation', icon: ClipboardList },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen flex flex-col" style={{
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
    }}>
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #f59e0b, #b45309)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(180,83,9,0.30)',
          }}>
            <ShoppingBag size={20} color="white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">Bread & Butter</h1>
            <p className="text-xs text-gray-400">Kiosk ERP</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'text-amber-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
              style={active ? {
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                boxShadow: '0 2px 8px rgba(245,158,11,0.15)',
              } : {}}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3">
        <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a' }}>
          <p className="text-xs font-semibold text-amber-800">North Lebanon</p>
          <p className="text-xs text-amber-600 mt-0.5">5 schools · 49 products</p>
        </div>
      </div>
    </aside>
  )
}
