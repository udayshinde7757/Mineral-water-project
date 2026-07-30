import { motion } from 'framer-motion'
import { FiDroplet, FiCheckCircle } from 'react-icons/fi'

function GalleryHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-blue-50/60 via-white to-white">
      {/* Decorative blurred background ambient glowing circles */}
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 overflow-hidden">
        <div className="absolute -top-20 -left-10 w-96 h-96 rounded-full bg-primary-100/60 blur-3xl opacity-70" />
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-teal-100/60 blur-3xl opacity-60" />
        <div className="absolute top-32 left-1/3 w-80 h-80 rounded-full bg-primary-200/40 blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Small Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200/60 text-primary-700 font-semibold text-xs uppercase tracking-wider shadow-sm mb-6"
        >
          <FiDroplet className="w-3.5 h-3.5 text-primary-600" />
          <span>VISUAL STORY</span>
        </motion.div>

        {/* Large Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-darkgray tracking-tight leading-tight md:leading-none mb-6"
        >
          Our Journey of <span className="text-gradient">Pure Water</span>
        </motion.h1>

        {/* Description (max ~700px width) */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-[700px] mx-auto text-base sm:text-lg text-darkgray-light leading-relaxed font-normal mb-8"
        >
          Explore AquaPure through our official corporate gallery. Step behind the scenes to see how we collect natural spring water, apply 8-stage purification, execute rigorous quality testing in certified laboratories, and deliver pristine hydration safely to thousands of homes and businesses every day.
        </motion.p>

        {/* Feature Pill Highlights */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 shadow-brand-sm text-xs sm:text-sm font-medium text-gray-700"
        >
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-teal-500 w-4 h-4" />
            <span>Natural Source</span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-teal-500 w-4 h-4" />
            <span>RO & Ozone Purification</span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-teal-500 w-4 h-4" />
            <span>100% Sealed Freshness</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default GalleryHero
