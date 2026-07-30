import { CATEGORIES } from '@data/galleryData'

function GalleryFilter({ activeCategory, onSelectCategory, counts }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 px-4">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat
        const count = counts ? counts[cat] : null

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`group relative px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive
                ? 'bg-[#0F4C81] text-white shadow-md scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-primary/30 hover:text-primary hover:bg-lightblue/50 shadow-sm'
            }`}
          >
            <span>{cat}</span>
            {count !== undefined && count !== null && (
              <span
                className={`px-2 py-0.5 text-[11px] rounded-full font-bold transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-700'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default GalleryFilter
