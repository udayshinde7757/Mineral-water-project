import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiCheckCircle,
  FiPackage,
  FiShoppingBag,
  FiMapPin,
  FiCalendar,
  FiCreditCard,
  FiCheck,
} from 'react-icons/fi'
import { ROUTES } from '@constants/routes'

function OrderSuccessPage() {
  document.title = 'Order Confirmed — AquaPure'
  const location = useLocation()
  const order = location.state?.order

  // Formatter for currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // If page was loaded directly without order state in router
  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F4C81]/10 to-white flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-100 space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] mx-auto flex items-center justify-center">
            <FiPackage className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Order Information</h2>
            <p className="text-gray-500 text-sm">
              You can track all your active and past mineral water orders from your dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link to={ROUTES.MY_ORDERS} className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-3 px-6 rounded-xl transition-all text-center">
              View My Orders
            </Link>
            <Link to={ROUTES.HOME} className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const {
    _id,
    createdAt,
    products = [],
    shippingAddress = {},
    paymentMethod = 'COD',
    paymentStatus = 'Pending',
    subtotal = 0,
    deliveryCharges = 0,
    totalAmount = 0,
  } = order

  // Delivery status timeline — derived from actual order status
  const ORDER_STEP_STATUS = {
    Placed: 0,
    Pending: 0,
    Confirmed: 1,
    Processing: 2,
    Packed: 2,
    Shipped: 2,
    'Out For Delivery': 3,
    Delivered: 4,
    Completed: 4,
    Cancelled: -1,
  }
  const currentStepIndex = ORDER_STEP_STATUS[order.orderStatus] ?? 0
  const timelineSteps = [
    { title: 'Order Placed', desc: 'Received & Confirmed', completed: currentStepIndex >= 0 },
    { title: 'Processing', desc: 'Quality check & packing', completed: currentStepIndex >= 2 },
    { title: 'Shipped', desc: 'On its way to you', completed: currentStepIndex >= 3 },
    { title: 'Delivered', desc: 'Enjoy your water!', completed: currentStepIndex >= 4 },
  ]

  return (
    <div className="bg-gradient-to-b from-[#0F4C81]/5 via-white to-white min-h-screen py-10 lg:py-16">
      <div className="container-app max-w-4xl">

        {/* Celebratory Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 mb-12"
        >
          <div className="relative inline-flex items-center justify-center">
            {/* Glow ring */}
            <div className="absolute inset-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#0F4C81]/10 animate-pulse" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#0F4C81] to-[#0F4C81]/80 text-white flex items-center justify-center shadow-xl shadow-[#0F4C81]/20">
              <FiCheckCircle className="w-14 h-14 sm:w-[68px] sm:h-[68px] stroke-[1.5]" />
            </div>
            <span className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-amber-400 text-white border-[3px] border-white flex items-center justify-center shadow-md">
              <FiCheck className="w-5 h-5 stroke-[2.5]" />
            </span>
          </div>

          <div className="space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] text-xs font-bold uppercase tracking-widest">
              Order Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Your pure mineral water order has been placed successfully and is being prepared for fast delivery.
            </p>
          </div>
        </motion.div>

        {/* Order Details Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Main Order Breakdown */}
          <div className="md:col-span-8 space-y-6">

            <h2 className="sr-only">Order Details</h2>

            {/* Order Status & ID Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">Order ID</p>
                  <p className="font-bold text-gray-900 text-lg font-mono tracking-tight">#{_id || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">Order Date</p>
                  <p className="font-semibold text-gray-600 text-sm flex items-center gap-1.5 justify-end">
                    <FiCalendar className="w-4 h-4 text-[#0F4C81]" />
                    <span>{formatDate(createdAt)}</span>
                  </p>
                </div>
              </div>

              {/* Delivery Progress Steps */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-4">Estimated Delivery Progress</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timelineSteps.map((step, idx) => (
                    <div
                      key={step.title}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        step.completed
                          ? 'bg-[#0F4C81]/5 border-[#0F4C81]/15'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold ${
                          step.completed
                            ? 'bg-[#0F4C81] text-white shadow-sm shadow-[#0F4C81]/30'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {step.completed ? <FiCheck className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <p className={`text-xs font-bold leading-tight ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ordered Products Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiPackage className="w-5 h-5 text-[#0F4C81]" />
                <span>Ordered Items</span>
              </h3>

              <div className="divide-y divide-gray-50">
                {products.map((item, index) => (
                  <div key={index} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-xl bg-[#0F4C81]/5 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" loading="lazy"
                          onError={(e) => { e.target.src = 'https://placehold.co/200x200/e8f4fd/0B4F6C?text=Water' }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(item.price)} &times; {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Summary & Address */}
          <div className="md:col-span-4 space-y-6">

            {/* Delivery Address Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiMapPin className="w-4 h-4 text-[#0F4C81]" />
                <span>Delivery Address</span>
              </h3>

              <div className="text-xs text-gray-500 space-y-1 leading-relaxed">
                <p className="font-bold text-gray-900 text-sm">{shippingAddress.fullName || ''}</p>
                {shippingAddress.addressLine1 && <p>{shippingAddress.addressLine1}</p>}
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                {(shippingAddress.city || shippingAddress.state || shippingAddress.pincode) && (
                  <p>{shippingAddress.city || ''}{shippingAddress.city && shippingAddress.state ? ', ' : ''}{shippingAddress.state || ''}{shippingAddress.pincode ? ` - ${shippingAddress.pincode}` : ''}</p>
                )}
                {shippingAddress.phone && <p className="pt-1 font-semibold text-gray-500">Phone: {shippingAddress.phone}</p>}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiCreditCard className="w-4 h-4 text-[#0F4C81]" />
                <span>Payment Summary</span>
              </h3>

              <div className="space-y-2 text-xs font-medium text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Method</span>
                  <span className="font-bold text-gray-800 uppercase text-[11px]">{paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                    paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-gray-800">{deliveryCharges === 0 ? 'FREE' : formatCurrency(deliveryCharges)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-[#0F4C81]">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 pt-2">
              <Link
                to={ROUTES.MY_ORDERS}
                className="w-full bg-[#0F4C81] hover:bg-[#0F4C81]/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-[#0F4C81]/20 flex items-center justify-center gap-2 text-sm"
              >
                <FiPackage className="w-4 h-4" />
                <span>View My Orders</span>
              </Link>
              <Link
                to={ROUTES.PRODUCTS}
                className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FiShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
