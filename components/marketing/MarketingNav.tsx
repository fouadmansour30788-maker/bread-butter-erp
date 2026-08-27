'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Magnetic } from './Magnetic'
import { colors } from './theme'

const links = [
  { href: '#about', label: 'About' },
  { href: '#health', label: 'Wellbeing' },
  { href: '#tips', label: 'Nutrition Tips' },
  { href: '#menu', label: 'Menu' },
  { href: '#catering', label: 'Catering' },
  { href: '#roadmap', label: 'Roadmap' },
  { href: '#faq', label: 'FAQ' },
]

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? colors.cream : 'transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(18,42,28,0.08)' : 'none',
        borderBottom: scrolled ? `1px solid ${colors.sageLight}` : '1px solid transparent',
      }}
    >
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <Image
            src="/logo-small.png"
            alt="Bread & Butter"
            width={192}
            height={192}
            unoptimized
            className="w-9 h-9 rounded-full shrink-0"
            style={{ boxShadow: '0 4px 12px rgba(29,74,48,0.35)' }}
            priority
          />
          <span
            className="font-display font-semibold text-lg leading-none"
            style={{ color: scrolled ? colors.forestDeep : 'white' }}
          >
            Bread &amp; Butter
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: scrolled ? colors.ink : 'white' }}
            >
              {l.label}
            </a>
          ))}
          <Magnetic strength={0.25}>
            <a
              href="#apply"
              className="inline-block text-sm font-semibold px-4 py-2 rounded-full transition-transform hover:scale-105"
              style={{ background: colors.gold, color: colors.forestDeep }}
            >
              Apply Your School
            </a>
          </Magnetic>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg"
          style={{ color: scrolled ? colors.ink : 'white' }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-3" style={{ background: colors.cream }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium py-1.5" style={{ color: colors.ink }}>
              {l.label}
            </a>
          ))}
          <a
            href="#apply"
            onClick={() => setOpen(false)}
            className="text-sm font-semibold px-4 py-2.5 rounded-full text-center"
            style={{ background: colors.gold, color: colors.forestDeep }}
          >
            Apply Your School
          </a>
        </div>
      )}
    </header>
  )
}
