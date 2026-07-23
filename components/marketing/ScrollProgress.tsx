'use client'

import { motion, useScroll, useSpring } from 'framer-motion'
import { colors } from './theme'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left"
      style={{ scaleX, background: `linear-gradient(90deg, ${colors.gold}, ${colors.sage})` }}
    />
  )
}
