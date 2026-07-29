import { motion } from 'framer-motion'
import { FiMaximize2 } from 'react-icons/fi'

function GalleryCard({ image, index, onClick }) {
  const { title, category, tag, description, src, sizeSpan } = image

  // Determine CSS Grid column and row spans for masonry variation
  let gridSpanClass = 'col-span-1 row-span-1 h-72 sm:h-80'
  if (sizeSpan === 'large') {
    gridSpanClass = 'col-span-1 sm:col-span-2 md:col-span-2 row-span-2 h-96 sm:h-[480px]'
  } else if (sizeSpan === 'tall') {
    gridSpanClass = 'col-span-1 row-span-2 h-[400px] sm:h-[480px]'
  } else if (sizeSpan === 'wide') {
    gridSpanClass = 'col-span-1 sm:col-span-2 row-span-1 h-72 sm:h-80'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      onClick={() => onClick(image, index)}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 bg-gray-900 ${gridSpanClass}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(image, index)}
      aria-label={`Open fullscreen preview for ${title}`}
    >
      {/* Background Image */}
      <img
        src={src}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-110 group-hover:brightness-105"
      />

      {/* Top category badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-primary-600/85 backdrop-blur-md shadow-md border border-white/20">
          {category}
        </span>
        {tag && (
          <span className="hidden xs:inline-block px-2.5 py-1 rounded-full text-[11px] font-medium text-gray-200 bg-black/40 backdrop-blur-md border border-white/10">
            {tag}
          </span>
        )}
      </div>

      {/* Top Right Expand Icon Button */}
      <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-md">
        <FiMaximize2 className="w-4 h-4" />
      </div>

      {/* Always Visible Gradient Overlay with Rich Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-5 sm:p-6 text-white z-0">
        <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
          <h3 className="text-base sm:text-lg font-bold leading-tight mb-1 text-white drop-shadow-sm group-hover:text-primary-200 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed font-normal opacity-90 group-hover:opacity-100 transition-opacity">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default GalleryCard