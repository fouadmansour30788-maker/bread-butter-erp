'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Full-bleed section with a background image that drifts at a slower rate
 * than scroll (classic parallax) plus a gentle overlay for text contrast.
 * Foreground content scrolls normally; only the background layer transforms.
 */
export function ParallaxSection({
  image,
  overlay = 'linear-gradient(180deg, rgba(18,42,28,0.55), rgba(18,42,28,0.75))',
  speed = 0.3,
  className,
  contentClassName,
  children,
}: {
  image: string
  overlay?: string
  speed?: number
  className?: string
  contentClassName?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}%`, `${speed * 100}%`])

  return (
    <section ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ y, scale: 1 + speed }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0" style={{ background: overlay }} />
      </motion.div>
      <div className={cn('relative z-10', contentClassName)}>{children}</div>
    </section>
  )
}
