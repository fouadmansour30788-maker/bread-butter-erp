'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Counts up from 0 to `to` once it scrolls into view (ease-out, rAF-driven).
 * Plain numeric animation — no external chart/animation library needed.
 */
export function CountUp({ to, suffix = '', duration = 1.2 }: { to: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  function start() {
    if (started.current) return
    started.current = true
    const t0 = performance.now()
    function tick(now: number) {
      const p = Math.min((now - t0) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  return (
    <motion.span onViewportEnter={start} viewport={{ once: true, margin: '-40px' }}>
      {value}{suffix}
    </motion.span>
  )
}
