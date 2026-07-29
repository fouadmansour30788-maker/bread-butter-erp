'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { colors } from './theme'

const PALETTE = [colors.gold, colors.sage, colors.forestMid]

export function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * 360 + Math.random() * 20
        const distance = 60 + Math.random() * 60
        const rad = (angle * Math.PI) / 180
        return {
          x: Math.cos(rad) * distance,
          y: Math.sin(rad) * distance,
          size: 6 + Math.random() * 6,
          color: PALETTE[i % PALETTE.length],
          delay: Math.random() * 0.15,
        }
      }),
    []
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-sm"
          style={{ width: p.size, height: p.size, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: 180 }}
          transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
