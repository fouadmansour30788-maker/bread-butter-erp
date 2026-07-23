'use client'

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

// Percent-down-the-page position of each accent droplet. Purely decorative,
// tuned to roughly land near section breaks from Hero through the footer.
const DROPS = [
  { top: 6, size: 10 },
  { top: 18, size: 7 },
  { top: 30, size: 13 },
  { top: 42, size: 8 },
  { top: 54, size: 11 },
  { top: 66, size: 7 },
  { top: 78, size: 12 },
  { top: 90, size: 8 },
]

/**
 * A soft vertical water column fixed to the left edge of the viewport,
 * running the whole page (Hero -> Footer). scaleY is bound directly to
 * whole-page scrollYProgress (no target = tracks the document, not a
 * single section), so it fills as you scroll down and drains back up as
 * you scroll up.
 */
export function PageWaterFlow() {
  const { scrollYProgress } = useScroll()
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div className="fixed left-0 top-0 bottom-0 w-6 z-40 pointer-events-none" aria-hidden>
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full rounded-full"
        style={{
          scaleY,
          transformOrigin: 'top',
          background: 'linear-gradient(180deg, rgba(210,240,250,0.9), rgba(79,168,204,0.5) 60%, rgba(79,168,204,0.15))',
          filter: 'blur(2.5px)',
        }}
      />
      {DROPS.map((d, i) => (
        <Droplet key={i} progress={scrollYProgress} {...d} />
      ))}
    </div>
  )
}

function Droplet({ progress, top, size }: { progress: MotionValue<number>; top: number; size: number }) {
  const t = top / 100
  const opacity = useTransform(progress, [Math.max(0, t - 0.03), t], [0, 0.65])

  return (
    <motion.span
      className="absolute left-1/2 -translate-x-1/2 rounded-full"
      style={{
        top: `${top}%`,
        width: size,
        height: size,
        opacity,
        background: '#BEE7F5',
        boxShadow: '0 0 6px rgba(123,196,224,0.6)',
      }}
    />
  )
}
