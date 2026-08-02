'use client'

import { useRef, type ReactNode, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Generic 3D-tilt card: pointer position drives rotateX/rotateY (sprung for
 * smoothness), inner content pushed forward on translateZ for layered depth.
 * Same technique used on the sister FEE Kuwait site's hero cards.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 10,
}: {
  children: ReactNode
  className?: string
  maxTilt?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * maxTilt * 2)
    rotateX.set(-py * maxTilt * 2)
  }

  function handleMouseLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div style={{ perspective: 1200 }} className={cn('h-full', className)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn('h-full w-full rounded-3xl')}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function TiltLayer({ z = 30, className, children }: { z?: number; className?: string; children: ReactNode }) {
  return (
    <div className={className} style={{ transform: `translateZ(${z}px)`, transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  )
}
