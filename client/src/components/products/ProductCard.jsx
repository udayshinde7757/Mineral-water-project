import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiShoppingCart,
  FiZap,
  FiStar,
  FiCheckCircle,
  FiDroplet,
  FiPackage,
} from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '@hooks/useAuth'
import useCart from '@hooks/useCart'
import { ROUTES } from '@constants/routes'

function ProductCard({ product, onAddToCart, onBuyNow }) {
  const [adding, setAdding] = useState(false)
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const handleCardClick = () => {
    navigate(`/products/${product._id}`)
  }

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      alert("Please login to add products to cart")
      navigate(ROUTES.LOGIN, { state: { from: location } })
      return
    }

    try {
      setAdding(true)
      await addToCart(product._id)
      if (onAddToCart) {
        onAddToCart(product)
      }
    } catch (error) {
      console.error("Failed to add product to cart:", error)
      alert(error.message || "Something went wrong while adding product to cart")
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
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
            <FiDroplet className="w-3 h-3 fill-white" />
            {product.size}
          </span>
        </div>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400/e8f4fd/0B4F6C?text=Product' }}
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
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <FiStar className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating || 4.8}</span>
              <span className="text-gray-400 font-normal">(45+ reviews)</span>
            </div>

            {/* Stock */}
            <span className="font-medium text-emerald-600">
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
            <span className="text-3xl font-extrabold text-darkgray">
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
              className="w-full py-2.5 px-3 rounded-xl bg-primary-50/60 hover:bg-primary-100 text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200"
            >
              {adding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <FiShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onBuyNow(product) }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0F4C81] hover:bg-[#0d3f6a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FiZap className="w-4 h-4 fill-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
