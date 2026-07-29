'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * A soft trailing dot that follows the real cursor and grows over
 * clickable elements — additive, not a replacement for the OS cursor
 * (so text inputs/carets stay perfectly usable). Desktop/mouse only.
 */
export function CustomCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { stiffness: 500, damping: 40 })
  const springY = useSpring(y, { stiffness: 500, damping: 40 })
  const [hovering, setHovering] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)

    function move(e: MouseEvent) {
      x.set(e.clientX)
      y.set(e.clientY)
      const target = e.target as HTMLElement
      setHovering(!!target.closest('a, button, input, textarea, select, [role="button"]'))
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] mix-blend-difference hidden md:block"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        width: hovering ? 40 : 12,
        height: hovering ? 40 : 12,
        background: 'white',
        transition: 'width 0.2s ease, height 0.2s ease',
      }}
    />
  )
}
