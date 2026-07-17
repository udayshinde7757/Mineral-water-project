// ─── HomePage ─────────────────────────────────────────────────────────────────
// Sections: Hero, Features, WhyChooseUs, Stats, Testimonials, CTA

function HomePage() {
  return (
    <div>
      {/* Hero Section Placeholder */}
      <section className="section-padding bg-gradient-hero flex items-center justify-center min-h-[90vh]">
        <div className="container-app text-center text-white">
          <p className="section-label text-teal-300 mb-4">Pure · Natural · Certified</p>
          <h1 className="text-5xl md:text-display-xl font-extrabold mb-6 leading-tight">
            Pure from Source<br />to Every Bottle
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            AquaPure delivers the finest natural mineral water, sourced from protected springs
            and sealed with care for your health and wellbeing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/products" className="btn-primary">Explore Products</a>
            <a href="/about"    className="btn-outline-white">Our Story</a>
          </div>
        </div>
      </section>

      {/* Remaining sections will be built in Phase 3 */}
      <section className="section-padding bg-lightblue">
        <div className="container-app text-center">
          <p className="section-label mb-3">Coming Next</p>
          <h2 className="section-title">Features, Products & More</h2>
          <p className="section-subtitle mx-auto mt-4 text-center">
            This page is under active development. Full content and sections will be added in Phase 3.
          </p>
        </div>
      </section>
    </div>
  )
}

export default HomePage
