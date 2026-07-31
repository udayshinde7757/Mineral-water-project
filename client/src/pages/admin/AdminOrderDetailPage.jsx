import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiArrowLeft, FiUser, FiMapPin, FiPackage, FiDollarSign,
  FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiPrinter,
  FiSend, FiShield, FiAlertTriangle, FiFileText
} from 'react-icons/fi'
import adminService from '@services/adminService'
import { ROUTES } from '@constants/routes'

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Status update modal / inline state
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  // Cancel Order Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getOrderDetails(id)
      if (res.success) {
        setOrder(res.order)
        setSelectedStatus(res.order.orderStatus)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return
    setUpdating(true)
    try {
      const res = await adminService.updateOrderStatus(id, selectedStatus, statusNotes)
      if (res.success) {
        setOrder(res.order)
        setStatusNotes('')
        alert(`Order status updated to ${selectedStatus}`)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkCompleted = async () => {
    if (!window.confirm('Mark this order as Completed? This will send completion dispatches.')) return
    try {
      const res = await adminService.markOrderCompleted(id)
      if (res.success) {
        setOrder(res.order)
        setSelectedStatus('Completed')
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCancelOrder = async (e) => {
    e.preventDefault()
    setCancelling(true)
    try {
      const res = await adminService.cancelOrder(id, cancellationReason)
      if (res.success) {
        setOrder(res.order)
        setCancelModalOpen(false)
        setSelectedStatus('Cancelled')
        alert('Order cancelled and refund processed (if applicable)')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setCancelling(false)
    }
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-bold">Loading order details...</div>
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-500 font-bold">{error || 'Order not found'}</p>
        <Link to={ROUTES.ADMIN_ORDERS} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">
          Return to Orders List
        </Link>
      </div>
    )
  }

  const timelineSteps = [
    { label: 'Placed', date: order.createdAt },
    { label: 'Confirmed', date: order.confirmedAt },
    { label: 'Processing', date: order.processingAt },
    { label: 'Packed', date: order.packedAt },
    { label: 'Out For Delivery', date: order.outForDeliveryAt },
    { label: 'Delivered', date: order.deliveredAt },
    { label: 'Completed', date: order.completedAt },
  ]

  return (
    <div className="space-y-8 print:p-0">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.ADMIN_ORDERS)}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all shadow-sm"
          >
            <FiArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Order #{order._id}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintInvoice}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <FiPrinter className="w-4 h-4" /> Print Invoice
          </button>

          {order.orderStatus !== 'Completed' && order.orderStatus !== 'Cancelled' && (
            <>
              <button
                onClick={handleMarkCompleted}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <FiCheckCircle className="w-4 h-4" /> Mark Completed
              </button>
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <FiXCircle className="w-4 h-4" /> Cancel Order
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── ORDER STATUS UPDATER CARD ── */}
      {order.orderStatus !== 'Cancelled' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 print:hidden">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Update Order Status</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value="Placed">Status: Placed</option>
              <option value="Confirmed">Status: Confirmed</option>
              <option value="Processing">Status: Processing</option>
              <option value="Packed">Status: Packed</option>
              <option value="Out For Delivery">Status: Out For Delivery</option>
              <option value="Delivered">Status: Delivered</option>
              <option value="Completed">Status: Completed</option>
            </select>

            <input
              type="text"
              placeholder="Optional status update note to customer..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />

            <button
              onClick={handleStatusUpdate}
              disabled={updating || selectedStatus === order.orderStatus}
              className="px-5 py-2.5 rounded-2xl bg-cyan-600 text-white text-xs font-extrabold hover:bg-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiSend className="w-3.5 h-3.5" />
              {updating ? 'Updating...' : 'Update & Notify'}
            </button>
          </div>
        </div>
      )}

      {/* ── ORDER TIMELINE STEPS ── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 print:hidden">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Fulfillment Lifecycle</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {timelineSteps.map((step) => {
            const isDone = Boolean(step.date)
            return (
              <div
                key={step.label}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isDone
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isDone ? <FiCheckCircle className="w-4 h-4 text-cyan-600" /> : <FiClock className="w-4 h-4" />}
                </div>
                <p className="text-[11px] font-extrabold truncate">{step.label}</p>
                <p className="text-[9px] mt-0.5 font-mono">
                  {step.date ? new Date(step.date).toLocaleDateString('en-IN') : 'Pending'}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Products & Invoice */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Ordered Items</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.products?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold">₹{item.price} x {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{order.subtotal || order.totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GST ({order.gst ? '18%' : '0%'})</span>
                <span>₹{order.gst || 0}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Charges</span>
                <span>₹{order.deliveryCharges || 0}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Grand Total</span>
                <span className="text-cyan-600 dark:text-cyan-400">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Activity Log / Status History */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Order Status Audit Trail</h3>
            <div className="space-y-3">
              {order.statusHistory?.length === 0 ? (
                <p className="text-xs text-slate-400">No status updates logged yet</p>
              ) : (
                order.statusHistory?.map((hist, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-cyan-600 dark:text-cyan-400">{hist.status}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(hist.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-semibold">{hist.notes || 'Status updated'}</p>
                    <p className="text-[10px] text-slate-400">By: {hist.updatedBy}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer Details & Payment/Refund Info */}
        <div className="space-y-6">
          {/* Customer & Shipping Info */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FiUser className="w-5 h-5 text-cyan-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Customer Profile</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Full Name</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{order.shippingAddress?.fullName}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Phone Number</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{order.shippingAddress?.phone}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Email Address</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{order.shippingAddress?.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-cyan-500" />
                <span className="font-extrabold text-slate-800 dark:text-slate-200">Shipping Address</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                {order.shippingAddress?.addressLine1}, {order.shippingAddress?.addressLine2 ? `${order.shippingAddress.addressLine2}, ` : ''}
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}, {order.shippingAddress?.country}
              </p>
            </div>
          </div>

          {/* Payment & Refund Status */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FiDollarSign className="w-5 h-5 text-indigo-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Payment Information</h3>
            </div>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method</span>
                <span className="text-slate-800 dark:text-slate-200">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status</span>
                <span className={order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Razorpay Payment ID</span>
                  <span className="font-mono text-cyan-600">{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>

            {/* Refund Section */}
            {order.refundStatus && order.refundStatus !== 'None' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-extrabold text-rose-600 dark:text-rose-400">Refund Status</span>
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1">
                  <p className="font-bold text-rose-700 dark:text-rose-300">Status: {order.refundStatus}</p>
                  {order.refundId && <p className="font-mono text-[10px]">Refund ID: {order.refundId}</p>}
                  {order.refundErrorMessage && (
                    <p className="text-[10px] text-rose-600 font-semibold">{order.refundErrorMessage}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CANCEL ORDER MODAL ── */}
      <AnimatePresence>
        {cancelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <FiAlertTriangle className="w-6 h-6" />
                <h3 className="font-extrabold text-lg">Cancel Order #{order._id.slice(-6)}</h3>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                Cancelling this order will restore item stock levels and automatically trigger an online refund if paid via Razorpay.
              </p>

              <form onSubmit={handleCancelOrder} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Cancellation Reason</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Enter reason for customer notification..."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={cancelling}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
