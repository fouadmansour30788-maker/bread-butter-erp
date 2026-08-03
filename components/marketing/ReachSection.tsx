'use client'

import { motion } from 'framer-motion'
import { CountUp } from './CountUp'
import { LebanonMap } from './LebanonMap'
import { colors } from './theme'

const stats: { value: React.ReactNode; label: string }[] = [
  { value: <CountUp to={5} />, label: 'Partner school kiosks' },
  { value: 'North Lebanon', label: 'Tripoli area focus' },
  { value: 'Daily', label: 'Fresh stock delivery' },
  { value: <CountUp to={49} suffix="+" />, label: 'Menu items across our range' },
]

export function ReachSection() {
  return (
    <section id="reach" className="py-24 sm:py-32" style={{ background: colors.cream }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            Where we operate
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-5" style={{ color: colors.forestDeep }}>
            5 school kiosks and growing across North Lebanon
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: colors.inkSoft }}>
            Every kiosk we run gets the same daily rhythm: fresh deliveries,
            careful tracking, and a team that knows the school. As we take on
            new schools, that same standard travels with us.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl p-5"
                style={{ background: 'white', border: `1px solid ${colors.sageLight}` }}
              >
                <p className="font-display text-2xl mb-1" style={{ color: colors.forestDeep }}>{s.value}</p>
                <p className="text-xs" style={{ color: colors.inkSoft }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[2rem] overflow-hidden p-6"
          style={{ background: `linear-gradient(160deg, ${colors.forest}, ${colors.forestDeep})`, aspectRatio: '3 / 4.2' }}
        >
          <div aria-hidden className="absolute top-1/4 -left-10 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: colors.gold }} />
          <div aria-hidden className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: colors.sage }} />
          <LebanonMap />
        </motion.div>
      </div>
    </section>
  )
}
