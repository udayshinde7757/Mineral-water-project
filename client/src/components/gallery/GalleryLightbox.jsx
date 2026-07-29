import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiChevronLeft, FiChevronRight, FiTag, FiMaximize2 } from 'react-icons/fi'

function GalleryLightbox({ image, images, currentIndex, onClose, onNext, onPrev }) {
  const totalCount = images ? images.length : 0
  const activeNumber = currentIndex + 1

  // Handle keyboard event listeners for ESC and Arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        onNext()
      } else if (e.key === 'ArrowLeft') {
        onPrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Prevent scrolling behind lightbox modal
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, onNext, onPrev])

  if (!image) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-6 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-label="Image Lightbox Preview"
      >
        {/* Modal Wrapper (Stops click-propagation to backdrop) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl h-full max-h-[92vh] flex flex-col justify-between overflow-hidden rounded-2xl bg-gray-950 border border-gray-800/80 shadow-2xl"
        >
          {/* Top Bar: Title & Counter & Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-900/60 backdrop-blur-md z-20">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-primary-600 rounded-full">
                {image.category}
              </span>
              {image.tag && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <FiTag className="w-3 h-3 text-primary-400" />
                  {image.tag}
                </span>
              )}
            </div>

            {/* Counter */}
            <div className="text-sm font-semibold text-gray-300 tracking-wider bg-gray-800/80 px-4 py-1.5 rounded-full border border-gray-700">
              <span className="text-white font-bold">{activeNumber}</span> / <span className="text-gray-400">{totalCount}</span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close Lightbox"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content Area: Left Arrow, Image, Right Arrow */}
          <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden bg-black/60">
            {/* Previous Button */}
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-4 z-30 p-3 rounded-full bg-gray-900/80 hover:bg-primary-600 text-white border border-gray-700/80 hover:border-primary-500 shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer outline-none"
              aria-label="Previous Image"
            >
              <FiChevronLeft className="w-7 h-7" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={onNext}
              className="absolute right-4 z-30 p-3 rounded-full bg-gray-900/80 hover:bg-primary-600 text-white border border-gray-700/80 hover:border-primary-500 shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer outline-none"
              aria-label="Next Image"
            >
              <FiChevronRight className="w-7 h-7" />
            </button>

            {/* Main Preview Image */}
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full flex items-center justify-center max-h-[68vh]"
            >
              <img
                src={image.src}
                alt={image.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-gray-800"
              />
            </motion.div>
          </div>

          {/* Bottom Bar: Image Title & Detailed Description */}
          <div className="px-6 py-4 bg-gray-900/90 border-t border-gray-800/80 text-white z-20">
            <div className="max-w-3xl">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 tracking-tight flex items-center gap-2">
                <span>{image.title}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                {image.description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GalleryLightbox
