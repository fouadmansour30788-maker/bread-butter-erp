'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Target, Sparkles } from 'lucide-react'
import { TiltCard, TiltLayer } from './TiltCard'
import { ParallaxMedia } from './ParallaxMedia'
import { WaterDrops } from './WaterDrops'
import { marketingImages } from './images'
import { colors } from './theme'

const cards = [
  {
    icon: Target,
    label: 'Our Mission',
    copy: 'To nourish and inspire students with wholesome, high-quality food that fuels their minds and bodies, fostering a vibrant and healthy campus community.',
  },
  {
    icon: Sparkles,
    label: 'Our Vision',
    copy: 'To be the leading bakery cafeteria for students, known for our commitment to health, quality, and sustainability — a welcoming space where students thrive academically and socially.',
  },
]

export function AboutSection() {
  const videoRef = useRef<HTMLDivElement>(null)

  return (
    <section id="about" className="py-24 sm:py-32" style={{ background: colors.cream }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          ref={videoRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[2rem] overflow-hidden aspect-[4/5]"
          style={{ boxShadow: '0 30px 60px -20px rgba(18,42,28,0.35)' }}
        >
          <ParallaxMedia className="absolute inset-0" range={8}>
            <video autoPlay muted loop playsInline poster={marketingImages.about} className="w-full h-full object-cover">
              <source src="/videos/hydration-reminder.mp4" type="video/mp4" />
            </video>
          </ParallaxMedia>
          <WaterDrops containerRef={videoRef} />
          <div className="absolute inset-x-0 bottom-0 p-6" style={{ background: 'linear-gradient(180deg, transparent, rgba(18,42,28,0.75))' }}>
            <p className="text-white font-display text-lg">Recipe for Success</p>
            <p className="text-white/80 text-sm mt-1">Fresh, hygienic, and made with care every single day.</p>
          </div>
        </motion.div>

        <div>
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            What we do
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-6" style={{ color: colors.forestDeep }}>
            A bakery cafeteria built around every child&apos;s wellbeing
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: colors.inkSoft }}>
            We believe every child deserves to open their lunch box and find
            more than just a meal — they deserve attention and genuine care.
            That&apos;s why our brunch boxes, bakery menus, and event catering
            are designed for kindergarten and early-grade students, balancing
            nutrition, variety, and taste, with a close eye on food hygiene
            from prep to tray.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {cards.map((c) => (
              <TiltCard key={c.label} maxTilt={6}>
                <div
                  className="h-full rounded-3xl p-6"
                  style={{ background: colors.forestDeep, boxShadow: '0 20px 40px -16px rgba(18,42,28,0.45)' }}
                >
                  <TiltLayer z={30}>
                    <span
                      className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-4"
                      style={{ background: 'rgba(227,166,47,0.15)' }}
                    >
                      <c.icon size={20} color={colors.gold} />
                    </span>
                    <p className="font-display text-lg text-white mb-2">{c.label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{c.copy}</p>
                  </TiltLayer>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
