import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowUp } from 'react-icons/fi'

// ─── ScrollToTop ──────────────────────────────────────────────────────────────
// 1. Automatically scrolls window to top on route change.
// 2. Displays a sleek, interactive Floating "Back to Top" button on scroll.

function ScrollToTop() {
  const { pathname } = useLocation()
  const [isVisible, setIsVisible] = useState(false)

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  // Track scroll position to show/hide Back to Top button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          aria-label="Scroll back to top of page"
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-[#0F4C81] text-white shadow-lg shadow-[#0F4C81]/30 hover:bg-[#0A3A63] border border-white/20 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:ring-offset-2 transition-all cursor-pointer"
        >
          <FiArrowUp className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default ScrollToTop
