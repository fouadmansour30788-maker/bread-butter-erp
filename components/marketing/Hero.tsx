'use client'

import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { ParallaxSection } from './ParallaxSection'
import { marketingImages } from './images'
import { colors } from './theme'

export function Hero() {
  return (
    <ParallaxSection
      image={marketingImages.hero}
      speed={0.25}
      className="min-h-screen flex items-center"
      overlay={`linear-gradient(180deg, rgba(18,42,28,0.72), rgba(18,42,28,0.5) 45%, ${colors.cream} 100%)`}
    >
      <div id="top" className="max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-24 w-full">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="uppercase tracking-[0.25em] text-xs sm:text-sm font-semibold mb-5"
          style={{ color: colors.gold }}
        >
          Bakery cafeteria &amp; catering for schools
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-semibold text-white leading-[1.05] text-4xl sm:text-6xl lg:text-7xl max-w-3xl"
        >
          Smart bites for bright minds
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-xl text-base sm:text-lg"
          style={{ color: 'rgba(255,255,255,0.88)' }}
        >
          We nourish students with wholesome, high-quality food that fuels
          their minds and bodies — brunch boxes, fresh bakery menus, and
          catering for every school moment across North Lebanon.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-9 flex flex-wrap gap-4"
        >
          <a
            href="#apply"
            className="px-6 py-3.5 rounded-full font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: colors.gold, color: colors.forestDeep, boxShadow: '0 8px 24px rgba(227,166,47,0.35)' }}
          >
            Apply Your School
          </a>
          <a
            href="#menu"
            className="px-6 py-3.5 rounded-full font-semibold text-sm text-white border transition-colors hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.4)' }}
          >
            See Our Menu
          </a>
        </motion.div>

        <motion.a
          href="#about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="hidden sm:flex items-center gap-2 mt-20 text-xs uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex"
          >
            <ArrowDown size={16} />
          </motion.span>
          Scroll to explore
        </motion.a>
      </div>
    </ParallaxSection>
  )
}
