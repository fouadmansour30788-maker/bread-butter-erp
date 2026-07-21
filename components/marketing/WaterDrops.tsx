'use client'

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import type { RefObject } from 'react'

type DropSpec = { left: string; size: number; range: [string, string]; opacity: number }

// Varying left offsets, sizes and fall ranges so drops don't move in lockstep —
// reads as gentle rain rather than one row sliding uniformly.
const DROPS: DropSpec[] = [
  { left: '10%', size: 9,  range: ['-15%', '110%'], opacity: 0.55 },
  { left: '24%', size: 13, range: ['-30%', '130%'], opacity: 0.35 },
  { left: '40%', size: 7,  range: ['-10%', '95%'],  opacity: 0.45 },
  { left: '55%', size: 15, range: ['-40%', '140%'], opacity: 0.3 },
  { left: '68%', size: 8,  range: ['-20%', '115%'], opacity: 0.5 },
  { left: '82%', size: 11, range: ['-25%', '120%'], opacity: 0.4 },
]

/**
 * Water droplets that fall (top to bottom) as the given container scrolls
 * through the viewport — purely scroll-linked, no autoplay/timers. Meant to
 * sit inside an `overflow-hidden` box so drops are naturally clipped to it.
 */
export function WaterDrops({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] })

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {DROPS.map((d, i) => (
        <Droplet key={i} progress={scrollYProgress} {...d} />
      ))}
    </div>
  )
}

function Droplet({ progress, left, size, range, opacity }: DropSpec & { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], range)
  const fade = useTransform(progress, [0, 0.15, 0.85, 1], [0, opacity, opacity, 0])

  return (
    <motion.svg
      viewBox="0 0 24 32"
      width={size}
      height={size * 1.35}
      style={{ position: 'absolute', left, top: 0, y, opacity: fade }}
    >
      <path d="M12 0C12 0 2 14 2 20a10 10 0 0 0 20 0C22 14 12 0 12 0z" fill="#7BC4E0" />
      <ellipse cx="9" cy="17" rx="1.8" ry="2.6" fill="white" fillOpacity="0.55" />
    </motion.svg>
  )
}
