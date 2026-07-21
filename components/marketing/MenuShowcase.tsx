'use client'

import { motion } from 'framer-motion'
import { TiltCard, TiltLayer } from './TiltCard'
import { marketingImages } from './images'
import { colors } from './theme'

const items = [
  {
    image: marketingImages.hero,
    title: 'Brunch Box',
    copy: 'A balanced, boxed meal designed for kindergarten and early-grade students — appealing, varied, and hygienically packed and served fresh every day.',
  },
  {
    image: marketingImages.menuPastries,
    title: 'Bakery Favourites',
    copy: 'Buttery croissants, za’atar manakish, and cheese pastries baked fresh, with a big focus on food hygiene from prep to display.',
  },
  {
    image: marketingImages.menuSandwich,
    title: 'Sandwich & Baguette Bar',
    copy: 'Fresh-baked baguettes and sandwiches, made to order with quality fillings — a Recipe for Success we keep every single day.',
  },
]

export function MenuShowcase() {
  return (
    <section id="menu" className="py-24 sm:py-32" style={{ background: colors.cream }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            Our menu
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight mb-5" style={{ color: colors.forestDeep }}>
            Made fresh, made with care
          </h2>
          <p className="text-base leading-relaxed" style={{ color: colors.inkSoft }}>
            From the daily Brunch Box to bakery counters and sandwich bars —
            every item balances taste, nutrition, and cleanliness.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <TiltCard maxTilt={8}>
                <div
                  className="h-full rounded-3xl overflow-hidden"
                  style={{ background: 'white', boxShadow: '0 20px 45px -20px rgba(18,42,28,0.35)' }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <TiltLayer z={20} className="p-6">
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
