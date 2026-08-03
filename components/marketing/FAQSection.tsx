'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { colors } from './theme'

const faqs = [
  {
    q: 'How is pricing determined for a school?',
    a: "Pricing depends on your school's size, the services you need (Brunch Box, bakery menu, catering, or a mix), and delivery frequency. After you submit the application form, our team puts together a tailored proposal — there's no one-size-fits-all package.",
  },
  {
    q: 'How do you handle allergies and dietary restrictions?',
    a: "We ask every school to share known allergies and dietary needs during onboarding, and we work with your staff to plan menus around them. Mention any specific requirements in the application form and we'll follow up before any food is delivered.",
  },
  {
    q: 'How often do you deliver, and how does stock work?',
    a: "Deliveries run on a weekly cycle — fresh stock arrives at your school's kiosk, with our team tracking what's delivered, sold, and remaining throughout the week to keep things running smoothly.",
  },
  {
    q: 'What hygiene practices do you follow?',
    a: 'Food is prepared fresh, stored under proper temperature control, and handled by trained staff from prep to tray. Every delivery and kiosk count is logged, so we can catch and correct issues quickly.',
  },
  {
    q: 'Is there a minimum school size to work with Bread & Butter?',
    a: "We work with schools of different sizes across North Lebanon. Tell us about your school in the application form and we'll let you know the best way to get started.",
  },
  {
    q: 'How long does onboarding take once we apply?',
    a: 'After you submit the form, our team typically reaches out within a few business days to discuss your school\'s needs and next steps.',
  },
  {
    q: 'Do you offer catering for one-off school events, or only regular kiosk service?',
    a: 'Both — we run weekly kiosk deliveries for daily brunch and bakery needs, and separate event catering for things like sports days, graduations, and parent events.',
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative overflow-hidden py-24 sm:py-32" style={{ background: colors.cream }}>
      <div aria-hidden className="absolute top-1/3 -right-24 w-72 h-72 rounded-full blur-3xl opacity-[0.12] pointer-events-none" style={{ background: colors.forestMid }} />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.goldDark }}>
            Common questions
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight" style={{ color: colors.forestDeep }}>
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <div
                key={item.q}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'white', border: `1px solid ${colors.sageLight}` }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                >
                  <span className="font-display text-base sm:text-lg" style={{ color: colors.forestDeep }}>{item.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: colors.sageLight }}
                  >
                    <Plus size={16} color={colors.forest} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: colors.inkSoft }}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
