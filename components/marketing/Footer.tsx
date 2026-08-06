import { Phone, Mail, Globe } from 'lucide-react'
import { colors } from './theme'
import { FacebookIcon, InstagramIcon } from './icons'

export function Footer() {
  return (
    <footer style={{ background: colors.forestDeep }} className="pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div>
            <p className="font-display text-lg text-white leading-none">Bread &amp; Butter</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Smart bites for bright minds</p>
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
