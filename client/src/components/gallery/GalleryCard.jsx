import { motion } from 'framer-motion'
import { FiMaximize2 } from 'react-icons/fi'

// ─── Card entry variant (staggered via parent container) ────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── GalleryCard ────────────────────────────────────────────────────────────
function GalleryCard({ image, index, onClick }) {
  const { title, category, tag, description, src } = image

  return (
    <motion.div
      layout
      variants={cardVariants}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      onClick={() => onClick(image, index)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gray-900 shadow-md hover:shadow-xl transition-shadow duration-300 aspect-[4/5]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(image, index)}
      aria-label={`Open fullscreen preview for ${title}`}
    >
      {/* Background Image — fills entire card, cropped uniformly */}
      <img
        src={src}
        alt={title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        onError={(e) => { e.target.src = 'https://placehold.co/600x800/e8f4fd/0B4F6C?text=AquaPure' }}
      />

      {/* Dark gradient scrim — navy at bottom → transparent at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E1B26]/80 via-[#0E1B26]/15 to-transparent pointer-events-none" />

      {/* ── Top: Category Badge ────────────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-start gap-2 pointer-events-none">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#0F4C81] shadow-sm">
          {category}
        </span>
        {tag && (
          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium text-gray-200 bg-black/40 backdrop-blur-md border border-white/10">
            {tag}
          </span>
        )}
      </div>

      {/* ── Top Right: Expand icon ─────────────────────────────────────── */}
      <div className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-md pointer-events-none">
        <FiMaximize2 className="w-4 h-4" />
      </div>

      {/* ── Bottom: Title + Description ────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 pointer-events-none">
        <h3 className="text-sm sm:text-base font-bold text-white leading-tight mb-1 line-clamp-2 drop-shadow-sm">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed opacity-90">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default GalleryCard
