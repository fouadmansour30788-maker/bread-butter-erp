'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { TiltCard, TiltLayer } from './TiltCard'
import { ParallaxMedia } from './ParallaxMedia'
import { marketingImages } from './images'
import { colors } from './theme'

const commitments = [
  'All products prepared fresh, daily',
  'No preservatives or hydrogenated fats',
  'Whole wheat flour in our core bakery items',
  '100% natural (animal) butter',
  'Extra virgin olive oil in our zaatar mix',
  'High-quality natural, pasteurized cheeses',
]

const bakery = [
  {
    name: 'Whole Wheat Zaatar Manakish',
    detail: '100g whole-wheat dough, topped with 35g zaatar mixed with extra virgin olive oil.',
  },
  {
    name: 'Whole Wheat Cheese Manakish',
    detail: '100g whole-wheat dough, topped with 35g natural pasteurized cheese.',
  },
  {
    name: 'Whole Wheat Feuilleté',
    detail: 'Flaky croissant-dough pastry made with 100% natural butter, filled with natural cheese or zaatar. Baked fresh daily, no preservatives — at least 100g, a filling, balanced meal for the school day.',
  },
  {
    name: 'Whole Wheat Croissant',
    detail: 'Made with 100% natural butter, filled with labneh or natural cheese, at least 90g.',
  },
  {
    name: 'Labneh & Vegetable Sandwich',
    detail: 'Whole-wheat baguette with fresh labneh, cucumber, lettuce, and mint or seasonal vegetables, at least 150g.',
  },
]

const beverages = [
  'Mineral water',
  'Fresh lemon juice, no added sugar (200ml)',
  'Fresh carrot juice, no added sugar (200ml)',
  'Milk (125ml)',
  'Selected fruit juices — 100% juice, no added sugar, prioritized where available',
]

const desserts = [
  { name: 'Homemade cookies', detail: 'Baked fresh daily, no preservatives, at least 25g.' },
  { name: 'Chocolate', detail: 'Limited, individually-sized portions, max 25g — water, milk, and healthy options always offered first.' },
]

export function MenuShowcase() {
  return (
    <section id="menu" className="py-24 sm:py-32" style={{ background: colors.cream }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-12">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            Because a student&apos;s health starts with their food
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-5" style={{ color: colors.forestDeep }}>
            A daily menu built for the school day
          </h2>
          <p className="text-base leading-relaxed" style={{ color: colors.inkSoft }}>
            Every item is prepared fresh with real portions and real
            ingredients — a genuine meal, not just a snack.
          </p>
        </div>

        {/* Banner image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[1.75rem] overflow-hidden aspect-[21/9] mb-8"
          style={{ boxShadow: '0 20px 45px -20px rgba(18,42,28,0.35)' }}
        >
          <ParallaxMedia className="h-full">
            <img src={marketingImages.menuPastries} alt="Fresh bakery items" className="w-full h-full object-cover" />
          </ParallaxMedia>
        </motion.div>

        {/* Commitments, as a compact chip row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="flex flex-wrap gap-2.5 mb-16"
        >
          {commitments.map((c) => (
            <span
              key={c}
              className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full text-xs sm:text-sm font-medium"
              style={{ background: colors.forestDeep, color: 'white' }}
            >
              <CheckCircle2 size={14} color={colors.gold} className="shrink-0" />
              {c}
            </span>
          ))}
        </motion.div>

        {/* Bakery — two fully-filled rows (2 manakish + 3 others) rather than a
            5-item/3-col grid, which leaves a gap in an incomplete last row */}
        <p className="uppercase tracking-[0.15em] text-xs font-semibold mb-5" style={{ color: colors.goldDark }}>
          Bakery
        </p>
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          {bakery.slice(0, 2).map((item, i) => (
            <BakeryCard key={item.name} item={item} delay={i * 0.08} />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {bakery.slice(2).map((item, i) => (
            <BakeryCard key={item.name} item={item} delay={i * 0.08} />
          ))}
        </div>

        {/* Beverages + Desserts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-2 gap-6"
        >
          <div className="rounded-3xl p-6" style={{ background: colors.creamDeep, border: `1px solid ${colors.sageLight}` }}>
            <p className="uppercase tracking-[0.15em] text-xs font-semibold mb-4" style={{ color: colors.goldDark }}>Beverages</p>
            <ul className="space-y-2.5">
              {beverages.map((b) => (
                <li key={b} className="text-sm leading-relaxed" style={{ color: colors.inkSoft }}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl p-6" style={{ background: colors.creamDeep, border: `1px solid ${colors.sageLight}` }}>
            <p className="uppercase tracking-[0.15em] text-xs font-semibold mb-4" style={{ color: colors.goldDark }}>Desserts</p>
            <div className="space-y-3">
              {desserts.map((d) => (
                <div key={d.name}>
                  <p className="text-sm font-semibold" style={{ color: colors.forestDeep }}>{d.name}</p>
                  <p className="text-xs leading-relaxed" style={{ color: colors.inkSoft }}>{d.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mt-16 rounded-3xl p-8 sm:p-10 text-center"
          style={{ background: colors.forestDeep }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-base sm:text-lg italic leading-relaxed mb-4 text-white">
              &ldquo;Our goal isn&apos;t just to feed students — it&apos;s to give them a
              balanced meal that fuels learning, supports focus, and nurtures
              healthy growth. School, family, and cafeteria are partners in
              building a generation with better health and sound eating
              habits.&rdquo;
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Our menu is reviewed regularly with a nutrition specialist, and
              adapted to the latest guidance, school policy, and the needs of
              different age groups.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function BakeryCard({ item, delay }: { item: { name: string; detail: string }; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
    >
      <TiltCard maxTilt={6}>
        <div
          className="h-full rounded-3xl p-6"
          style={{ background: 'white', border: `1px solid ${colors.sageLight}`, boxShadow: '0 12px 30px -18px rgba(18,42,28,0.2)' }}
        >
          <TiltLayer z={20}>
            <p className="font-display text-lg mb-2" style={{ color: colors.forestDeep }}>{item.name}</p>
            <p className="text-sm leading-relaxed" style={{ color: colors.inkSoft }}>{item.detail}</p>
          </TiltLayer>
        </div>
      </TiltCard>
    </motion.div>
  )
}
