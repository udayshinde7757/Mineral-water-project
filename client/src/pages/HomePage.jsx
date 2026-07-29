import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiDroplet, FiShield, FiGlobe } from 'react-icons/fi'

const MotionLink = motion(Link)

// ─── Easing ───────────────────────────────────────────────────────────────────
const easeOut = [0.22, 1, 0.36, 1]

// ─── Variants ─────────────────────────────────────────────────────────────────
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const wordReveal = {
  hidden: { opacity: 0, y: 48, rotateX: 8 },
  visible: {
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
}

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: easeOut, delay: 0.45 + i * 0.12 },
  }),
  hover: {
    scale: 1.04,
    transition: { type: 'spring', stiffness: 400, damping: 12 },
  },
  tap: { scale: 0.98 },
}

const scrollReveal = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

// ─── Bubble Particles ─────────────────────────────────────────────────────────
const bubbles = [
  { size: 24, x: '10%', duration: 7, delay: 0 },
  { size: 14, x: '25%', duration: 9, delay: 1.2 },
  { size: 32, x: '45%', duration: 8, delay: 0.5 },
  { size: 18, x: '65%', duration: 10, delay: 2 },
  { size: 26, x: '80%', duration: 7.5, delay: 0.8 },
  { size: 12, x: '90%', duration: 11, delay: 1.5 },
  { size: 20, x: '35%', duration: 8.5, delay: 3 },
  { size: 16, x: '72%', duration: 9.5, delay: 0.3 },
]

function BubbleParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            bottom: '-5%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.06))',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.3)',
          }}
          animate={{
            y: [0, -250, -500, -750],
            x: [0, 15, -10, 5],
            opacity: [0, 0.5, 0.4, 0],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// ─── Animated Gradient Blobs (water-ripple background) ────────────────────────
function WaterBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="water-blob absolute -top-[20%] -left-[10%] w-[60%] aspect-square"
        style={{
          background: 'radial-gradient(circle, rgba(1,186,239,0.25), transparent 70%)',
          animation: 'blob 18s ease-in-out infinite',
        }}
      />
      <div
        className="water-blob absolute -bottom-[15%] -right-[10%] w-[55%] aspect-square"
        style={{
          background: 'radial-gradient(circle, rgba(11,79,108,0.2), transparent 70%)',
          animation: 'blob-reverse 22s ease-in-out infinite',
        }}
      />
      <div
        className="water-blob absolute top-[30%] right-[20%] w-[40%] aspect-square"
        style={{
          background: 'radial-gradient(circle, rgba(199,240,232,0.2), transparent 70%)',
          animation: 'blob 20s ease-in-out infinite 5s',
        }}
      />
      <div
        className="water-blob absolute top-[10%] left-[40%] w-[35%] aspect-square"
        style={{
          background: 'radial-gradient(circle, rgba(255,221,149,0.08), transparent 70%)',
          animation: 'blob 25s ease-in-out infinite 3s',
        }}
      />
    </div>
  )
}

// ─── SVG Wave Layers ──────────────────────────────────────────────────────────
function WaveLayers() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-32 sm:h-48 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg
        className="wave-layer"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ animation: 'wave 8s ease-in-out infinite', opacity: 0.06 }}
      >
        <path
          d="M0,60 C320,120 480,0 720,60 C960,120 1120,0 1440,60 L1440,120 L0,120 Z"
          fill="#01BAEF"
        />
      </svg>
      <svg
        className="wave-layer"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ animation: 'wave-slow 12s ease-in-out infinite', opacity: 0.04, bottom: '-4px' }}
      >
        <path
          d="M0,40 C240,100 540,0 720,40 C900,80 1200,0 1440,40 L1440,120 L0,120 Z"
          fill="#0B4F6C"
        />
      </svg>
    </div>
  )
}

// ─── Scroll Cue ───────────────────────────────────────────────────────────────
function ScrollCue() {
  return (
    <motion.div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.8 }}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] font-medium"
            style={{ color: 'rgba(255,255,255,0.45)' }}>
        Scroll
      </span>
      <div className="scroll-cue flex flex-col items-center">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </motion.div>
  )
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
function HomePage() {
  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center justify-center min-h-[90vh] overflow-hidden section-padding"
        style={{
          background: 'linear-gradient(160deg, #0B4F6C 0%, #07313F 35%, #094055 65%, #0B4F6C 100%)',
        }}
      >
        {/* Animated water ripple blobs */}
        <WaterBlobs />

        {/* Floating bubble particles */}
        <BubbleParticles />

        {/* Wave layers at bottom */}
        <WaveLayers />

        {/* Content */}
        <motion.div
          className="container-app text-center relative z-10"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow tag */}
          <motion.p
            variants={fadeUp}
            className="text-sm font-semibold tracking-[0.2em] uppercase mb-5"
            style={{ color: 'rgba(1, 186, 239, 0.8)' }}
          >
            Pure · Natural · Certified
          </motion.p>

          {/* Headline — staggered word reveal */}
          <h1
            className="text-4xl sm:text-5xl md:text-display-xl font-extrabold mb-5 leading-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="sr-only">Pure from Source to Every Bottle</span>
            <span className="flex flex-col items-center gap-1" aria-hidden="true">
              <span className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4">
                {'Pure from Source'.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    variants={wordReveal}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4">
                {'to Every Bottle'.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    variants={wordReveal}
                    className="inline-block"
                    custom={i}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </span>
          </h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 sm:mb-12"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            AquaPure delivers the finest natural mineral water, sourced from protected springs
            and sealed with care for your health and wellbeing.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={container}
          >
            <MotionLink
              to="/products"
              custom={0}
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              className="btn-primary !px-9 !py-3.5 !text-sm sm:!text-base"
            >
              Explore Products
            </MotionLink>
            <MotionLink
              to="/about"
              custom={1}
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              className="btn-outline-white !px-9 !py-3.5 !text-sm sm:!text-base"
            >
              Our Story
            </MotionLink>
          </motion.div>
        </motion.div>

        {/* Scroll Cue */}
        <ScrollCue />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHY AQUAPURE SECTION (replaces old placeholder)
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="section-padding relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #F4FBFD 0%, #DDF3F5 40%, #C7F0E8 100%)',
        }}
      >
        <div className="container-app text-center relative z-10">
          {/* Eyebrow */}
          <motion.p
            className="section-label mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            Coming Next
          </motion.p>

          {/* Heading */}
          <motion.h2
            className="section-title mb-14 sm:mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}
          >
            What Sets Us Apart
          </motion.h2>

          {/* 3-Column Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto">
            {[
              {
                Icon: FiDroplet,
                title: '100% Natural Spring Source',
                desc: 'Sourced from protected natural springs, untouched and pure.',
              },
              {
                Icon: FiShield,
                title: 'Certified Purity Testing',
                desc: 'Every batch undergoes rigorous quality certification.',
              },
              {
                Icon: FiGlobe,
                title: 'Eco-Friendly Packaging',
                desc: 'Sustainably bottled with minimal environmental impact.',
              },
            ].map((col, i) => (
              <motion.div
                key={col.title}
                className="flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: easeOut, delay: 0.2 + i * 0.1 }}
              >
                {/* Icon badge */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, rgba(11,79,108,0.1), rgba(1,186,239,0.15))' }}
                >
                  <col.Icon className="w-7 h-7" style={{ color: '#0B4F6C' }} />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{col.title}</h3>
                <p className="text-sm text-darkgray-light leading-relaxed max-w-[18rem]">
                  {col.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
