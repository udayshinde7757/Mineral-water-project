import { motion } from 'framer-motion'
import GalleryCard from './GalleryCard'

// ─── Background bubble particles ────────────────────────────────────────────
const bubbles = [
  { size: 20, x: '8%',  duration: 8,  delay: 0 },
  { size: 12, x: '25%', duration: 10, delay: 1.5 },
  { size: 16, x: '50%', duration: 9,  delay: 0.8 },
  { size: 10, x: '72%', duration: 11, delay: 2.5 },
  { size: 14, x: '90%', duration: 8.5, delay: 1 },
]

// ─── Container stagger variants ─────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

function BubbleLayer() {
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
            background: 'radial-gradient(circle at 30% 30%, rgba(1,186,239,0.15), transparent)',
            border: '1px solid rgba(1,186,239,0.08)',
          }}
          animate={{
            y: [0, -200, -400, -600],
            x: [0, 10, -8, 3],
            opacity: [0, 0.3, 0.2, 0],
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

function WaveLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-32 opacity-[0.04]"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ animation: 'wave 8s ease-in-out infinite' }}
      >
        <path d="M0,60 C320,120 480,0 720,60 C960,120 1120,0 1440,60 L1440,120 L0,120 Z" fill="#01BAEF" />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-[200%] h-32 opacity-[0.025]"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ animation: 'wave-slow 12s ease-in-out infinite', bottom: '-4px' }}
      >
        <path d="M0,40 C240,100 540,0 720,40 C900,80 1200,0 1440,40 L1440,120 L0,120 Z" fill="#0B4F6C" />
      </svg>
    </div>
  )
}

// ─── GalleryGrid ────────────────────────────────────────────────────────────
function GalleryGrid({ images, onSelectImage }) {
  if (!images || images.length === 0) {
    return (
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{
          background: 'linear-gradient(180deg, #F4FBFD 0%, #DDF3F5 40%, #C7F0E8 100%)',
        }}
      >
        <WaveLayer />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 max-w-md mx-auto">
            <p className="text-gray-500 font-medium text-base">No images found in this category.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        background: 'linear-gradient(180deg, #F4FBFD 0%, #DDF3F5 40%, #C7F0E8 100%)',
      }}
    >
      {/* Animated background layers */}
      <WaveLayer />
      <BubbleLayer />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── Section Heading ─────────────────────────────────────────── */}
        <div className="text-center mb-12 sm:mb-14">
          <motion.p
            className="section-label mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Our Collection
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            Explore Our Range
          </motion.h2>
          <motion.p
            className="section-subtitle mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            From daily hydration to bulk supply — crafted for every need.
          </motion.p>
        </div>

        {/* ─── Premium Uniform Grid ───────────────────────────────────── */}
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {images.map((img, idx) => (
            <GalleryCard
              key={img.id}
              image={img}
              index={idx}
              onClick={onSelectImage}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default GalleryGrid
