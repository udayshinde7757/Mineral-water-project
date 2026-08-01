import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch,
  FiFilter,
  FiDroplet,
  FiRefreshCw,
  FiSliders,
  FiShoppingCart,
  FiX,
} from 'react-icons/fi'
import productService from '@services/productService'
import ProductCard from '@components/products/ProductCard'
import useCart from '@hooks/useCart'

function ProductsPage() {
  const { addToCart } = useCart()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState(null)

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
        setProducts(data.products || [])
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
  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id)
      showToast(`${product.name} added to cart!`)
    } catch (err) {
      showToast(err.message || 'Could not add product to cart')
    }
  }

  return (
    <div className="bg-background min-h-screen py-10 lg:py-16">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 right-4 sm:right-8 z-50 bg-white text-darkgray border border-gray-200 px-5 py-3.5 rounded-2xl shadow-brand-md flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <FiShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Cart Updated</p>
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-app space-y-10">
        {/* ─── 1. HERO BANNER ──────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-xs sm:text-sm font-semibold shadow-brand-sm">
            <FiDroplet className="w-4 h-4 fill-white" />
            <span>100% Pure & Certified Mineral Water</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-heading tracking-tight">
            Our Water Products
          </h1>
          <p className="text-base sm:text-lg text-body">
            From personal compact bottles to 20L dispenser jars and corporate refills — pure hydration delivered right to your doorstep.
          </p>
        </div>

        {/* ─── 2. SEARCH & FILTER CONTROL BAR ──────────────────────────────── */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                <FiSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, size (e.g. 1L, 20L)..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 text-sm text-navy bg-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-navy"
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
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <FiSliders className="w-4 h-4 text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white text-navy font-medium text-xs sm:text-sm rounded-2xl px-4 py-2.5 border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none cursor-pointer"
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
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-4"
              >
                <div className="h-48 bg-gray-100/60 rounded-2xl" />
                <div className="h-6 bg-gray-100/60 rounded w-3/4" />
                <div className="h-4 bg-gray-100/60 rounded w-1/2" />
                <div className="h-10 bg-gray-100/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-16 bg-white rounded-3xl p-8 shadow-sm border border-red-100 space-y-4">
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
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-4 max-w-lg mx-auto px-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <FiFilter className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-heading">No products found</h3>
            <p className="text-sm text-body">
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
