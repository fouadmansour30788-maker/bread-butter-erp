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
  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.5 })
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 15, mass: 0.5 })

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }

  function handleLeave() {
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
