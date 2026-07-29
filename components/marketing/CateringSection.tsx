'use client'

import { motion } from 'framer-motion'
import { PartyPopper } from 'lucide-react'
import { ParallaxSection } from './ParallaxSection'
import { Magnetic } from './Magnetic'
import { marketingImages } from './images'
import { colors } from './theme'

export function CateringSection() {
  return (
    <ParallaxSection
      image={marketingImages.catering}
      speed={0.25}
      className="py-28 sm:py-36"
      overlay={`linear-gradient(120deg, ${colors.forestDeep}f5, ${colors.forest}d9)`}
    >
      <div id="catering" className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
          style={{ background: 'rgba(227,166,47,0.18)' }}
        >
          <PartyPopper size={24} color={colors.gold} />
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display font-semibold text-3xl sm:text-5xl text-white leading-tight mb-5"
        >
          Catering every school moment
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg italic mb-10"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        >
          &ldquo;Delicious support for every event&rdquo;
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Magnetic>
            <a
              href="#apply"
              className="inline-block px-7 py-3.5 rounded-full font-semibold text-sm transition-transform hover:scale-105"
              style={{ background: colors.gold, color: colors.forestDeep, boxShadow: '0 10px 28px rgba(227,166,47,0.35)' }}
            >
              Enquire About Catering
            </a>
          </Magnetic>
        </motion.div>
      </div>
    </ParallaxSection>
  )
}
