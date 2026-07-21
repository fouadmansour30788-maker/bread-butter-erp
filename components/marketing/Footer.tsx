import { Wheat, Phone, Mail, Globe } from 'lucide-react'
import { colors } from './theme'

// lucide-react in this project's version doesn't ship brand/social glyphs,
// so these two are small inline SVGs instead.
function FacebookIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  )
}
function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer style={{ background: colors.forestDeep }} className="pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
              style={{ background: `linear-gradient(135deg, ${colors.forestMid}, ${colors.forest})` }}
            >
              <Wheat size={18} color={colors.gold} />
            </span>
            <div>
              <p className="font-display text-lg text-white leading-none">Bread &amp; Butter</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Smart bites for bright minds</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <a href="tel:03193002" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={15} /> 03 193 002
            </a>
            <a href="tel:03012502" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={15} /> 03 012 502
            </a>
            <a href="mailto:info@breadandbutter-lb.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={15} /> info@breadandbutter-lb.com
            </a>
            <a href="https://www.breadandbutter-lb.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <Globe size={15} /> breadandbutter-lb.com
            </a>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-8 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <p>&copy; {new Date().getFullYear()} Bread &amp; Butter. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/BreadandButter" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white transition-colors">
              <FacebookIcon />
            </a>
            <a href="https://www.instagram.com/breadandbutter.lebanon" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
