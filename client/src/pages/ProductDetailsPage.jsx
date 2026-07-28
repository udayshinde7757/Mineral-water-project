import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft,
  FiShoppingCart,
  FiZap,
  FiCheckCircle,
  FiDroplet,
  FiMail,
  FiStar,
  FiPackage,
  FiAlertCircle
} from 'react-icons/fi'
import productService from '@services/productService'
import useAuth from '@hooks/useAuth'
import useCart from '@hooks/useCart'
import { ROUTES } from '@constants/routes'
import ProductCard from '@components/products/ProductCard'

function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

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
      console.error('Error fetching product details:', err)
      setError('Unable to load product. Please check your internet connection.')
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
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location } })
      return
    }
    navigate(ROUTES.CHECKOUT, {
      state: {
        buyNowProduct: {
          productId: product._id,
          _id: product._id,
          quantity: quantity,
          name: product.name,
          price: product.price,
          image: product.image,
          size: product.size,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="container-app py-16 animate-pulse space-y-8">
        <div className="h-6 bg-gray-200 rounded w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-[400px] bg-gray-200 rounded-3xl" />
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
        <h2 className="text-2xl font-extrabold text-darkgray">Error Loading Product</h2>
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
    <div className="bg-gradient-to-b from-lightblue/20 via-white to-white min-h-screen py-10">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-24 right-8 z-50 bg-darkgray text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-primary/20">
          <FiCheckCircle className="text-teal w-5 h-5" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      <div className="container-app space-y-12">
        {/* Back Link */}
        <div>
          <Link
            to={ROUTES.PRODUCTS}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
          >
            <FiArrowLeft /> Back to All Products
          </Link>
        </div>

        {/* Product Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-card">
          {/* Left Side: Product Image Display */}
          <div className="bg-gradient-to-b from-lightblue/35 to-transparent p-6 rounded-2xl flex items-center justify-center min-h-[350px] lg:h-[450px]">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[350px] sm:max-h-[400px] object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right Side: Product Meta & Purchase Panel */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-lightblue text-primary border border-primary/10">
                  {product.category}
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-brand-sm flex items-center gap-1">
                  <FiDroplet className="w-3.5 h-3.5 fill-white" /> {product.size}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-darkgray">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <FiStar className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.8}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <FiCheckCircle /> In Stock ({product.stock} units available)
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed text-base">
                {product.description || "Premium AquaPure natural mineral water sourced from protected spring aquifers, enriched with essential health minerals."}
              </p>
            </div>

            {/* Pricing and Options */}
            <div className="pt-6 border-t border-gray-100 space-y-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">Price</span>
                <span className="text-3xl sm:text-4xl font-black text-darkgray">{formattedPrice}</span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-500">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 font-extrabold text-darkgray border-r border-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-5 font-bold text-darkgray text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 font-extrabold text-darkgray border-l border-gray-200 transition-colors"
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
                  className="btn-secondary !py-3.5 flex items-center justify-center gap-2 shadow-sm font-bold"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickBuy}
                  className="btn-primary !py-3.5 flex items-center justify-center gap-2 shadow-brand-md font-bold"
                >
                  <FiZap className="w-5 h-5 fill-white" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Enquiry Redirect Button */}
              <Link
                to={`${ROUTES.ENQUIRY}?productId=${product._id}`}
                className="w-full inline-flex items-center justify-center gap-2 border-2 border-dashed border-teal/40 bg-teal/5 text-teal hover:bg-teal hover:text-white font-bold py-3.5 rounded-full transition-all text-sm"
              >
                <FiMail className="w-4 h-4" />
                <span>Submit Custom Enquiry / Bulk Quote for {product.name}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-10">
            <h3 className="text-2xl font-extrabold text-darkgray">Related Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onAddToCart={showToast}
                  onBuyNow={(prod) => navigate(ROUTES.CHECKOUT, { state: { buyNowProduct: { ...prod, productId: prod._id, quantity: 1 } } })}
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
