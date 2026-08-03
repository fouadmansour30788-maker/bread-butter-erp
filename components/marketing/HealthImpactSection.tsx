'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, HeartPulse, GraduationCap } from 'lucide-react'
import { ParallaxSection } from './ParallaxSection'
import { TiltCard, TiltLayer } from './TiltCard'
import { marketingImages } from './images'
import { colors } from './theme'

const impacts = [
  {
    icon: Brain,
    title: 'Sharper focus',
    copy: 'Balanced meals help steady blood sugar through the school day, supporting concentration in the classroom.',
  },
  {
    icon: Zap,
    title: 'Lasting energy',
    copy: 'Wholesome ingredients over sugary shortcuts mean fewer energy crashes between recess and last period.',
  },
  {
    icon: HeartPulse,
    title: 'Healthier growth',
    copy: 'Nutritious, age-appropriate portions support the physical development of growing kids and teens.',
  },
  {
    icon: GraduationCap,
    title: 'Better in class',
    copy: 'Well-fed students are calmer, more engaged, and more ready to participate and learn.',
  },
]

export function HealthImpactSection() {
  return (
    <ParallaxSection
      image={marketingImages.healthImpact}
      speed={0.22}
      className="py-24 sm:py-32"
      overlay={`linear-gradient(180deg, ${colors.forestDeep}f2, ${colors.forestDeep}e6)`}
    >
      <div id="health" className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.gold }}>
            Why food matters
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight text-white mb-5">
            What kids eat shapes how they learn, feel, and grow
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
            The link between nutrition and student wellbeing isn&apos;t just a
            slogan for us. It&apos;s the whole reason Bread &amp; Butter
            exists. Every brunch box and menu item is designed with a child&apos;s
            mental and physical health in mind, so families and schools can
            trust what shows up on the tray.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {impacts.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <TiltCard maxTilt={7}>
                <div
                  className="h-full rounded-3xl p-6"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}
                >
                  <TiltLayer z={24}>
                    <span
                      className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-4"
                      style={{ background: 'rgba(227,166,47,0.18)' }}
                    >
                      <item.icon size={20} color={colors.gold} />
                    </span>
                    <p className="font-display text-lg text-white mb-2">{item.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>{item.copy}</p>
                  </TiltLayer>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </ParallaxSection>
  )
}
