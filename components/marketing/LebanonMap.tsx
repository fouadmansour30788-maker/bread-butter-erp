'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { colors } from './theme'

// Real Lebanon national outline, projected from public boundary data
// (equirectangular, cos(lat) corrected) into a 300x500 viewBox — not a
// stylized/schematic shape. Kiosk pins are clustered around Tripoli's
// real projected coordinates (North Lebanon), though exact per-kiosk
// placement is illustrative.
const LEBANON_PATH =
  'M 140.99,320.38 L 90.43,323.37 L 73.07,363.14 L 10.00,362.72 L 77.12,177.84 L 170.86,17.91 L 174.41,10.00 L 259.18,21.57 L 290.00,110.58 L 187.23,196.12 L 140.99,320.38 Z'

const TRIPOLI = { x: 146.4, y: 57.3 }

// Small cluster of kiosk pins around Tripoli's real coordinates
const PINS = [
  { dx: -14, dy: -6, delay: 0 },
  { dx: 10, dy: -14, delay: 0.1 },
  { dx: 0, dy: 8, delay: 0.2 },
  { dx: 18, dy: 4, delay: 0.3 },
  { dx: -8, dy: 16, delay: 0.4 },
]

export function LebanonMap() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const pathLength = useTransform(scrollYProgress, [0.1, 0.5], [0, 1])

  return (
    <div ref={ref} className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 300 500" className="w-full h-full max-h-[26rem]" fill="none">
        <defs>
          <radialGradient id="tripoliGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.gold} stopOpacity="0.55" />
            <stop offset="100%" stopColor={colors.gold} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Country fill (static, subtle) */}
        <path d={LEBANON_PATH} fill={colors.forest} fillOpacity="0.35" />

        {/* Animated outline draw-on-scroll */}
        <motion.path
          d={LEBANON_PATH}
          stroke={colors.sage}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ pathLength }}
        />

        {/* Glow around the North Lebanon / Tripoli operating area */}
        <motion.circle
          cx={TRIPOLI.x}
          cy={TRIPOLI.y}
          r="55"
          fill="url(#tripoliGlow)"
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1 }}
        />
        <motion.circle
          cx={TRIPOLI.x}
          cy={TRIPOLI.y}
          r="8"
          fill="none"
          stroke={colors.gold}
          strokeWidth="1.5"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: [0.8, 1.8], opacity: [0.7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />

        {/* Kiosk pins clustered around Tripoli's real coordinates */}
        {PINS.map((p, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 + p.delay }}
          >
            <circle cx={TRIPOLI.x + p.dx} cy={TRIPOLI.y + p.dy} r="5.5" fill={colors.gold} />
          </motion.g>
        ))}
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="absolute"
        style={{ top: `${(TRIPOLI.y / 500) * 100}%`, left: `${(TRIPOLI.x / 300) * 100}%`, transform: 'translate(-50%, -160%)' }}
      >
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
          style={{ background: 'rgba(255,255,255,0.1)', color: colors.cream, border: '1px solid rgba(255,255,255,0.25)' }}
        >
          <MapPin size={11} /> Tripoli, North Lebanon
        </span>
      </motion.div>
    </div>
  )
}
