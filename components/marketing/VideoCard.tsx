'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { TiltCard, TiltLayer } from './TiltCard'
import { colors } from './theme'

export function VideoCard({ id, title, channel }: { id: string; title: string; channel: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <TiltCard maxTilt={6}>
      <div
        className="h-full rounded-3xl overflow-hidden"
        style={{ background: 'white', border: `1px solid ${colors.sageLight}`, boxShadow: '0 16px 36px -20px rgba(18,42,28,0.3)' }}
      >
        <div className="aspect-video relative bg-black">
          {playing ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${id}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play video: ${title}`}
              className="absolute inset-0 w-full h-full group"
            >
              <img
                src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
              <span
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: colors.gold }}
              >
                <Play size={22} color={colors.forestDeep} fill={colors.forestDeep} />
              </span>
            </button>
          )}
        </div>
        <TiltLayer z={20} className="p-5">
          <p className="font-display text-base leading-snug mb-1" style={{ color: colors.forestDeep }}>{title}</p>
          <p className="text-xs" style={{ color: colors.inkSoft }}>{channel}</p>
        </TiltLayer>
      </div>
    </TiltCard>
  )
}
