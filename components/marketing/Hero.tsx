export function Hero() {
  return (
    <section id="top" className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/bread-butter-brand-film-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/bread-butter-brand-film.mp4" type="video/mp4" />
      </video>
    </section>
  )
}
