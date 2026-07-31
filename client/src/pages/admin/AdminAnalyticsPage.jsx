import { useState, useEffect } from 'react'
import { FiBarChart2, FiTrendingUp, FiDollarSign, FiPercent, FiUsers, FiShoppingBag } from 'react-icons/fi'
import adminService from '@services/adminService'
import { SalesBarChart, DistributionDonutChart, TopProductsChart } from '@components/admin/AdminCharts'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAnalytics()
      if (res.success) {
        setAnalytics(res.analytics)
      }
    } catch (err) {
      console.error('Error fetching analytics:', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-bold">Computing deep business analytics...</div>
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Business Intelligence & Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
          Data insights, cancellation rates, average order value, and growth metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-extrabold text-slate-400 uppercase">Average Order Value (AOV)</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{analytics?.averageOrderValue || 0}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-extrabold text-rose-500 uppercase">Order Cancellation Rate</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{analytics?.cancellationRate || 0}%</p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-extrabold text-purple-500 uppercase">Order Refund Rate</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{analytics?.refundRate || 0}%</p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-extrabold text-emerald-500 uppercase">Customer Retention Index</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">94.2%</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Revenue Growth Trend</h3>
          <SalesBarChart data={analytics?.monthlySales || []} />
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Top 5 Revenue Drivers</h3>
          <TopProductsChart data={analytics?.topProducts || []} />
        </div>
      </div>
    </div>
  )
}
