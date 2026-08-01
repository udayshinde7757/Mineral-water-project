import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPackage,
  FiXCircle,
  FiMapPin,
  FiRefreshCw,
  FiEye,
  FiCalendar,
  FiAlertCircle,
  FiX,
  FiInfo,
} from 'react-icons/fi'
import orderService from '@services/orderService'
import { ROUTES } from '@constants/routes'

function MyOrdersPage() {
  document.title = 'My Orders — AquaPure'
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
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

  // Open the cancellation confirmation modal
  const openCancelModal = (order) => {
    setCancelError('')
    setCancelReason('')
    setCancelModalOrder(order)
  }

  const closeCancelModal = () => {
    setCancelModalOrder(null)
    setCancelReason('')
    setCancelError('')
  }

  // Confirm Cancellation
  const confirmCancelOrder = async () => {
    if (!cancelModalOrder) return

    try {
      setCancellingId(cancelModalOrder._id)
      setCancelError('')
      const res = await orderService.cancelOrder(cancelModalOrder._id, cancelReason)

      if (res.success) {
        const updatedOrder = res.order
        // Update order in local state with the full server response
        setOrders((prev) =>
          prev.map((o) => (o._id === cancelModalOrder._id ? updatedOrder : o))
        )
        if (selectedOrder?._id === cancelModalOrder._id) {
          setSelectedOrder(updatedOrder)
        }
        closeCancelModal()
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
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">Order Placed</span>
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">Pending</span>
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">Confirmed</span>
      case 'Processing':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700">Processing</span>
      case 'Packed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700">Packed</span>
      case 'Shipped':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">Shipped</span>
      case 'Out For Delivery':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">Out for Delivery</span>
      case 'Delivered':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">Delivered</span>
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">Completed</span>
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600">Cancelled</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">{status}</span>
    }
  }

  // Refund Status Badge
  const getRefundBadge = (refundStatus) => {
    switch (refundStatus) {
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600">Refund Completed</span>
      case 'Initiated':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">Refund Initiated</span>
      case 'Failed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600">Refund Failed</span>
      default:
        return null
    }
  }

  // Whether the order can currently be cancelled
  const canCancelOrder = (order) => ['Placed', 'Pending', 'Confirmed', 'Processing'].includes(order.orderStatus)

  // Filter Orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') return ['Placed', 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery'].includes(order.orderStatus)
    if (activeTab === 'delivered') return ['Delivered', 'Completed'].includes(order.orderStatus)
    if (activeTab === 'cancelled') return order.orderStatus === 'Cancelled'
    return true // 'all'
  })

  return (
    <div className="bg-[#F8FBFD] min-h-screen py-10 lg:py-16">
      <div className="container-app">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200/80 bg-white text-sm font-semibold text-gray-600 hover:text-[#0F4C81] hover:border-[#0F4C81]/40 transition-all shadow-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0F4C81]' : ''}`} />
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
              count: orders.filter((o) => ['Placed', 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery'].includes(o.orderStatus)).length,
            },
            {
              id: 'delivered',
              label: 'Delivered',
              count: orders.filter((o) => ['Delivered', 'Completed'].includes(o.orderStatus)).length,
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
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#0F4C81] text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200/70 hover:border-[#0F4C81]/40 hover:text-[#0F4C81]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
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
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100/80 shadow-sm gap-3">
            <FiRefreshCw className="w-10 h-10 text-primary animate-spin" />
            <p className="text-gray-500 font-semibold text-sm">Fetching your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty Orders State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-10 md:p-16 text-center max-w-lg mx-auto shadow-sm border border-gray-100/80 space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
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
            <Link to={ROUTES.PRODUCTS} className="btn-primary inline-flex !px-8 !py-3.5 font-semibold text-sm">
              Shop Mineral Water
            </Link>
          </motion.div>
        ) : (
          /* Order Cards List */
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const canCancel = canCancelOrder(order)

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100/80 hover:border-primary/20 hover:shadow-sm transition-all shadow-sm"
                >
                  {/* Card Top Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100/70 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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
                      {getRefundBadge(order.refundStatus)}
                    </div>
                  </div>

                  {/* Products Thumbnail Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {order.products?.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-14 rounded-xl bg-[#F8FBFD] border border-gray-100/80 p-1 flex-shrink-0 flex items-center justify-center relative"
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
                        <div className="w-14 h-14 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold flex items-center justify-center">
                          +{order.products.length - 4} more
                        </div>
                      )}
                    </div>

                    {/* Card Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => openCancelModal(order)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          <FiXCircle className="w-4 h-4" />
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
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label="Order details"
              onKeyDown={(e) => { if (e.key === 'Escape') setSelectedOrder(null) }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-gray-100/80 p-6 sm:p-8 space-y-6 relative"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close order details"
                  className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>

                {/* Modal Header */}
                <div className="space-y-2 border-b border-gray-100/70 pb-4 pr-10">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-darkgray font-mono">Order #{selectedOrder._id}</h2>
                    {getStatusBadge(selectedOrder.orderStatus)}
                  </div>
                  <p className="text-xs text-gray-400">Placed on {formatDate(selectedOrder.createdAt)}</p>
                </div>

                {/* Cancellation / Refund Banner */}
                {selectedOrder.orderStatus === 'Cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5">
                    <p className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                      <FiInfo className="w-4 h-4" />
                      <span>Order Cancelled {formatDate(selectedOrder.cancelledAt)}</span>
                    </p>
                    {selectedOrder.cancellationReason && (
                      <p className="text-xs text-red-600">Reason: {selectedOrder.cancellationReason}</p>
                    )}
                    {selectedOrder.refundStatus && selectedOrder.refundStatus !== 'None' && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {getRefundBadge(selectedOrder.refundStatus)}
                        {selectedOrder.refundStatus === 'Failed' && (
                          <span className="text-xs text-red-600 font-semibold">
                            Refund failed — our team is resolving this.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Shipping Address */}
                <div className="bg-[#F8FBFD] rounded-xl p-4 border border-gray-100/80 space-y-1 text-xs text-gray-600">
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
                  <div className="divide-y divide-gray-100 border border-gray-100/80 rounded-xl p-3 max-h-48 overflow-y-auto">
                    {selectedOrder.products?.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded-lg bg-[#F8FBFD] p-1" loading="lazy"
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
                <div className="bg-[#F8FBFD] rounded-xl p-4 space-y-2 text-xs font-semibold text-gray-600 border border-primary/10">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="font-bold text-darkgray uppercase">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <span className="font-bold text-primary">{selectedOrder.paymentStatus}</span>
                  </div>
                  {selectedOrder.refundStatus && selectedOrder.refundStatus !== 'None' && (
                    <>
                      <div className="flex justify-between">
                        <span>Refund Status</span>
                        <span className="font-bold text-primary">{selectedOrder.refundStatus}</span>
                      </div>
                      {selectedOrder.refundId && (
                        <div className="flex justify-between">
                          <span>Refund ID</span>
                          <span className="font-bold text-darkgray font-mono">{selectedOrder.refundId}</span>
                        </div>
                      )}
                    </>
                  )}
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
                  {canCancelOrder(selectedOrder) && (
                    <button
                      type="button"
                      onClick={() => { openCancelModal(selectedOrder); setSelectedOrder(null) }}
                      className="btn-secondary !py-2.5 !px-4 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="btn-primary !py-2.5 !px-5 text-xs font-semibold"
                  >
                    Close Window
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {cancelModalOrder && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label="Cancel order confirmation"
              onKeyDown={(e) => { if (e.key === 'Escape') setCancelModalOrder(null) }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-100/80 p-6 sm:p-8 space-y-5"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                    <FiXCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-darkgray">Cancel Order?</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Order <span className="font-mono font-bold text-darkgray">#{cancelModalOrder._id}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-relaxed">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </div>

                {cancelModalOrder.paymentMethod !== 'COD' && cancelModalOrder.paymentStatus === 'Paid' && (
                  <p className="text-xs text-gray-500 leading-relaxed">
                    A full refund of <span className="font-bold text-darkgray">{formatCurrency(cancelModalOrder.totalAmount)}</span>{' '}
                    will be initiated to your original payment method.
                  </p>
                )}

                {/* Optional Reason */}
                <div className="space-y-1.5">
                  <label htmlFor="cancel-reason" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Reason (optional)
                  </label>
                  <textarea
                    id="cancel-reason"
                    rows="3"
                    maxLength="500"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Changed my mind, ordered by mistake..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  />
                </div>

                {cancelError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-sm font-medium">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{cancelError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeCancelModal}
                    disabled={cancellingId === cancelModalOrder._id}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    onClick={confirmCancelOrder}
                    disabled={cancellingId === cancelModalOrder._id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {cancellingId === cancelModalOrder._id ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <FiXCircle className="w-4 h-4" />
                        <span>Confirm Cancellation</span>
                      </>
                    )}
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
