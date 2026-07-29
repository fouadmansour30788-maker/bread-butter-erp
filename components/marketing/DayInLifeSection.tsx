'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { marketingImages } from './images'
import { colors } from './theme'

const STAGES = [
  {
    image: marketingImages.menuPastries,
    time: '5:30 AM',
    title: 'Before sunrise, the prep begins',
    copy: "Dough is proofed, pastries are baked, and the day's menu comes together before most of the city wakes up.",
  },
  {
    image: marketingImages.catering,
    time: '7:00 AM',
    title: 'Fresh stock reaches every kiosk',
    copy: 'Weekly deliveries land at each school, counted and logged before the first bell rings.',
  },
  {
    image: marketingImages.hero,
    time: '10:30 AM',
    title: 'Recess means a real meal',
    copy: 'Brunch boxes and bakery favorites replace vending-machine snacks — actual nutrition, not just filler.',
  },
  {
    image: marketingImages.healthImpact,
    time: '2:00 PM',
    title: 'Afternoon energy that lasts',
    copy: 'No sugar crash, no slump — just steady focus through to the final class.',
  },
] as const

// Boundary keyframes for a clean crossfade: first stage starts fully
// visible (no fade-in), last stage ends fully visible (no fade-out), and
// each internal boundary fades stage i out exactly as stage i+1 fades in.
function fadeKeyframes(i: number, total: number, edge: number) {
  const start = i / total
  const end = (i + 1) / total
  if (i === 0) return { input: [start, end - edge, end], output: [1, 1, 0] }
  if (i === total - 1) return { input: [start, start + edge, end], output: [0, 1, 1] }
  return { input: [start, start + edge, end - edge, end], output: [0, 1, 1, 0] }
}

export function DayInLifeSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const edge = 0.5 / STAGES.length / 2

  return (
    <section id="day-in-life" ref={ref} className="relative" style={{ height: `${STAGES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {STAGES.map((stage, i) => (
          <Stage key={stage.title} stage={stage} progress={scrollYProgress} keyframes={fadeKeyframes(i, STAGES.length, edge)} />
        ))}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {STAGES.map((_, i) => (
            <Dot key={i} progress={scrollYProgress} keyframes={fadeKeyframes(i, STAGES.length, edge)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Stage({
  stage,
  progress,
  keyframes,
}: {
  stage: (typeof STAGES)[number]
  progress: MotionValue<number>
  keyframes: { input: number[]; output: number[] }
}) {
  const opacity = useTransform(progress, keyframes.input, keyframes.output)
  const y = useTransform(progress, [keyframes.input[0], keyframes.input[keyframes.input.length - 1]], ['4%', '-4%'])

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <motion.div className="absolute inset-0" style={{ y, scale: 1.12 }}>
        <img src={stage.image} alt={stage.title} className="w-full h-full object-cover" />
      </motion.div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(18,42,28,0.55), rgba(18,42,28,0.78))' }} />
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full">
          <div className="max-w-lg">
            <p className="uppercase tracking-[0.2em] text-xs font-semibold mb-3" style={{ color: colors.gold }}>{stage.time}</p>
            <h3 className="font-display font-semibold text-3xl sm:text-4xl text-white leading-tight mb-4">{stage.title}</h3>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.85)' }}>{stage.copy}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Dot({ progress, keyframes }: { progress: MotionValue<number>; keyframes: { input: number[]; output: number[] } }) {
  const opacity = useTransform(progress, keyframes.input, keyframes.output.map((o) => 0.35 + o * 0.65))
  return <motion.span className="w-6 h-1.5 rounded-full" style={{ opacity, background: colors.gold }} />
}
