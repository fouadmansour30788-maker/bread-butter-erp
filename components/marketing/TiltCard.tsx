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
  const rectRef = useRef<DOMRect | null>(null)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)
  const rafRef = useRef<number | null>(null)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  // getBoundingClientRect() forces a synchronous layout read — calling it on
  // every mousemove event (which can fire dozens of times per frame) blocks
  // the main thread, especially with many TiltCards on a page. Cache the
  // rect once per hover session and coalesce updates to one per frame.
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!rectRef.current) {
      const el = ref.current
      if (!el) return
      rectRef.current = el.getBoundingClientRect()
    }
    pendingRef.current = { x: e.clientX, y: e.clientY }
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const rect = rectRef.current
        const pos = pendingRef.current
        if (!rect || !pos) return
        const px = (pos.x - rect.left) / rect.width - 0.5
        const py = (pos.y - rect.top) / rect.height - 0.5
        rotateY.set(px * maxTilt * 2)
        rotateX.set(-py * maxTilt * 2)
      })
    }
  }

  function handleMouseLeave() {
    rectRef.current = null
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    // overflow: hidden keeps the 3D perspective box from inflating the
    // page's scrollable width/height on mobile WebKit/Blink, which can
    // otherwise happen even when nothing visually escapes the card.
    <div style={{ perspective: 1200, overflow: 'hidden' }} className={cn('h-full', className)}>
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
