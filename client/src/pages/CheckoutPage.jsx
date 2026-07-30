import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiMapPin,
  FiCreditCard,
  FiCheckCircle,
  FiLock,
  FiTruck,
  FiArrowLeft,
  FiShoppingBag,
  FiShield,
  FiCheck,
  FiDollarSign,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi'
import useAuth from '@hooks/useAuth'
import useCart from '@hooks/useCart'
import { useBuyNow } from '@hooks/useBuyNow'
import addressService from '@services/addressService'
import orderService from '@services/orderService'
import paymentService from '@services/paymentService'
import { ROUTES } from '@constants/routes'

// Dynamically load Razorpay SDK script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Helper: Safely extract string product ID from any item format (populated object, string, or Buy Now item).
// ⚠️  NEVER fall back to item._id — that is the cart subdocument _id, NOT the product's MongoDB _id.
//     Doing so would send a wrong ID to the backend and cause "Product not found" errors.
const getProductIdStr = (item) => {
  if (!item) return null
  if (typeof item === 'string') return item
  if (item.productId) {
    if (typeof item.productId === 'string') return item.productId
    if (typeof item.productId === 'object' && item.productId !== null) {
      if (item.productId._id) return String(item.productId._id)
      if (item.productId.id) return String(item.productId.id)
    }
    // productId exists but is neither a string nor a valid object → invalid
    return null
  }
  // No fallback to item._id — that's the cart subdoc ID, not the product ID.
  // If a product was deleted and productId is null, we cannot determine the product ID.
  return null
}

// Helper: Safely extract Product Object from an item (for display rendering)
const getProductObject = (item) => {
  if (!item) return null
  if (item.productId && typeof item.productId === 'object' && item.productId !== null) {
    return item.productId
  }
  if (typeof item === 'object' && item !== null && (item.name || item.price)) {
    return item
  }
  return null
}

function CheckoutPage() {
  const { user } = useAuth()
  const { cartItems, cartSubtotal, fetchCart } = useCart()
  const { buyNowItem, clearBuyNow } = useBuyNow()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine checkout mode: 'buynow' or 'cart'
  const isBuyNowFlow = !!buyNowItem
  const isCartFlow = !isBuyNowFlow && cartItems && cartItems.length > 0

  // Get active checkout items based on flow
  const rawItems = isBuyNowFlow ? [buyNowItem] : (cartItems || [])

  // Validate items
  const validCartItems = rawItems.filter((item) => {
    const pId = getProductIdStr(item)
    if (pId === null) {
      console.warn('🧹 CheckoutPage: Filtering out item with no valid productId:', item)
    }
    return pId !== null && (item.quantity === undefined || item.quantity > 0)
  })

  // If neither flow has valid items, redirect
  if (validCartItems.length === 0 && !isSubmitting) {
    // We'll handle this in the render
  }

  // Delivery & Subtotal calculations
  const calculatedSubtotal = validCartItems.reduce((acc, item) => {
    const prod = getProductObject(item)
    const price = prod ? (prod.price || 0) : 0
    const qty = item.quantity || 1
    return acc + price * qty
  }, 0)

  const effectiveSubtotal = isCartFlow ? cartSubtotal : calculatedSubtotal
  const FREE_DELIVERY_THRESHOLD = 500
  const DELIVERY_CHARGE = effectiveSubtotal >= FREE_DELIVERY_THRESHOLD || effectiveSubtotal === 0 ? 0 : 50
  const GST = 0
  const finalTotal = effectiveSubtotal + DELIVERY_CHARGE + GST

  // Address State
  const [address, setAddress] = useState({
    fullName: user?.fullname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const [saveForFuture, setSaveForFuture] = useState(true)
  const [loadingAddress, setLoadingAddress] = useState(true)

  // Payment Method State: 'COD' | 'ONLINE'
  const [paymentMethod, setPaymentMethod] = useState('COD')

  // Form submitting & Error states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Load saved address on mount
  useEffect(() => {
    let isMounted = true
    async function loadAddress() {
      try {
        setLoadingAddress(true)
        const res = await addressService.getSavedAddress()
        if (res?.success && res.address && isMounted) {
          setAddress((prev) => ({
            ...prev,
            ...res.address,
            fullName: res.address.fullName || user?.fullname || '',
            email: res.address.email || user?.email || '',
            phone: res.address.phone || user?.phone || '',
          }))
        }
      } catch (err) {
        console.error('Error fetching saved address:', err)
      } finally {
        if (isMounted) setLoadingAddress(false)
      }
    }
    loadAddress()
    return () => {
      isMounted = false
    }
  }, [user])

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAddress((prev) => ({ ...prev, [name]: value }))
    if (errorMessage) setErrorMessage('')
  }

  // Form Validation
  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'addressLine1', 'city', 'state', 'pincode', 'country']
    for (const field of required) {
      if (!address[field] || String(address[field]).trim() === '') {
        setErrorMessage(`Please fill out all required address fields (${field}).`)
        return false
      }
    }
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(address.phone.replace(/[^0-9]/g, ''))) {
      setErrorMessage('Please enter a valid 10-digit phone number.')
      return false
    }
    const pinRegex = /^[0-9]{6}$/
    if (!pinRegex.test(address.pincode.trim())) {
      setErrorMessage('Please enter a valid 6-digit Pincode.')
      return false
    }
    return true
  }

  // Handle Order Submission
  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (validCartItems.length === 0) {
      setErrorMessage('Your cart is empty or contains invalid items.')
      return
    }

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Save address if checked
      if (saveForFuture) {
        try {
          await addressService.saveAddress(address)
        } catch (err) {
          console.warn('Could not save address to profile:', err.message)
        }
      }

      // Safely format products list for backend payload
      const formattedProducts = validCartItems
        .map((item) => {
          const pId = getProductIdStr(item)
          return pId ? { productId: pId, quantity: item.quantity || 1 } : null
        })
        .filter(Boolean)

      if (formattedProducts.length === 0) {
        setErrorMessage('No valid products selected for checkout.')
        setIsSubmitting(false)
        return
      }

      if (paymentMethod === 'COD') {
        // Cash on Delivery flow
        const orderData = {
          products: formattedProducts,
          shippingAddress: address,
          paymentMethod: 'COD',
        }

        const res = await orderService.createOrder(orderData)

        if (res.success) {
          // Clear appropriate state based on flow
          if (isBuyNowFlow) {
            clearBuyNow()
          } else {
            await fetchCart() // Sync cart state (clears cart on backend)
          }
          navigate(ROUTES.ORDER_SUCCESS, {
            state: { order: res.order },
            replace: true,
          })
        } else {
          setErrorMessage(res.message || 'Failed to place order.')
        }
      } else if (paymentMethod === 'ONLINE') {
        // Razorpay Online Payment Flow
        const sdkLoaded = await loadRazorpayScript()
        if (!sdkLoaded) {
          setErrorMessage('Razorpay Payment Gateway failed to load. Please check your internet connection or choose Cash on Delivery.')
          setIsSubmitting(false)
          return
        }

        // 1. Create Razorpay order on backend
        const razorpayRes = await paymentService.createRazorpayOrder(formattedProducts)

        if (!razorpayRes.success) {
          setErrorMessage(razorpayRes.message || 'Failed to initialize payment gateway.')
          setIsSubmitting(false)
          return
        }

        const { order: razorpayOrder, key } = razorpayRes

        // 2. Open Razorpay modal
        const options = {
          key: key || 'rzp_test_placeholder',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'AquaPure Mineral Water',
          description: 'Pure Hydration Order Payment',
          image: '/favicon.ico',
          order_id: razorpayOrder.id,
          prefill: {
            name: address.fullName,
            email: address.email,
            contact: address.phone,
          },
          theme: {
            color: '#0284c7', // Primary brand color
          },
          handler: async (response) => {
            try {
              // 3. Verify payment signature on backend
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                products: formattedProducts,
                shippingAddress: address,
                paymentMethod: 'Razorpay / Online',
              })

              if (verifyRes.success) {
                // Clear appropriate state based on flow
                if (isBuyNowFlow) {
                  clearBuyNow()
                } else {
                  await fetchCart()
                }
                navigate(ROUTES.ORDER_SUCCESS, {
                  state: { order: verifyRes.order },
                  replace: true,
                })
              } else {
                setErrorMessage(verifyRes.message || 'Payment verification failed.')
              }
            } catch (err) {
              console.error('Payment verification error:', err)
              setErrorMessage(err.response?.data?.message || 'Payment verification failed.')
            } finally {
              setIsSubmitting(false)
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false)
            },
          },
        }

        const razorpayInstance = new window.Razorpay(options)
        razorpayInstance.on('payment.failed', function (response) {
          setErrorMessage(response.error.description || 'Payment failed. Please try again.')
          setIsSubmitting(false)
        })
        razorpayInstance.open()
      }
    } catch (error) {
      console.error('Order creation error:', error)
      setErrorMessage(
        error.response?.data?.message || error.message || 'An error occurred while processing your order.'
      )
      setIsSubmitting(false)
    }
  }

  // Redirect if no valid items and not submitting
  if (validCartItems.length === 0 && !isSubmitting) {
    const message = isBuyNowFlow
      ? 'The selected product is no longer available.'
      : 'Your cart is empty. Please add items to your cart before proceeding to checkout.'
    const buttonText = isBuyNowFlow ? 'Explore Products' : 'Explore Products'
    const buttonLink = isBuyNowFlow ? ROUTES.PRODUCTS : ROUTES.PRODUCTS

    return (
      <div className="min-h-screen bg-gradient-to-b from-lightblue/20 to-white flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-card border border-gray-100 space-y-6">
          <div className="w-16 h-16 rounded-full bg-lightblue text-primary mx-auto flex items-center justify-center">
            <FiShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-darkgray">
              {isBuyNowFlow ? 'Product Unavailable' : 'Your cart is empty'}
            </h2>
            <p className="text-gray-500 text-sm">{message}</p>
          </div>
          <Link to={buttonLink} className="btn-primary w-full inline-block !py-3 font-bold">
            {buttonText}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-lightblue/30 via-white to-white min-h-screen py-10 lg:py-16">
      <div className="container-app">
        {/* Navigation back link */}
        <div className="mb-6">
          <Link
            to={isBuyNowFlow ? ROUTES.PRODUCTS : ROUTES.CART}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>{isBuyNowFlow ? 'Back to Products' : 'Back to Shopping Cart'}</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-darkgray tracking-tight">
            Checkout & Delivery
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isBuyNowFlow
              ? 'Complete your purchase for the selected product.'
              : 'Complete your order details below to receive your pure mineral water.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm font-medium"
          >
            <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </motion.div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Delivery Address & Payment Method */}
            <div className="lg:col-span-7 space-y-8">

              {/* 1. Shipping Address Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-lightblue text-primary flex items-center justify-center font-bold">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-darkgray">1. Delivery Address</h2>
                    <p className="text-xs text-gray-400">Where should we deliver your mineral water?</p>
                  </div>
                </div>

                {loadingAddress ? (
                  <div className="flex items-center justify-center py-8 gap-3 text-gray-500 text-sm">
                    <FiRefreshCw className="w-5 h-5 text-primary animate-spin" />
                    <span>Loading saved address...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Full Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-darkgray uppercase tracking-wider mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={address.fullName}
                          onChange={handleInputChange}
                          placeholder="e.g. Rahul Sharma"
                          required
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-darkgray uppercase tracking-wider mb-1.5">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={address.phone}
                          onChange={handleInputChange}
                          placeholder="10-digit mobile number"
                          required
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-darkgray uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={address.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none transition-all"
                      />
                    </div>

                    {/* Address Line 1 */}
                    <div>
                      <label className="block text-xs font-bold text-darkgray uppercase tracking-wider mb-1.5">
                        Flat, House No., Building / Apartment <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={address.addressLine1}
                        onChange={handleInputChange}
                        placeholder="e.g. Flat 302, Aqua Springs Residency"
                        required
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none transition-all"
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="block text-xs font-bold text-darkgray uppercase tracking-wider mb-1.5">
                        Street, Area, Landmark <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={address.addressLine2}
                        onChange={handleInputChange}
                        placeholder="e.g. Near Water Tank, Green Park Road"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none transition-all"
                      />
                    </div>

                    {/* City, State, Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-darkgray uppercase tracking-wider mb-1.5">
                          City / Town <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={address.city}
                          onChange={handleInputChange}
                          placeholder="e.g. Mumbai"
                          required
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-darkgray uppercase tracking-wider mb-1.5">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={address.state}
                          onChange={handleInputChange}
                          placeholder="e.g. Maharashtra"
                          required
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-darkgray uppercase tracking-wider mb-1.5">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={address.pincode}
                          onChange={handleInputChange}
                          placeholder="6-digit code"
                          required
                          maxLength={6}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Save Address Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={saveForFuture}
                          onChange={(e) => setSaveForFuture(e.target.checked)}
                          className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary"
                        />
                        <span>Save this address for future orders</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Payment Method Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-lightblue text-primary flex items-center justify-center font-bold">
                    <FiCreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-darkgray">2. Select Payment Method</h2>
                    <p className="text-xs text-gray-400">Choose how you wish to pay for your order</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                      paymentMethod === 'COD'
                        ? 'border-primary bg-lightblue/20 shadow-brand-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
                          <FiDollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-darkgray text-base">Cash on Delivery</p>
                          <p className="text-xs text-gray-500">Pay cash upon delivery</p>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'COD' ? 'border-primary bg-primary text-white' : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === 'COD' && <FiCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100 text-[11px] text-gray-500 font-medium">
                      ✓ Zero pre-payment required. Hand over cash to our delivery driver.
                    </div>
                  </div>

                  {/* Online / Razorpay Option */}
                  <div
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                      paymentMethod === 'ONLINE'
                        ? 'border-primary bg-lightblue/20 shadow-brand-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <FiLock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-darkgray text-base">UPI / Card / NetBanking</p>
                          <p className="text-xs text-gray-500">Instant secure online payment</p>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'ONLINE' ? 'border-primary bg-primary text-white' : 'border-gray-300'
                        }`}
                      >
                        {paymentMethod === 'ONLINE' && <FiCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100 text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                      <FiShield className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                      <span>Razorpay 256-bit encrypted checkout (GPay, PhonePe, Cards)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Place Order */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-6 sticky top-24">
                <h3 className="text-xl font-bold text-darkgray border-b border-gray-100 pb-4 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lightblue text-primary">
                    {validCartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} Item{validCartItems.reduce((acc, i) => acc + (i.quantity || 1), 0) !== 1 ? 's' : ''}
                  </span>
                </h3>

                {/* Items Preview */}
                <div className="max-h-60 overflow-y-auto space-y-3.5 pr-1 divide-y divide-gray-50">
                  {validCartItems.map((item, index) => {
                    const product = getProductObject(item)
                    if (!product) return null
                    const pId = getProductIdStr(item) || index
                    return (
                      <div key={pId} className="pt-3 flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-lightblue/40 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                          <img src={product.image || '/placeholder.png'} alt={product.name || 'Product'} className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = 'https://placehold.co/200x200/e8f4fd/0B4F6C?text=Water' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-darkgray truncate">{product.name || 'Mineral Water'}</p>
                          <p className="text-[11px] text-gray-400">{product.size || ''} × {item.quantity || 1}</p>
                        </div>
                        <p className="text-xs font-extrabold text-darkgray">
                          {formatCurrency((product.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-100 pt-4 space-y-3 text-sm font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-darkgray">{formatCurrency(effectiveSubtotal)}</span>
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

                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-lg font-black text-darkgray">
                    <span>Total Amount</span>
                    <span className="text-2xl text-primary font-black">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Secure Trust Badges */}
                <div className="bg-gray-50 p-3.5 rounded-2xl space-y-2 text-[11px] text-gray-500 font-medium border border-gray-100">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-teal flex-shrink-0" />
                    <span>Tested for purity & sealed for freshness guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiShield className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Encrypted & secure checkout transaction</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary !py-4 text-base font-bold flex items-center justify-center gap-2 shadow-brand-md hover:shadow-brand-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>{paymentMethod === 'COD' ? 'Confirm & Place Order' : 'Proceed to Pay'}</span>
                      <FiCheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutPage
