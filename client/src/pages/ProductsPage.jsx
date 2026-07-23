import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch,
  FiFilter,
  FiDroplet,
  FiCheckCircle,
  FiRefreshCw,
  FiSliders,
  FiShoppingCart,
  FiX,
} from 'react-icons/fi'
import productService from '@services/productService'
import ProductCard from '@components/products/ProductCard'
import useAuth from '@hooks/useAuth'

function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState(null)
  // Checkout Modal State
  const [checkoutProduct, setCheckoutProduct] = useState(null)

  const categories = ['All', 'Personal', 'Bulk', 'Corporate']

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = {
        category: selectedCategory,
        search: searchQuery,
        sort: sortBy,
      }
      const data = await productService.getProducts(params)
      if (data.success) {
        setProducts(data.products)
      } else {
        setError(data.message || 'Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Unable to load products. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery, sortBy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Show Toast Notification
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Add to Cart Handler
  const handleAddToCart = (product) => {
    showToast("Product added to cart")
  }

  // Buy Now Handler
  const handleBuyNow = (product) => {
    setCheckoutProduct(product)
  }

  return (
    <div className="bg-gradient-to-b from-lightblue/30 via-white to-white min-h-screen py-10 lg:py-16">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 right-4 sm:right-8 z-50 bg-darkgray text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-primary/40"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <FiShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-teal">Cart Updated</p>
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-app space-y-10">
        {/* ─── 1. HERO BANNER ──────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lightblue text-primary text-xs sm:text-sm font-bold shadow-brand-sm">
            <FiDroplet className="w-4 h-4 fill-primary" />
            <span>100% Pure & Certified Mineral Water</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-darkgray tracking-tight">
            Our Water Products
          </h1>
          <p className="text-base sm:text-lg text-darkgray-light">
            From personal compact bottles to 20L dispenser jars and corporate refills — pure hydration delivered right to your doorstep.
          </p>
        </div>

        {/* ─── 2. SEARCH & FILTER CONTROL BAR ──────────────────────────────── */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-card border border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FiSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, size (e.g. 1L, 20L)..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50/50 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-darkgray"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-brand-sm scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <FiSliders className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-100 text-darkgray font-medium text-xs sm:text-sm rounded-2xl px-4 py-2.5 border-none focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── 3. PRODUCT CATALOG GRID ─────────────────────────────────────── */}
        {loading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card animate-pulse space-y-4"
              >
                <div className="h-48 bg-gray-100 rounded-2xl" />
                <div className="h-6 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-16 bg-white rounded-3xl p-8 shadow-card border border-red-100 space-y-4">
            <p className="text-red-500 font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchProducts}
              className="btn-primary !py-2.5 !px-6 text-xs inline-flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty Search / Filter State */
          <div className="text-center py-20 bg-white rounded-3xl p-8 shadow-card border border-gray-100 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-lightblue text-primary mx-auto flex items-center justify-center">
              <FiFilter className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-darkgray">No products found</h3>
            <p className="text-sm text-gray-500">
              We couldn't find any water products matching your selected filter or search term.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All')
                setSearchQuery('')
                setSortBy('featured')
              }}
              className="btn-secondary !py-2.5 !px-6 text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. DIRECT BUY NOW CHECKOUT MODAL ───────────────────────────── */}
      <AnimatePresence>
        {checkoutProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkgray/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setCheckoutProduct(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-darkgray p-1 rounded-full bg-gray-100"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-lightblue text-primary mx-auto flex items-center justify-center">
                  <FiCheckCircle className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-extrabold text-darkgray">
                  Quick Checkout
                </h3>
                <p className="text-xs text-gray-500">
                  Deliver to: <span className="font-bold text-darkgray">{user?.fullname || 'Customer'}</span> ({user?.email || ''})
                </p>
              </div>

              {/* Summary Box */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                <img 
                  src={checkoutProduct.image}
                  alt={checkoutProduct.name}
                  className="w-16 h-16 object-contain rounded-xl bg-white p-1"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-darkgray">{checkoutProduct.name}</h4>
                  <p className="text-xs text-teal font-semibold">Size: {checkoutProduct.size}</p>
                  <p className="text-base font-extrabold text-primary mt-1">
                    ₹{checkoutProduct.price}
                  </p>
                </div>
              </div>

              {/* Confirm Order Button */}
              <button
                type="button"
                onClick={() => {
                  setCheckoutProduct(null)
                  showToast(`Order placed for ${checkoutProduct.name}! Delivery arriving soon.`)
                }}
                className="w-full btn-primary !py-3.5 text-base font-bold shadow-brand-md"
              >
                Confirm Order (₹{checkoutProduct.price})
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductsPage
