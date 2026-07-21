'use client'

import { TiltCard, TiltLayer } from './TiltCard'
import { colors } from './theme'

/**
 * Autoplaying muted loop for our own short-form brand clips (vertical,
 * reel-style) — unlike VideoCard's YouTube facade, there's no external
 * player to defer loading for, so it just plays.
 */
export function NativeVideoCard({ src, title, tag }: { src: string; title: string; tag?: string }) {
  return (
    <TiltCard maxTilt={6}>
      <div
        className="h-full rounded-3xl overflow-hidden"
        style={{ background: 'white', border: `1px solid ${colors.sageLight}`, boxShadow: '0 16px 36px -20px rgba(18,42,28,0.3)' }}
      >
        <div className="aspect-[9/16] relative bg-black">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={src} type="video/mp4" />
          </video>
          {tag && (
            <span
              className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: colors.gold, color: colors.forestDeep }}
            >
              {tag}
            </span>
          )}
        </div>
        <TiltLayer z={20} className="p-5">
          <p className="font-display text-base leading-snug" style={{ color: colors.forestDeep }}>{title}</p>
        </TiltLayer>
      </div>
    </TiltCard>
  )
}
