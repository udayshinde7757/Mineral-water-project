import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiArrowRight,
  FiShoppingBag,
  FiTruck,
  FiCheckCircle,
  FiDroplet,
  FiRefreshCw,
} from 'react-icons/fi'
import useCart from '@hooks/useCart'
import { ROUTES } from '@constants/routes'

function CartPage() {
  const {
    cartItems,
    loading,
    cartCount,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
  } = useCart()

  const navigate = useNavigate()
  const [updatingId, setUpdatingId] = useState(null)

  // Delivery configuration
  const FREE_DELIVERY_THRESHOLD = 500
  const DELIVERY_CHARGE = cartSubtotal >= FREE_DELIVERY_THRESHOLD || cartSubtotal === 0 ? 0 : 50
  const finalTotal = cartSubtotal + DELIVERY_CHARGE

  // Formatter for Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Handle quantity change
  const handleQuantityChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta
    if (newQty < 1) return

    try {
      setUpdatingId(productId)
      await updateCartQuantity(productId, newQty)
    } catch (error) {
      console.error('Quantity update failed:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    try {
      setUpdatingId(productId)
      await removeFromCart(productId)
    } catch (error) {
      console.error('Removal failed:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-lightblue/20 to-white">
        <div className="flex flex-col items-center gap-4">
          <FiRefreshCw className="w-10 h-10 text-primary animate-spin" />
          <p className="text-gray-500 font-medium">Loading your hydration cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-lightblue/30 via-white to-white min-h-screen py-10 lg:py-16">
      <div className="container-app">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lightblue text-primary text-xs font-bold mb-3">
            <FiDroplet className="w-3.5 h-3.5 fill-primary" />
            <span>Pure Hydration Cart</span>
          </div>
          <h1 className="text-3xl font-extrabold text-darkgray tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your mineral water bottles, dispenser jars, and refills.
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl p-8 md:p-16 text-center max-w-xl mx-auto shadow-card border border-gray-100 space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-lightblue text-primary mx-auto flex items-center justify-center shadow-brand-sm">
              <FiShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-darkgray">Your cart is empty</h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                Looks like you haven't added any pure mineral water to your cart yet. Stay hydrated!
              </p>
            </div>
            <Link
              to={ROUTES.PRODUCTS}
              className="inline-flex btn-primary !px-8 !py-3.5 text-sm font-bold shadow-brand-md"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 1. Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => {
                  const product = item.productId
                  if (!product) return null

                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 transition-all relative overflow-hidden"
                    >
                      {/* Product details group */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        {/* Image wrapper */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-lightblue/40 border border-gray-50 p-2 flex items-center justify-center flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {/* Title and metadata */}
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-darkgray hover:text-primary transition-colors text-base sm:text-lg line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                              {product.size}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lightblue text-primary border border-primary/10">
                              {product.category}
                            </span>
                          </div>
                          <p className="text-sm font-extrabold text-primary pt-0.5">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      </div>

                      {/* Controls and calculations */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50/50 p-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product._id, item.quantity, -1)}
                            disabled={item.quantity <= 1 || updatingId === product._id}
                            className="p-2 rounded-xl text-gray-500 hover:bg-white hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="w-3.5 h-3.5" />
                          </button>
                          
                          <span className="w-10 text-center font-bold text-sm text-darkgray">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product._id, item.quantity, 1)}
                            disabled={updatingId === product._id || item.quantity >= product.stock}
                            className="p-2 rounded-xl text-gray-500 hover:bg-white hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Total Price & Delete Action */}
                        <div className="flex items-center gap-4 text-right">
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Subtotal</p>
                            <p className="font-extrabold text-darkgray text-lg">
                              {formatCurrency(product.price * item.quantity)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(product._id)}
                            disabled={updatingId === product._id}
                            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors disabled:opacity-40"
                            aria-label="Remove item"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* 2. Price Calculation & Summary Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-gray-100 space-y-6">
                <h3 className="text-xl font-bold text-darkgray border-b border-gray-100 pb-4">
                  Order Summary
                </h3>

                {/* Free delivery progress bar */}
                {cartSubtotal < FREE_DELIVERY_THRESHOLD && (
                  <div className="bg-lightblue/40 p-4 rounded-2xl border border-primary/10 space-y-2">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      Add <span className="font-bold text-primary">{formatCurrency(FREE_DELIVERY_THRESHOLD - cartSubtotal)}</span> more for <span className="font-bold text-teal">Free Delivery!</span>
                    </p>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300 rounded-full"
                        style={{ width: `${(cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Price list details */}
                <div className="space-y-3.5 text-sm font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Items</span>
                    <span className="font-bold text-darkgray">{cartCount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-darkgray">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <FiTruck className="w-4 h-4 text-primary" /> Delivery Charges
                    </span>
                    {DELIVERY_CHARGE === 0 ? (
                      <span className="font-bold text-teal">FREE</span>
                    ) : (
                      <span className="font-bold text-darkgray">{formatCurrency(DELIVERY_CHARGE)}</span>
                    )}
                  </div>

                  <div className="border-t border-gray-100 my-4 pt-4 flex justify-between text-base font-extrabold text-darkgray">
                    <span>Final Total</span>
                    <span className="text-2xl text-primary font-black">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Badges / Guarantees */}
                <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5 text-[11px] font-semibold text-gray-500">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-teal" />
                    <span>Safe & Multi-Stage purified drinking water</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiTruck className="w-4 h-4 text-primary" />
                    <span>Same-day door step express delivery</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.CHECKOUT)}
                  className="w-full btn-primary !py-4 text-base font-bold flex items-center justify-center gap-2 shadow-brand-md hover:shadow-brand-lg"
                >
                  <span>Proceed to Checkout</span>
                  <FiArrowRight className="w-5 h-5 animate-pulse" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
