export function Hero() {
  return (
    <section id="top" className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-classroom-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-classroom.mp4" type="video/mp4" />
      </video>
    </section>
  )
}
