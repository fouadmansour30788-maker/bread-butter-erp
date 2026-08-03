import { colors } from './theme'

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen w-full flex items-center justify-center py-24 px-5 sm:px-8"
      style={{ background: colors.forestDeep }}
    >
      {/* Contained rectangle (not full-bleed) — aspect-video matches the
          source's native 16:9 exactly, so object-cover never has to crop
          anything out. */}
      <div
        className="relative w-full max-w-5xl aspect-video rounded-[1.75rem] overflow-hidden"
        style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)' }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/hero-dough-to-joy-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-dough-to-joy.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  )
}
