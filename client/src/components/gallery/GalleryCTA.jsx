import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiPhoneCall, FiDroplet } from 'react-icons/fi'
import { ROUTES } from '@constants/routes'

function GalleryCTA() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-teal-600 p-8 sm:p-12 md:p-16 shadow-2xl text-white">
        {/* Background decorative water splash rings */}
        <div className="aria-hidden:true pointer-events-none absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
        <div className="aria-hidden:true pointer-events-none absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-400/20 blur-2xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-medium text-xs uppercase tracking-wider mb-6"
          >
            <FiDroplet className="w-3.5 h-3.5 text-cyan-200" />
            <span>PURE HYDRATION AWAITS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight"
          >
            Experience Pure Water
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-blue-100 leading-relaxed font-normal mb-8 max-w-2xl mx-auto"
          >
            Join thousands of satisfied families and businesses who trust AquaPure for pristine, certified, and mineral-balanced drinking water every day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to={ROUTES.PRODUCTS}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-700 font-bold text-sm shadow-lg hover:bg-blue-50 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <span>Explore Products</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to={ROUTES.CONTACT}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-800/40 backdrop-blur-md text-white border border-white/20 font-semibold text-sm hover:bg-primary-800/60 hover:border-white/40 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <FiPhoneCall className="w-4 h-4 text-teal-300" />
              <span>Contact Us</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default GalleryCTA
