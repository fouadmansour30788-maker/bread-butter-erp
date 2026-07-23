'use client'

import { motion } from 'framer-motion'
import { Thermometer, ChefHat, ClipboardCheck, ListChecks, Wheat, ShieldCheck } from 'lucide-react'
import { TiltCard, TiltLayer } from './TiltCard'
import { colors } from './theme'

const practices = [
  {
    icon: Thermometer,
    title: 'Temperature-controlled, always',
    copy: 'Ingredients and prepared food are stored and transported under proper temperature control, from kitchen to kiosk.',
  },
  {
    icon: ChefHat,
    title: 'Trained kitchen staff',
    copy: 'Everyone handling food is trained in hygienic prep and handling practices before they touch a single tray.',
  },
  {
    icon: ClipboardCheck,
    title: 'Daily kiosk checks',
    copy: 'Each school kiosk is checked daily for cleanliness and food safety, not just on delivery day.',
  },
  {
    icon: ListChecks,
    title: 'Full batch traceability',
    copy: 'Every delivery, stock count, and waste entry is logged, so any issue can be traced back and corrected fast.',
  },
  {
    icon: Wheat,
    title: 'Fresh, not frozen',
    copy: 'Menus are prepared fresh on a weekly cycle rather than stockpiled — quality over shelf life.',
  },
  {
    icon: ShieldCheck,
    title: 'Allergen-aware planning',
    copy: 'We work with schools to plan around known allergies and dietary needs before food ever reaches a tray.',
  },
]

export function HygieneSection() {
  return (
    <section id="hygiene" className="py-24 sm:py-32" style={{ background: colors.creamDeep }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            Trust &amp; safety
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-5" style={{ color: colors.forestDeep }}>
            Food safety isn&apos;t an afterthought — it&apos;s the process
          </h2>
          <p className="text-base leading-relaxed" style={{ color: colors.inkSoft }}>
            From prep to tray, every step is designed around hygiene,
            freshness, and accountability — so schools and parents can trust
            what shows up on the tray.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {practices.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
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
                      <item.icon size={20} color={colors.forest} />
                    </span>
                    <p className="font-display text-lg mb-2" style={{ color: colors.forestDeep }}>{item.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: colors.inkSoft }}>{item.copy}</p>
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
