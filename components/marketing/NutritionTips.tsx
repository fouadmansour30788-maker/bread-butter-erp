'use client'

import { motion } from 'framer-motion'
import { Droplets, Apple, Wheat, CandyOff, Clock, Salad } from 'lucide-react'
import { TiltCard, TiltLayer } from './TiltCard'
import { colors } from './theme'

const tips = [
  { icon: Droplets, title: 'Hydration first', copy: 'A refillable water bottle in every school bag helps focus and mood as much as food does.' },
  { icon: Apple, title: 'Fruit over sugar', copy: 'Swap sugary snacks for whole fruit — the fibre keeps energy steady instead of spiking and crashing.' },
  { icon: Wheat, title: 'Whole grains', copy: 'Whole-grain bread and pastries digest slower, giving kids longer-lasting fuel through morning classes.' },
  { icon: Salad, title: 'Add some colour', copy: 'A colourful brunch box — veg, fruit, protein — usually means a more balanced, more appealing meal.' },
  { icon: Clock, title: 'Regular meal times', copy: 'Consistent breakfast and brunch times help regulate appetite and concentration all day.' },
  { icon: CandyOff, title: 'Treats in moderation', copy: 'Occasional treats are fine — the goal is balance across the week, not restriction every day.' },
]

export function NutritionTips() {
  return (
    <section id="tips" className="py-24 sm:py-32" style={{ background: colors.creamDeep }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            For parents &amp; schools
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-5" style={{ color: colors.forestDeep }}>
            Nutrition tips worth sharing
          </h2>
          <p className="text-base leading-relaxed" style={{ color: colors.inkSoft }}>
            Small, simple habits that support kids' health at school and at home.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <TiltCard maxTilt={6}>
                <div
                  className="h-full rounded-3xl p-6"
                  style={{ background: 'white', border: `1px solid ${colors.sageLight}`, boxShadow: '0 12px 30px -18px rgba(18,42,28,0.25)' }}
                >
                  <TiltLayer z={26}>
                    <span
                      className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-4"
                      style={{ background: colors.sageLight }}
                    >
                      <tip.icon size={20} color={colors.forest} />
                    </span>
                    <p className="font-display text-lg mb-2" style={{ color: colors.forestDeep }}>{tip.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: colors.inkSoft }}>{tip.copy}</p>
                  </TiltLayer>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
