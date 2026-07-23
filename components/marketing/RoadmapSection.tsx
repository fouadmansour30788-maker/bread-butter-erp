'use client'

import { motion } from 'framer-motion'
import { CreditCard, Network, BookOpen, Trophy, ShieldCheck, Gift, Recycle, Sprout } from 'lucide-react'
import { TiltCard, TiltLayer } from './TiltCard'
import { colors } from './theme'

const pillars = [
  {
    icon: CreditCard,
    title: 'Digital payments & order tracking',
    copy: 'Parents top up an account and see exactly what their child orders, in real time — no cash lost in backpacks.',
  },
  {
    icon: Network,
    title: 'The Bread & Butter ecosystem',
    copy: 'One connected platform linking schools, parents, and students — ordering, communication, and wellbeing in a single place.',
  },
  {
    icon: BookOpen,
    title: 'A growing nutrition education hub',
    copy: 'Turning our health tips into a full library of guidance for parents, teachers, and students.',
  },
  {
    icon: Trophy,
    title: 'Healthy eating competitions',
    copy: 'Friendly leaderboards between classes and between schools that reward balanced choices, not just participation.',
  },
  {
    icon: ShieldCheck,
    title: 'Allergy & safety profiles',
    copy: 'Parents register allergies once; the system flags conflicting orders automatically, before food ever reaches a tray.',
  },
  {
    icon: Gift,
    title: 'Rewards for healthy choices',
    copy: 'Points for choosing fruit over candy, redeemable for future meals — turning good habits into a game.',
  },
  {
    icon: Recycle,
    title: 'Smarter, lower-waste kitchens',
    copy: 'Real order data helps us plan production per school precisely, cutting food waste without cutting portions.',
  },
  {
    icon: Sprout,
    title: 'Local & transparent sourcing',
    copy: 'Showing parents where ingredients come from, so "wholesome" is something they can verify, not just read.',
  },
]

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 sm:py-32" style={{ background: colors.cream }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            The road ahead
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-5" style={{ color: colors.forestDeep }}>
            Where Bread &amp; Butter is headed next
          </h2>
          <p className="text-base leading-relaxed" style={{ color: colors.inkSoft }}>
            Today&apos;s brunch boxes and bakery menus are just the start. Here&apos;s
            the platform we&apos;re building toward — for schools, parents, and
            the kids in between.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            >
              <TiltCard maxTilt={7}>
                <div
                  className="h-full rounded-3xl p-6"
                  style={{ background: colors.forestDeep, boxShadow: '0 20px 40px -16px rgba(18,42,28,0.45)' }}
                >
                  <TiltLayer z={30}>
                    <span
                      className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-4"
                      style={{ background: 'rgba(227,166,47,0.15)' }}
                    >
                      <p.icon size={20} color={colors.gold} />
                    </span>
                    <p className="font-display text-lg text-white mb-2 leading-snug">{p.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{p.copy}</p>
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
