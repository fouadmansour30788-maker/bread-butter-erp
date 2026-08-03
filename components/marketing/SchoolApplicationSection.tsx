'use client'

import { motion } from 'framer-motion'
import { SchoolApplicationForm } from './SchoolApplicationForm'
import { colors } from './theme'

export function SchoolApplicationSection() {
  return (
    <section id="apply" className="py-24 sm:py-32" style={{ background: colors.creamDeep }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            For schools
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-4" style={{ color: colors.forestDeep }}>
            Bring Bread &amp; Butter to your school
          </h2>
          <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: colors.inkSoft }}>
            Tell us a bit about your school and we&apos;ll get back to you to
            discuss brunch boxes, bakery menus, and catering options tailored
            to your students.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <SchoolApplicationForm />
        </motion.div>
      </div>
    </section>
  )
}
