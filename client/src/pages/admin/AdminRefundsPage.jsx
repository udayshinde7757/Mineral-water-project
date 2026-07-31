import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi'
import adminService from '@services/adminService'

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    setLoading(true)
    try {
      const res = await adminService.getRefunds()
      if (res.success) {
        setRefunds(res.refunds)
      }
    } catch (err) {
      console.error('Error fetching refunds:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRetryRefund = async (orderId) => {
    if (!window.confirm('Retry processing this Razorpay refund?')) return
    try {
      await adminService.retryRefund(orderId)
      alert('Refund successfully processed!')
      fetchRefunds()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Refund Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Monitor Razorpay refunds, inspect failed dispatches, and trigger manual retries
          </p>
        </div>
        <button
          onClick={fetchRefunds}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
        >
          <FiRefreshCw className="w-3.5 h-3.5" /> Refresh Refunds
        </button>
      </div>

      {/* Refunds Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Refund Amount</th>
                <th className="py-3 px-3">Refund ID</th>
                <th className="py-3 px-3">Reason</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">Loading refund ledger...</td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">No refunds recorded</td>
                </tr>
              ) : (
                refunds.map((ref) => (
                  <tr key={ref._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      <Link to={`/admin/orders/${ref._id}`} className="hover:underline">
                        #{ref._id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-4 px-3 text-slate-900 dark:text-white font-bold">
                      {ref.shippingAddress?.fullName || 'Customer'}
                    </td>
                    <td className="py-4 px-3 font-black text-rose-600 dark:text-rose-400">
                      ₹{ref.refundAmount || ref.totalAmount}
                    </td>
                    <td className="py-4 px-3 font-mono text-[11px] text-slate-500">
                      {ref.refundId || 'N/A'}
                    </td>
                    <td className="py-4 px-3 text-slate-600 dark:text-slate-300">
                      {ref.cancellationReason || 'Cancelled order refund'}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${ref.refundStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : ref.refundStatus === 'Failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {ref.refundStatus}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      {ref.refundStatus === 'Failed' && (
                        <button
                          onClick={() => handleRetryRefund(ref._id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all shadow-sm"
                        >
                          Retry Refund
                        </button>
                      )}
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
