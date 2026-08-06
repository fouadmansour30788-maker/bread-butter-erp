'use client'

import { ParallaxSection } from './ParallaxSection'
import { marketingImages } from './images'
import { FacebookIcon, InstagramIcon } from './icons'
import { colors } from './theme'

export function SocialSection() {
  return (
    <ParallaxSection
      image={marketingImages.socialBakery}
      speed={0.2}
      className="py-24 sm:py-28"
      overlay={`linear-gradient(160deg, rgba(15,35,23,0.93) 0%, rgba(18,42,28,0.9) 100%)`}
    >
      <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-4" style={{ color: colors.gold }}>
          Stay in the loop
        </p>
        <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight text-white mb-5">
          Follow @breadandbutter.lebanon
        </h2>
        <p className="text-base leading-relaxed mb-9" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Menu updates, behind-the-scenes from the kitchen, and everything new
          at Bread &amp; Butter. Follow along on Instagram and Facebook.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.instagram.com/breadandbutter.lebanon"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-full font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: colors.gold, color: colors.forestDeep, boxShadow: '0 8px 24px rgba(227,166,47,0.35)' }}
          >
            <InstagramIcon size={18} /> Follow on Instagram
          </a>
          <a
            href="https://www.facebook.com/BreadandButter"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-full font-semibold text-sm text-white border transition-colors hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.4)' }}
          >
            <FacebookIcon size={18} /> Follow on Facebook
          </a>
        </div>
      </div>
    </ParallaxSection>
  )
}
