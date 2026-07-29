import { useLocation, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiCheckCircle,
  FiPackage,
  FiShoppingBag,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiTruck,
  FiCreditCard,
  FiDroplet,
  FiCheck,
} from 'react-icons/fi'
import { ROUTES } from '@constants/routes'

function OrderSuccessPage() {
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
    if (!dateStr) return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
      <div className="min-h-screen bg-gradient-to-b from-lightblue/30 to-white flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-card border border-gray-100 space-y-6">
          <div className="w-16 h-16 rounded-full bg-lightblue text-primary mx-auto flex items-center justify-center">
            <FiPackage className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-darkgray">Order Information</h2>
            <p className="text-gray-500 text-sm">
              You can track all your active and past mineral water orders from your dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link to={ROUTES.MY_ORDERS} className="btn-primary w-full !py-3 font-bold text-center">
              View My Orders
            </Link>
            <Link to={ROUTES.HOME} className="btn-secondary w-full !py-3 font-bold text-center">
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

  // Delivery status timeline
  const timelineSteps = [
    { title: 'Order Placed', desc: 'Received & Confirmed', completed: true },
    { title: 'Quality Check', desc: 'Hydration purity audit', completed: true },
    { title: 'Out for Delivery', desc: 'Express door delivery', completed: false },
    { title: 'Delivered', desc: 'Satisfied customer', completed: false },
  ]

  return (
    <div className="bg-gradient-to-b from-lightblue/40 via-white to-white min-h-screen py-10 lg:py-16">
      <div className="container-app max-w-4xl">

        {/* Celebratory Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-10"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-teal text-white mx-auto flex items-center justify-center shadow-brand-lg">
              <FiCheckCircle className="w-14 h-14 sm:w-16 sm:h-16 stroke-[1.5]" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-lightblue text-primary border-2 border-white flex items-center justify-center shadow-sm">
              <FiDroplet className="w-5 h-5 fill-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-lightblue text-primary text-xs font-bold uppercase tracking-wider">
              Order Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-darkgray tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
              Your pure mineral water order has been placed successfully and is being prepared for fast delivery.
            </p>
          </div>
        </motion.div>

        {/* Order Details Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Main Order Breakdown */}
          <div className="md:col-span-8 space-y-6">

            {/* Order Status & ID Header */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order ID</p>
                  <p className="font-extrabold text-darkgray text-lg font-mono">#{_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order Date</p>
                  <p className="font-bold text-gray-700 text-sm flex items-center gap-1.5 justify-end">
                    <FiCalendar className="w-4 h-4 text-primary" />
                    <span>{formatDate(createdAt)}</span>
                  </p>
                </div>
              </div>

              {/* Delivery Progress Steps */}
              <div className="pt-2">
                <p className="text-xs font-bold text-darkgray uppercase tracking-wider mb-4">Estimated Delivery Progress</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timelineSteps.map((step, idx) => (
                    <div
                      key={step.title}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        step.completed
                          ? 'bg-lightblue/30 border-primary/20 text-primary'
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold ${
                          step.completed ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step.completed ? <FiCheck className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <p className="text-xs font-bold leading-tight">{step.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ordered Products Card */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 space-y-4">
              <h3 className="text-lg font-bold text-darkgray border-b border-gray-100 pb-3 flex items-center gap-2">
                <FiPackage className="w-5 h-5 text-primary" />
                <span>Ordered Items</span>
              </h3>

              <div className="divide-y divide-gray-50">
                {products.map((item, index) => (
                  <div key={index} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-lightblue/40 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" loading="lazy"
                          onError={(e) => { e.target.src = 'https://placehold.co/200x200/e8f4fd/0B4F6C?text=Water' }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-darkgray">{item.name}</h4>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-darkgray">
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
            <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 space-y-3">
              <h3 className="text-base font-bold text-darkgray flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiMapPin className="w-4 h-4 text-primary" />
                <span>Delivery Address</span>
              </h3>

              <div className="text-xs text-gray-600 space-y-1 leading-relaxed">
                <p className="font-bold text-darkgray text-sm">{shippingAddress.fullName}</p>
                <p>{shippingAddress.addressLine1}</p>
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                <p className="pt-1 font-semibold text-gray-500">Phone: {shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 space-y-3">
              <h3 className="text-base font-bold text-darkgray flex items-center gap-2 border-b border-gray-100 pb-3">
                <FiCreditCard className="w-4 h-4 text-primary" />
                <span>Payment Summary</span>
              </h3>

              <div className="space-y-2 text-xs font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-bold text-darkgray uppercase">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                    paymentStatus === 'Paid' ? 'bg-teal/10 text-teal' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-darkgray">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-darkgray">{deliveryCharges === 0 ? 'FREE' : formatCurrency(deliveryCharges)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-black text-darkgray">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 pt-2">
              <Link
                to={ROUTES.MY_ORDERS}
                className="w-full btn-primary !py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-brand-md"
              >
                <FiPackage className="w-4 h-4" />
                <span>View My Orders</span>
              </Link>
              <Link
                to={ROUTES.PRODUCTS}
                className="w-full btn-secondary !py-3 text-sm font-bold flex items-center justify-center gap-2"
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
