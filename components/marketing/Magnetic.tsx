'use client'

import { useRef, type ReactNode, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Wraps a CTA so it subtly pulls toward the cursor when nearby, springing
 * back to rest on mouse leave. Purely a positioning wrapper — the child
 * button/link keeps its own click behavior untouched.
 */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)
  const rafRef = useRef<number | null>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.5 })
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.5 })

  // getBoundingClientRect() forces a synchronous layout read — calling it on
  // every mousemove event blocks the main thread. Cache the rect once per
  // hover session and coalesce updates to one per animation frame.
  function handleMove(e: MouseEvent<HTMLDivElement>) {
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
        x.set((pos.x - (rect.left + rect.width / 2)) * strength)
        y.set((pos.y - (rect.top + rect.height / 2)) * strength)
      })
    }
  }

  function handleLeave() {
    rectRef.current = null
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x, y, display: 'inline-block' }}
    >
      {children}
    </motion.div>
  )
}
