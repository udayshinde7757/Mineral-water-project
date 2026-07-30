import { motion } from 'framer-motion'
import GalleryCard from './GalleryCard'

// ─── Container stagger variants ─────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

// ─── GalleryGrid ────────────────────────────────────────────────────────────
function GalleryGrid({ images, onSelectImage }) {
  if (!images || images.length === 0) {
    return (
      <section className="relative overflow-hidden py-16 md:py-24 bg-[#EEF6FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 max-w-md mx-auto">
            <p className="text-gray-500 font-medium text-base">No images found in this category.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-[#EEF6FB]">
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
