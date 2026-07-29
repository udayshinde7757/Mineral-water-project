import { useState, useMemo } from 'react'
import { GALLERY_IMAGES } from '@data/galleryData'
import GalleryHero from '@components/gallery/GalleryHero'
import GalleryStats from '@components/gallery/GalleryStats'
import GalleryFilter from '@components/gallery/GalleryFilter'
import GalleryGrid from '@components/gallery/GalleryGrid'
import GalleryLightbox from '@components/gallery/GalleryLightbox'
import ProcessTimeline from '@components/gallery/ProcessTimeline'
import GalleryCTA from '@components/gallery/GalleryCTA'

// ─── GalleryPage ──────────────────────────────────────────────────────────────
function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Calculate image counts per category dynamically
  const categoryCounts = useMemo(() => {
    const counts = { All: GALLERY_IMAGES.length }
    GALLERY_IMAGES.forEach((img) => {
      counts[img.category] = (counts[img.category] || 0) + 1
    })
    return counts
  }, [])

  // Filter images based on active category selection
  const filteredImages = useMemo(() => {
    if (activeCategory === 'All') return GALLERY_IMAGES
    return GALLERY_IMAGES.filter((img) => img.category === activeCategory)
  }, [activeCategory])

  // Handle active image in Lightbox modal
  const activeLightboxImage =
    lightboxIndex !== null && filteredImages[lightboxIndex]
      ? filteredImages[lightboxIndex]
      : null

  const handleOpenLightbox = (image, index) => {
    setLightboxIndex(index)
  }

  const handleCloseLightbox = () => {
    setLightboxIndex(null)
  }

  const handleNextLightbox = () => {
    setLightboxIndex((prevIndex) => {
      if (prevIndex === null) return 0
      return (prevIndex + 1) % filteredImages.length
    })
  }

  const handlePrevLightbox = () => {
    setLightboxIndex((prevIndex) => {
      if (prevIndex === null) return 0
      return (prevIndex - 1 + filteredImages.length) % filteredImages.length
    })
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-primary-500 selection:text-white">
      {/* 1. Hero Section */}
      <GalleryHero />

      {/* 2. Gallery Statistics */}
      <GalleryStats />

      {/* 3. Filter Buttons */}
      <GalleryFilter
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat)
          setLightboxIndex(null)
        }}
        counts={categoryCounts}
      />

      {/* 4. Gallery Grid Section (with theme background, heading, animations) */}
      <GalleryGrid
        images={filteredImages}
        onSelectImage={handleOpenLightbox}
      />

      {/* 5. Fullscreen Lightbox Modal */}
      {activeLightboxImage && (
        <GalleryLightbox
          image={activeLightboxImage}
          images={filteredImages}
          currentIndex={lightboxIndex}
          onClose={handleCloseLightbox}
          onNext={handleNextLightbox}
          onPrev={handlePrevLightbox}
        />
      )}

      {/* 6. Company Process Lifecycle Timeline */}
      <ProcessTimeline />

      {/* 7. Bottom CTA Banner */}
      <GalleryCTA />
    </div>
  )
}

export default GalleryPage
