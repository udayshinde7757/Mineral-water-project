import { useState, useRef } from 'react'

function ProductImageGallery({ images, productName }) {
  const imageList = Array.isArray(images) && images.length > 0 ? images : [images].filter(Boolean)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setPosition({ x, y })
  }

  const currentImage = imageList[selectedIndex]

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        className="relative bg-gradient-to-b from-primary-50/40 to-transparent p-8 rounded-2xl flex items-center justify-center min-h-[400px] lg:min-h-[520px] overflow-hidden cursor-crosshair"
      >
        <img
          src={currentImage}
          alt={productName}
          className="max-h-[380px] sm:max-h-[460px] object-contain transition-transform duration-300"
          style={{
            transform: isHovered ? 'scale(1.8)' : 'scale(1)',
            transformOrigin: `${position.x}% ${position.y}%`,
          }}
          onError={(e) => { e.target.src = 'https://placehold.co/600x600/e8f4fd/0B4F6C?text=Product' }}
        />
      </div>

      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`w-16 h-16 shrink-0 rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                idx === selectedIndex
                  ? 'border-primary shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${productName} ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/100x100/e8f4fd/0B4F6C?text=N/A' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductImageGallery
