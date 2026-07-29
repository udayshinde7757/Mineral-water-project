import { motion, AnimatePresence } from 'framer-motion'
import GalleryCard from './GalleryCard'

function GalleryGrid({ images, onSelectImage }) {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 max-w-md mx-auto my-8">
        <p className="text-gray-500 font-medium text-base">No images found in this category.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[220px]"
      >
        <AnimatePresence mode="popLayout">
          {images.map((img, idx) => (
            <GalleryCard
              key={img.id}
              image={img}
              index={idx}
              onClick={onSelectImage}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default GalleryGrid
