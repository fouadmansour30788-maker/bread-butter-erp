'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import type { RefObject } from 'react'

/**
 * A soft vertical water column that fills from top to bottom as the given
 * container scrolls through the viewport, and drains back up in reverse —
 * scaleY is bound directly to live scrollYProgress (not a one-shot
 * animation), so it tracks scroll position in both directions.
 */
export function WaterFlow({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.75, 0.75, 0])

  return (
    <motion.div
      aria-hidden
      className="absolute top-0 left-[18%] w-2.5 h-full rounded-full pointer-events-none"
      style={{
        scaleY,
        opacity,
        transformOrigin: 'top',
        background: 'linear-gradient(180deg, rgba(210,240,250,0.95), rgba(79,168,204,0.55) 60%, rgba(79,168,204,0.15))',
        filter: 'blur(2.5px)',
      }}
    />
  )
}
