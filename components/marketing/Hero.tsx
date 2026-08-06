'use client'

import { useRef, type MouseEvent } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { ChevronDown, Wheat, Sparkles } from 'lucide-react'
import { Magnetic } from './Magnetic'
import { colors } from './theme'

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)
  const rafRef = useRef<number | null>(null)

  // Exit parallax: as the user scrolls past the hero, the video box drifts
  // and settles back slightly so the handoff into the next section feels
  // continuous rather than a hard cut.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const exitScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const exitY = useTransform(scrollYProgress, [0, 1], ['0%', '6%'])
  const exitOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35])
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  // Subtle desktop-only tilt (mouse-driven, same technique as TiltCard).
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  // getBoundingClientRect() forces a synchronous layout read — calling it on
  // every mousemove event (which can fire dozens of times per frame) was
  // blocking the main thread for 500ms+. Cache the rect once per hover
  // session instead, and coalesce updates to one per animation frame.
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!rectRef.current) {
      const el = videoWrapRef.current
      if (!el) return
      rectRef.current = el.getBoundingClientRect()
    }
    pendingRef.current = { x: e.clientX, y: e.clientY }
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const rect = rectRef.current
        const pos = pendingRef.current
        if (!rect || !pos) return
        const px = (pos.x - rect.left) / rect.width - 0.5
        const py = (pos.y - rect.top) / rect.height - 0.5
        rotateY.set(px * 8)
        rotateX.set(-py * 8)
      })
    }
  }
  function handleMouseLeave() {
    rectRef.current = null
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-5 sm:px-8 overflow-hidden"
      style={{ background: colors.forestDeep }}
    >
      {/* Ambient breathing glow behind the video. Baseline opacity/position
          live in `style` (not just the `animate` keyframes) so the element
          is never a fully-opaque, off-center blob before the animation
          engine takes over. */}
      <motion.div
        aria-hidden
        className="absolute w-[36rem] h-[36rem] rounded-full blur-[110px] pointer-events-none"
        style={{ background: colors.gold, top: '50%', left: '50%', x: '-50%', y: '-50%', opacity: 0.14 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.14, 0.24, 0.14] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating decorative accents */}
      <FloatingIcon icon={Wheat} className="hidden sm:block absolute top-[18%] left-[8%]" size={34} delay={0} duration={7} />
      <FloatingIcon icon={Sparkles} className="hidden sm:block absolute top-[24%] right-[10%]" size={26} delay={1.2} duration={8} />
      <FloatingIcon icon={Wheat} className="hidden sm:block absolute bottom-[14%] right-[14%]" size={22} delay={0.6} duration={9} />

      {/* Video: entrance reveal + scroll-exit parallax + mouse tilt, layered
          across separate elements so each transform composes independently. */}
      <div style={{ perspective: 1200 }} className="relative z-10 w-full max-w-5xl">
        <motion.div style={{ scale: exitScale, y: exitY, opacity: exitOpacity }}>
          <motion.div
            ref={videoWrapRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(16px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ rotateX, rotateY }}
            className="relative w-full aspect-video rounded-[1.75rem] overflow-hidden"
          >
            <div
              className="absolute inset-0 rounded-[1.75rem]"
              style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)' }}
            />
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="/videos/hero-wheat-to-smiles-poster.jpg"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/hero-wheat-to-smiles.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </motion.div>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9 }}
        className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <Magnetic>
          <a
            href="#apply"
            className="inline-block px-7 py-3.5 rounded-full font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: colors.gold, color: colors.forestDeep, boxShadow: '0 10px 28px rgba(227,166,47,0.35)' }}
          >
            Apply Your School
          </a>
        </Magnetic>
        <Magnetic strength={0.2}>
          <a
            href="#menu"
            className="inline-block px-7 py-3.5 rounded-full font-semibold text-sm text-white transition-transform hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            See Our Menu
          </a>
        </Magnetic>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        style={{ opacity: cueOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Scroll
        </span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={18} color="rgba(255,255,255,0.55)" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function FloatingIcon({
  icon: Icon,
  className,
  size = 28,
  delay = 0,
  duration = 7,
}: {
  icon: typeof Wheat
  className?: string
  size?: number
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      aria-hidden
      className={className}
      style={{ opacity: 0.16 }}
      animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Icon size={size} color={colors.gold} strokeWidth={1.5} />
    </motion.div>
  )
}
