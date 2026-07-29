'use client'

import { motion } from 'framer-motion'
import { BrunchBoxBuilder } from './BrunchBoxBuilder'
import { colors } from './theme'

export function BrunchBoxSection() {
  return (
    <section id="brunch-box" className="py-24 sm:py-32" style={{ background: colors.creamDeep }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            Try it yourself
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-5" style={{ color: colors.forestDeep }}>
            Build a Brunch Box
          </h2>
          <p className="text-base leading-relaxed max-w-lg mx-auto" style={{ color: colors.inkSoft }}>
            See how easy it is to put together a balanced meal — pick a few
            favorites and fill the box.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <BrunchBoxBuilder />
        </motion.div>
      </div>
    </section>
  )
}
