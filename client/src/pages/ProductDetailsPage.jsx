import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiArrowLeft,
  FiShoppingCart,
  FiZap,
  FiCheckCircle,
  FiDroplet,
  FiMail,
  FiStar,
  FiAlertCircle,
  FiChevronRight,
  FiHome,
} from 'react-icons/fi'
import productService from '@services/productService'
import useAuth from '@hooks/useAuth'
import useCart from '@hooks/useCart'
import useBuyNowAction from '@hooks/useBuyNowAction'
import { ROUTES } from '@constants/routes'
import ProductImageGallery from '@components/products/ProductImageGallery'
import DeliveryInfo from '@components/products/DeliveryInfo'
import SpecificationsTable from '@components/products/SpecificationsTable'
import ProductCard from '@components/products/ProductCard'

function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { buyNow } = useBuyNowAction()

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await productService.getProductById(id)
      if (data.success && data.product) {
        setProduct(data.product)
        document.title = `${data.product.name} — AquaPure`

        // Fetch related products (same category)
        const relData = await productService.getProducts({ category: data.product.category })
        if (relData.success) {
          const filtered = relData.products.filter(p => p._id !== data.product._id)
          setRelatedProducts(filtered.slice(0, 4))
        }
      } else {
        setError('Product not found')
      }
    } catch (err) {
      // A 400/404 means the product doesn't exist (bad or deleted id) — show a
      // clear message instead of a misleading "internet connection" error.
      const status = err?.response?.status
      if (status === 400 || status === 404) {
        setError('Product not found')
      } else {
        console.error('Error fetching product details:', err)
        setError('Unable to load product. Please check your internet connection.')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProductDetails()
    window.scrollTo(0, 0)
  }, [fetchProductDetails])

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location } })
      return
    }

    try {
      setAdding(true)
      for (let i = 0; i < quantity; i++) {
        await addToCart(product._id)
      }
      showToast(`${quantity} unit(s) added to cart successfully.`)
    } catch (err) {
      alert(err.message || 'Error adding to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleQuickBuy = () => {
    // Auth check + set Buy Now state + explicit navigation all happen in
    // useBuyNowAction. Buy Now never touches the cart.
    buyNow(product, quantity)
  }

  if (loading) {
    return (
      <div className="container-app py-16 animate-pulse space-y-8">
        <div className="h-6 bg-gray-200 rounded w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-[450px] bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-app py-20 text-center space-y-6 max-w-md">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <FiAlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Error Loading Product</h2>
        <p className="text-gray-500">{error || 'Something went wrong.'}</p>
        <Link to={ROUTES.PRODUCTS} className="btn-primary inline-flex items-center gap-2">
          <FiArrowLeft /> Back to Products
        </Link>
      </div>
    )
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price)

  return (
    <div className="bg-gradient-to-b from-[#0F4C81]/[0.04] via-white to-white min-h-screen">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-24 right-8 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-white/10 backdrop-blur-sm">
          <FiCheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      <div className="container-app py-10 space-y-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted">
          <Link to={ROUTES.HOME} className="hover:text-primary transition-colors flex items-center gap-1">
            <FiHome className="w-3.5 h-3.5" /> Home
          </Link>
          <FiChevronRight className="w-3 h-3" />
          <Link to={ROUTES.PRODUCTS} className="hover:text-primary transition-colors">Products</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-heading font-semibold truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-lg">
          {/* Left Side: Product Image Gallery */}
          <ProductImageGallery images={product.image} productName={product.name} />

          {/* Right Side: Product Meta & Purchase Panel */}
          <div className="space-y-8 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#0F4C81] text-white tracking-wide">
                  {product.category}
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-teal text-white shadow-sm tracking-wide flex items-center gap-1.5">
                  <FiDroplet className="w-3.5 h-3.5 fill-white" /> {product.size}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <FiStar className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.8}</span>
                </div>
                <span className="text-gray-200">|</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <FiCheckCircle className="w-4 h-4" /> In Stock ({product.stock} units available)
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed text-base">
                {product.description || "Premium AquaPure natural mineral water sourced from protected spring aquifers, enriched with essential health minerals."}
              </p>
            </div>

            {/* Pricing and Options */}
            <div className="pt-8 border-t border-gray-200 space-y-7">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Price</span>
                <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">{formattedPrice}</span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-5">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Qty</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-2.5 hover:bg-gray-50 font-bold text-gray-600 border-r border-gray-200 transition-colors text-sm"
                  >
                    -
                  </button>
                  <span className="px-6 font-bold text-gray-900 text-sm min-w-[2.5rem] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-2.5 hover:bg-gray-50 font-bold text-gray-600 border-l border-gray-200 transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Purchase / Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn-secondary !py-3.5 flex items-center justify-center gap-2.5 shadow-sm font-bold rounded-xl"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickBuy}
                  className="bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white !py-3.5 flex items-center justify-center gap-2.5 shadow-md shadow-[#0F4C81]/20 font-bold rounded-xl transition-all"
                >
                  <FiZap className="w-5 h-5 fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Enquiry Redirect Button */}
              <Link
                to={`${ROUTES.ENQUIRY}?productId=${product._id}`}
                className="w-full inline-flex items-center justify-center px-6 gap-2 text-gray-400 hover:text-[#0F4C81] font-semibold py-3 rounded-xl border border-gray-200 hover:border-[#0F4C81]/30 transition-all text-sm"
              >
                <FiMail className="w-4 h-4" />
                <span>Submit Custom Enquiry / Bulk Quote for {product.name}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
            <h3 className="text-2xl font-extrabold text-heading tracking-tight">Delivery & Quality</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
          </div>
          <DeliveryInfo />
        </div>

        {/* Description & Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
                <FiDroplet className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-heading">Product Overview</h3>
            </div>
            <p className="text-sm text-body leading-relaxed">
              {product.description || "Premium AquaPure natural mineral water sourced from protected spring aquifers, enriched with essential health minerals for your daily hydration needs."}
            </p>
            <div className="space-y-4 pt-2">
              <div>
                <h4 className="text-sm font-bold text-heading mb-1">Benefits</h4>
                <p className="text-sm text-body leading-relaxed">Naturally balanced pH, enriched with essential minerals like calcium, magnesium, and potassium for optimal hydration and wellness.</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-heading mb-1">Packaging</h4>
                <p className="text-sm text-body leading-relaxed">Food-grade BPA-free bottles designed to preserve purity and freshness. Recyclable packaging committed to environmental sustainability.</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-heading mb-1">Storage Instructions</h4>
                <p className="text-sm text-body leading-relaxed">Store in a cool, dry place away from direct sunlight. Refrigerate after opening for best taste. Consume within 48 hours of opening.</p>
              </div>
            </div>
          </div>
          <SpecificationsTable product={product} />
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Related Products</h3>
              <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onAddToCart={showToast}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailsPage
