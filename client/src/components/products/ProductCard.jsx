import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShoppingCart,
  FiZap,
  FiStar,
  FiDroplet,
  FiCheckCircle,
} from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '@hooks/useAuth'
import useCart from '@hooks/useCart'
import useBuyNowAction from '@hooks/useBuyNowAction'
import { ROUTES } from '@constants/routes'

// ─── In-component Toast Notification ─────────────────────────────────────────
function Toast({ message, type = 'success' }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-24 right-4 sm:right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-brand-md border"
          style={{
            background: type === 'error' ? '#fef2f2' : '#ffffff',
            borderColor: type === 'error' ? '#fca5a5' : '#e0effc',
          }}
          role="alert"
          aria-live="polite"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: type === 'error' ? '#fee2e2' : '#EEF6FB' }}
          >
            {type === 'error' ? (
              <FiDroplet className="w-4 h-4 text-red-500" />
            ) : (
              <FiCheckCircle className="w-4 h-4" style={{ color: '#0F4C81' }} />
            )}
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: type === 'error' ? '#dc2626' : '#0F4C81' }}>
              {type === 'error' ? 'Action Required' : 'Cart Updated'}
            </p>
            <p className="text-sm font-medium text-gray-700">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ProductCard({ product, onAddToCart }) {
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState(null)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { buyNow } = useBuyNowAction()
  const navigate = useNavigate()
  const location = useLocation()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCardClick = () => {
    navigate(`/products/${product._id}`)
  }

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart.', 'error')
      setTimeout(() => navigate(ROUTES.LOGIN, { state: { from: location } }), 1500)
      return
    }

    try {
      setAdding(true)
      await addToCart(product._id)
      if (onAddToCart) {
        onAddToCart(product)
      }
      showToast(`${product.name} added to cart!`)
    } catch (error) {
      console.error('Failed to add product to cart:', error)
      showToast(error.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setTimeout(() => setAdding(false), 800)
    }
  }

  // Format INR price with commas
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price)

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        onClick={handleCardClick}
        role="article"
        aria-label={`${product.name} — ${formattedPrice}`}
        className="group flex flex-col justify-between overflow-hidden bg-white rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      >
        {/* Top Image Container */}
        <div className="relative h-56 sm:h-64 bg-gradient-to-b from-primary-50/40 via-white to-white p-4 flex items-center justify-center overflow-hidden">
          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            {/* Category Badge */}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary">
              {product.category}
            </span>
          </div>

          {/* Size Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white flex items-center gap-1">
              <FiDroplet className="w-3 h-3 fill-white" aria-hidden="true" />
              {product.size}
            </span>
          </div>

          {/* Product Image */}
          <img
            src={product.image}
            alt={`${product.name} — ${product.size} mineral water bottle`}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/images/products.png'
            }}
          />
        </div>

        {/* Product Information */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            {/* Title */}
            <h3 className="text-lg font-bold text-darkgray group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Stock & Rating */}
            <div className="flex items-center justify-between text-xs pt-1">
              {/* Rating */}
              <div className="flex items-center gap-1 text-amber-500 font-bold" aria-label={`Rated ${product.rating || 4.8} out of 5 stars`}>
                <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span>{product.rating || 4.8}</span>
              </div>

              {/* Stock */}
              <span className="font-medium text-emerald-600" aria-label={`${product.stock} units in stock`}>
                In Stock ({product.stock})
              </span>
            </div>
          </div>

          {/* Pricing & Action Buttons */}
          <div className="pt-3 border-t border-gray-100 space-y-3">
            {/* Price */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Price
              </span>
              <span className="text-3xl font-extrabold text-darkgray" aria-label={`Price: ${formattedPrice}`}>
                {formattedPrice}
              </span>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                aria-label={adding ? 'Adding to cart...' : `Add ${product.name} to cart`}
                aria-busy={adding}
                className="w-full py-2.5 px-3 rounded-xl bg-primary-50/60 hover:bg-primary-100 text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="w-4 h-4" aria-hidden="true" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); buyNow(product) }}
                aria-label={`Buy ${product.name} now`}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0F4C81] hover:bg-[#0d3f6a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FiZap className="w-4 h-4" aria-hidden="true" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default ProductCard
