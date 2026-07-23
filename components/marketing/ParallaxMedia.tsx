'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Wraps a single image/video so it drifts and scales slightly as its own
 * container scrolls through the viewport — a smaller-scale version of
 * ParallaxSection's full-bleed technique, for media inside cards rather
 * than full sections. Caller's className must include sizing/position
 * (e.g. "aspect-[4/3]" or "absolute inset-0") — merged via cn so
 * position utilities override this component's "relative" default.
 */
export function ParallaxMedia({ children, className, range = 12 }: { children: ReactNode; className?: string; range?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${range}%`, `${range}%`])
  // The inner layer must be oversized by at least `range` on each side so a
  // ±range% vertical shift never reveals empty space at the container edge.
  const scale = 1 + (range / 100) * 2 + 0.04

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={{ y, scale }} className="absolute inset-0">
        {children}
      </motion.div>
    </div>
  )
}
