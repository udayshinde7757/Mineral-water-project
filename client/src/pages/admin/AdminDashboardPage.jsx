import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiDollarSign, FiShoppingBag, FiClock, FiCheckCircle,
  FiXCircle, FiRefreshCw, FiUsers, FiBox, FiAlertTriangle,
  FiTrendingUp, FiCalendar, FiArrowUpRight, FiEye
} from 'react-icons/fi'
import adminService from '@services/adminService'
import { SalesBarChart, DistributionDonutChart, TopProductsChart } from '@components/admin/AdminCharts'
import { ROUTES } from '@constants/routes'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, analyticsRes, ordersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAnalytics(),
        adminService.getOrders({ limit: 5 }),
      ])

      if (statsRes.success) setStats(statsRes.stats)
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics)
      if (ordersRes.success) setRecentOrders(ordersRes.orders)
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    )
  }

  const statCardsData = [
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`, icon: FiDollarSign, color: 'emerald' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: FiShoppingBag, color: 'cyan' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: FiClock, color: 'amber' },
    { label: 'Processing Orders', value: stats?.processingOrders || 0, icon: FiTrendingUp, color: 'indigo' },
    { label: 'Completed Orders', value: stats?.completedOrders || 0, icon: FiCheckCircle, color: 'emerald' },
    { label: 'Cancelled Orders', value: stats?.cancelledOrders || 0, icon: FiXCircle, color: 'rose' },
    { label: 'Refunded Orders', value: stats?.refundedOrders || 0, icon: FiRefreshCw, color: 'purple' },
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: FiUsers, color: 'blue' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: FiBox, color: 'teal' },
    { label: 'Out of Stock', value: stats?.outOfStockProducts || 0, icon: FiAlertTriangle, color: 'rose' },
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: FiCalendar, color: 'cyan' },
    { label: 'This Week Orders', value: stats?.weekOrders || 0, icon: FiCalendar, color: 'indigo' },
    { label: 'Month Revenue', value: `₹${stats?.thisMonthRevenue?.toLocaleString('en-IN') || 0}`, icon: FiDollarSign, color: 'emerald' },
  ]

  const colorStyles = {
    emerald: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    amber: 'from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    indigo: 'from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    rose: 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    purple: 'from-purple-500/10 to-fuchsia-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    blue: 'from-blue-500/10 to-sky-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    teal: 'from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Real-time metrics & business analytics for AquaPure</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-sm"
        >
          <FiRefreshCw className="w-3.5 h-3.5" /> Refresh Live Data
        </button>
      </div>

      {/* ── 13 STATISTIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {statCardsData.map((card, idx) => {
          const Icon = card.icon
          const style = colorStyles[card.color] || colorStyles.cyan
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border ${style.split(' ')[4]} shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${style.split(' ')[0]} ${style.split(' ')[1]} ${style.split(' ')[2]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Bar Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Monthly Sales & Revenue Growth</h3>
              <p className="text-xs text-slate-400">Revenue performance over recent months</p>
            </div>
            <Link to={ROUTES.ADMIN_ANALYTICS} className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              Detailed Analytics <FiArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <SalesBarChart data={analytics?.monthlySales || []} />
        </div>

        {/* Top Selling Products */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Top Selling Products</h3>
            <p className="text-xs text-slate-400">Highest volume items</p>
          </div>
          <TopProductsChart data={analytics?.topProducts || []} />
        </div>
      </div>

      {/* ── DISTRIBUTION CHARTS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Order Status Distribution</h3>
            <p className="text-xs text-slate-400">Current status breakdown</p>
          </div>
          <DistributionDonutChart data={analytics?.statusDistribution || []} title="Orders" />
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Payment Methods Breakdown</h3>
            <p className="text-xs text-slate-400">Payment gateway vs COD mix</p>
          </div>
          <DistributionDonutChart data={analytics?.paymentMethods || []} title="Payments" />
        </div>
      </div>

      {/* ── RECENT ORDERS TABLE ── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Latest orders placed on store</p>
          </div>
          <Link to={ROUTES.ADMIN_ORDERS} className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-400">No recent orders found</td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      #{ord._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {ord.shippingAddress?.fullName || 'Customer'}
                    </td>
                    <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white">
                      ₹{ord.totalAmount}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                      {ord.paymentMethod} ({ord.paymentStatus})
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/admin/orders/${ord._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-white transition-all text-slate-700 dark:text-slate-200"
                      >
                        <FiEye className="w-3.5 h-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
