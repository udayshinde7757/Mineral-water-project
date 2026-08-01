import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiDroplet, FiHome, FiMail } from 'react-icons/fi'
import { ROUTES } from '@constants/routes'

const easeOut = [0.22, 1, 0.36, 1]

// ─── NotFoundPage ─────────────────────────────────────────────────────────────
function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found — AquaPure'
  }, [])

  return (
    <section
      className="section-padding flex items-center justify-center min-h-[75vh] overflow-hidden relative"
      style={{ background: 'linear-gradient(170deg, #EEF6FB 0%, #F8FBFD 60%, #ffffff 100%)' }}
      aria-labelledby="not-found-heading"
    >
      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#22D3EE]/5 blur-3xl rounded-full pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0F4C81]/5 blur-3xl rounded-full pointer-events-none" aria-hidden="true" />

      <div className="container-app text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="space-y-6"
        >
          {/* Animated Droplet Icon */}
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mx-auto mb-2"
            style={{ background: 'linear-gradient(135deg, rgba(15,76,129,0.08), rgba(34,211,238,0.12))' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <FiDroplet className="w-12 h-12" style={{ color: '#0F4C81' }} />
          </motion.div>

          {/* Large 404 */}
          <p
            className="text-[7rem] sm:text-[10rem] md:text-[12rem] font-extrabold leading-none select-none text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #0F4C81, #22D3EE)' }}
            aria-hidden="true"
          >
            404
          </p>

          <h1 id="not-found-heading" className="text-2xl md:text-3xl font-bold" style={{ color: '#102A43' }}>
            Oops! This page has gone dry
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: '#486581' }}>
            The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back to fresh water.
          </p>

          {/* Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.3 }}
          >
            <Link
              to={ROUTES.HOME}
              className="btn-primary inline-flex items-center gap-2"
            >
              <FiHome className="w-4 h-4" aria-hidden="true" />
              Back to Home
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <FiMail className="w-4 h-4" aria-hidden="true" />
              Contact Support
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default NotFoundPage
