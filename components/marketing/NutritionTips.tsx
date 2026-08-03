'use client'

import { motion } from 'framer-motion'
import { TiltCard, TiltLayer } from './TiltCard'
import { VideoCard } from './VideoCard'
import { nutritionVideos } from './nutritionVideos'
import { colors } from './theme'

export function NutritionTips() {
  return (
    <section id="tips" className="relative overflow-hidden py-24 sm:py-32" style={{ background: colors.creamDeep }}>
      <div aria-hidden className="absolute -top-16 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: colors.sage }} />
      <div aria-hidden className="absolute bottom-0 -left-24 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: colors.gold }} />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            For parents &amp; schools
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-5" style={{ color: colors.forestDeep }}>
            Nutrition tips worth sharing
          </h2>
          <p className="text-base leading-relaxed" style={{ color: colors.inkSoft }}>
            A few short watches on nutrition and wellbeing, worth sharing with
            parents and classrooms alike.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <TiltCard maxTilt={6}>
              <div
                className="h-full rounded-3xl overflow-hidden"
                style={{ background: 'white', border: `1px solid ${colors.sageLight}`, boxShadow: '0 16px 36px -20px rgba(18,42,28,0.3)' }}
              >
                <div className="aspect-video relative bg-black">
                  <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                    <source src="/videos/hydration-reminder.mp4" type="video/mp4" />
                  </video>
                </div>
                <TiltLayer z={20} className="p-5">
                  <p className="font-display text-base leading-snug mb-1" style={{ color: colors.forestDeep }}>A daily reminder to hydrate</p>
                  <p className="text-xs" style={{ color: colors.inkSoft }}>Bread &amp; Butter</p>
                </TiltLayer>
              </div>
            </TiltCard>
          </motion.div>

          {nutritionVideos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i + 1) * 0.08 }}
            >
              <VideoCard {...video} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
