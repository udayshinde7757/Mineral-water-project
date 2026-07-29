import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiMapPin,
  FiShoppingBag,
  FiRefreshCw,
  FiEye,
  FiCalendar,
  FiAlertCircle,
  FiX,
  FiDollarSign,
} from 'react-icons/fi'
import orderService from '@services/orderService'
import { ROUTES } from '@constants/routes'

function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Cancelling State
  const [cancellingId, setCancellingId] = useState(null)
  const [cancelError, setCancelError] = useState('')

  // Currency Formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Date Formatter
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

  // Fetch User Orders
  const loadUserOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await orderService.getUserOrders()
      if (res.success) {
        setOrders(res.orders || [])
      } else {
        setError(res.message || 'Failed to load your orders.')
      }
    } catch (err) {
      console.error('Fetch user orders error:', err)
      setError(err.response?.data?.message || 'Server error while fetching orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserOrders()
  }, [])

  // Cancel Order Handler
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    try {
      setCancellingId(orderId)
      setCancelError('')
      const res = await orderService.cancelOrder(orderId)

      if (res.success) {
        // Update order in local state
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'Cancelled', paymentStatus: o.paymentStatus === 'Paid' ? 'Refunded' : o.paymentStatus } : o))
        )
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => ({
            ...prev,
            orderStatus: 'Cancelled',
            paymentStatus: prev.paymentStatus === 'Paid' ? 'Refunded' : prev.paymentStatus,
          }))
        }
      } else {
        setCancelError(res.message || 'Failed to cancel order.')
      }
    } catch (err) {
      console.error('Cancel order error:', err)
      setCancelError(err.response?.data?.message || 'Error cancelling order.')
    } finally {
      setCancellingId(null)
    }
  }

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Placed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">Order Placed</span>
      case 'Confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">Confirmed</span>
      case 'Shipped':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">Out for Delivery</span>
      case 'Delivered':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal/10 text-teal border border-teal/20">Delivered</span>
      case 'Cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">Cancelled</span>
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{status}</span>
    }
  }

  // Filter Orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') return ['Placed', 'Confirmed', 'Shipped'].includes(order.orderStatus)
    if (activeTab === 'delivered') return order.orderStatus === 'Delivered'
    if (activeTab === 'cancelled') return order.orderStatus === 'Cancelled'
    return true // 'all'
  })

  return (
    <div className="bg-gradient-to-b from-lightblue/30 via-white to-white min-h-screen py-10 lg:py-16">
      <div className="container-app">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lightblue text-primary text-xs font-bold mb-2">
              <FiPackage className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-darkgray tracking-tight">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Track your mineral water delivery orders & view details.</p>
          </div>

          <button
            type="button"
            onClick={loadUserOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:text-primary hover:border-primary transition-all shadow-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            {
              id: 'active',
              label: 'In Progress',
              count: orders.filter((o) => ['Placed', 'Confirmed', 'Shipped'].includes(o.orderStatus)).length,
            },
            {
              id: 'delivered',
              label: 'Delivered',
              count: orders.filter((o) => o.orderStatus === 'Delivered').length,
            },
            {
              id: 'cancelled',
              label: 'Cancelled',
              count: orders.filter((o) => o.orderStatus === 'Cancelled').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-brand-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {cancelError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{cancelError}</span>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm gap-3">
            <FiRefreshCw className="w-10 h-10 text-primary animate-spin" />
            <p className="text-gray-500 font-semibold text-sm">Fetching your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty Orders State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 md:p-16 text-center max-w-lg mx-auto shadow-card border border-gray-100 space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-lightblue text-primary mx-auto flex items-center justify-center">
              <FiPackage className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-darkgray">No orders found</h3>
              <p className="text-gray-500 text-sm">
                {activeTab === 'all'
                  ? "You haven't placed any orders yet. Stay hydrated with AquaPure!"
                  : `No orders found in '${activeTab}' category.`}
              </p>
            </div>
            <Link to={ROUTES.PRODUCTS} className="btn-primary inline-flex !px-8 !py-3.5 font-bold text-sm">
              Shop Mineral Water
            </Link>
          </motion.div>
        ) : (
          /* Order Cards List */
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const canCancel = ['Placed', 'Confirmed'].includes(order.orderStatus)

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 space-y-5 hover:border-primary/20 transition-all"
                >
                  {/* Card Top Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-lightblue/60 text-primary flex items-center justify-center font-bold">
                        <FiPackage className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-darkgray text-base font-mono">#{order._id}</span>
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <FiCalendar className="w-3.5 h-3.5 text-primary" />
                          <span>{formatDate(order.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Amount</p>
                      <p className="text-lg font-black text-primary">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>

                  {/* Products Thumbnail Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {order.products?.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-14 rounded-2xl bg-lightblue/30 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center relative"
                          title={item.name}
                        >
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" loading="lazy"
                            onError={(e) => { e.target.src = 'https://placehold.co/200x200/e8f4fd/0B4F6C?text=Water' }} />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.products?.length > 4 && (
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                          +{order.products.length - 4} more
                        </div>
                      )}
                    </div>

                    {/* Card Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-lightblue/60 text-primary text-xs font-bold hover:bg-lightblue transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingId === order._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {cancellingId === order._id ? (
                            <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FiXCircle className="w-4 h-4" />
                          )}
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>

                </motion.div>
              )
            })}
          </div>
        )}

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkgray/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-card border border-gray-100 p-6 sm:p-8 space-y-6 relative"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-darkgray transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>

                {/* Modal Header */}
                <div className="space-y-2 border-b border-gray-100 pb-4 pr-10">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-darkgray font-mono">Order #{selectedOrder._id}</h2>
                    {getStatusBadge(selectedOrder.orderStatus)}
                  </div>
                  <p className="text-xs text-gray-400">Placed on {formatDate(selectedOrder.createdAt)}</p>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-1 text-xs text-gray-600">
                  <p className="font-bold text-darkgray text-sm flex items-center gap-1.5 mb-1.5">
                    <FiMapPin className="w-4 h-4 text-primary" />
                    <span>Shipping Address</span>
                  </p>
                  <p className="font-bold text-gray-800">{selectedOrder.shippingAddress?.fullName}</p>
                  <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                  {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  <p className="pt-1 font-semibold text-gray-500">Phone: {selectedOrder.shippingAddress?.phone}</p>
                </div>

                {/* Products List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-darkgray uppercase tracking-wider">Ordered Products</h3>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl p-3 max-h-48 overflow-y-auto">
                    {selectedOrder.products?.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded-lg bg-lightblue/30 p-1" loading="lazy"
                            onError={(e) => { e.target.src = 'https://placehold.co/200x200/e8f4fd/0B4F6C?text=Water' }} />
                          <div>
                            <p className="font-bold text-darkgray">{item.name}</p>
                            <p className="text-gray-400">{formatCurrency(item.price)} × {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-extrabold text-darkgray">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-lightblue/20 rounded-2xl p-4 space-y-2 text-xs font-semibold text-gray-600 border border-primary/10">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="font-bold text-darkgray uppercase">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <span className="font-bold text-primary">{selectedOrder.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-darkgray">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-darkgray">{selectedOrder.deliveryCharges === 0 ? 'FREE' : formatCurrency(selectedOrder.deliveryCharges)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-darkgray">
                    <span>Total Amount</span>
                    <span className="text-primary text-base">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {['Placed', 'Confirmed'].includes(selectedOrder.orderStatus) && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      disabled={cancellingId === selectedOrder._id}
                      className="btn-secondary !py-2.5 !px-4 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="btn-primary !py-2.5 !px-5 text-xs font-bold"
                  >
                    Close Window
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default MyOrdersPage
