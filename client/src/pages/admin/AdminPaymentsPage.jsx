import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiCreditCard, FiDollarSign, FiRefreshCw, FiExternalLink } from 'react-icons/fi'
import adminService from '@services/adminService'
import { ROUTES } from '@constants/routes'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await adminService.getPayments()
      if (res.success) {
        setPayments(res.payments)
      }
    } catch (err) {
      console.error('Error fetching payments:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Payment Transactions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Audit payment dispatches, Razorpay payment IDs, and transaction statuses
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
        >
          <FiRefreshCw className="w-3.5 h-3.5" /> Refresh Payments
        </button>
      </div>

      {/* Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Razorpay Payment ID</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Transaction Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">Loading payment records...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">No payments recorded</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      <Link to={`/admin/orders/${p._id}`} className="hover:underline flex items-center gap-1">
                        #{p._id.slice(-6).toUpperCase()} <FiExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-4 px-3 text-slate-900 dark:text-white font-bold">
                      {p.shippingAddress?.fullName || 'Customer'}
                    </td>
                    <td className="py-4 px-3 text-slate-700 dark:text-slate-300 font-bold">
                      {p.paymentMethod}
                    </td>
                    <td className="py-4 px-3 font-mono text-[11px] text-slate-500">
                      {p.razorpayPaymentId || 'N/A (COD)'}
                    </td>
                    <td className="py-4 px-3 font-black text-slate-900 dark:text-white">
                      ₹{p.totalAmount}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${p.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : p.paymentStatus === 'Refunded' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-500 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
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
