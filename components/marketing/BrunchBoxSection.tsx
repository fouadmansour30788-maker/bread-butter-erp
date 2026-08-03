'use client'

import { motion } from 'framer-motion'
import { Sparkles, Users, Clock } from 'lucide-react'
import { BrunchBoxBuilder } from './BrunchBoxBuilder'
import { colors } from './theme'

const points = [
  { icon: Sparkles, text: 'Mix a main, fruit, veggies, and a drink, just like the real box' },
  { icon: Users, text: 'A fun way for parents and kids to picture what shows up at school' },
  { icon: Clock, text: 'Takes 10 seconds. Try a few combinations' },
]

export function BrunchBoxSection() {
  return (
    <section id="brunch-box" className="relative overflow-hidden py-24 sm:py-32" style={{ background: colors.creamDeep }}>
      <div aria-hidden className="absolute -top-24 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: colors.gold }} />
      <div aria-hidden className="absolute bottom-0 -left-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: colors.sage }} />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
              Try it yourself
            </p>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-5" style={{ color: colors.forestDeep }}>
              Build a Brunch Box
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: colors.inkSoft }}>
              See how easy it is to put together a balanced meal. Pick a few
              favorites, drag or click them into the box, and fill it up.
            </p>

            <div className="space-y-4">
              {points.map((p, i) => (
                <motion.div
                  key={p.text}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                    style={{ background: colors.forestDeep }}
                  >
                    <p.icon size={16} color={colors.gold} />
                  </span>
                  <p className="text-sm leading-relaxed pt-1.5" style={{ color: colors.inkSoft }}>{p.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <BrunchBoxBuilder />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
