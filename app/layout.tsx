import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700'] })
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Bread & Butter: Smart Bites for Bright Minds',
  description: 'Wholesome bakery cafeteria and catering for North Lebanon schools. Brunch boxes, healthy menus, and school event catering.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
