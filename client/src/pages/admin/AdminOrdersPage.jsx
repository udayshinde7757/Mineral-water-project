import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiSearch, FiFilter, FiEye, FiCheckCircle, FiXCircle,
  FiChevronLeft, FiChevronRight, FiClock, FiTruck, FiPackage, FiRefreshCw
} from 'react-icons/fi'
import adminService from '@services/adminService'
import { ROUTES } from '@constants/routes'

export default function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [sortBy, setSortBy] = useState('latest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchOrders()
  }, [search, statusFilter, paymentFilter, sortBy, page])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await adminService.getOrders({
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
        sortBy,
        page,
        limit: 10,
      })
      if (res.success) {
        setOrders(res.orders)
        setPagination(res.pagination)
      }
    } catch (err) {
      console.error('Error loading orders:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus, `Updated from orders list`)
      fetchOrders()
    } catch (err) {
      alert(err.message)
    }
  }

  const statuses = [
    'All', 'Placed', 'Pending', 'Confirmed', 'Processing', 'Packed',
    'Out For Delivery', 'Delivered', 'Completed', 'Cancelled'
  ]

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
      case 'Confirmed':
      case 'Processing':
      case 'Packed':
      case 'Out For Delivery':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
      case 'Pending':
      case 'Placed':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Order Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Monitor, update, and manage all customer orders in real-time
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Orders: <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">{pagination.total}</span>
        </div>
      </div>

      {/* ── SEARCH & FILTERS TOOLBAR ── */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, Customer, Phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 text-slate-800 dark:text-slate-100 focus:outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 text-slate-800 dark:text-slate-100 focus:outline-none transition-all font-semibold"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>Status: {s}</option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value)
              setPage(1)
            }}
            className="w-full px-3 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 text-slate-800 dark:text-slate-100 focus:outline-none transition-all font-semibold"
          >
            <option value="All">Payment: All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 text-slate-800 dark:text-slate-100 focus:outline-none transition-all font-semibold"
          >
            <option value="latest">Sort: Latest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest">Sort: Highest Amount</option>
            <option value="lowest">Sort: Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* ── ORDERS TABLE ── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer Details</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400 font-bold">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400 font-bold">No matching orders found</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      #{ord._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">{ord.shippingAddress?.fullName}</p>
                      <p className="text-[11px] text-slate-400">{ord.shippingAddress?.phone}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{ord.shippingAddress?.email}</p>
                    </td>
                    <td className="py-4 px-3">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {ord.products?.length || 0} items
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {ord.products?.[0]?.name} {ord.products?.length > 1 ? `+${ord.products.length - 1} more` : ''}
                      </p>
                    </td>
                    <td className="py-4 px-3">
                      <p className="font-black text-slate-900 dark:text-white">₹{ord.totalAmount}</p>
                      <p className="text-[10px] text-slate-400">GST: ₹{ord.gst || 0}</p>
                    </td>
                    <td className="py-4 px-3">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{ord.paymentMethod}</p>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${getStatusBadgeClass(ord.orderStatus)}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-500 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right space-x-1">
                      <Link
                        to={`/admin/orders/${ord._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition-all text-xs shadow-sm"
                      >
                        <FiEye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLS ── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40"
              >
                <FiChevronLeft className="w-4 h-4 inline" /> Prev
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40"
              >
                Next <FiChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
