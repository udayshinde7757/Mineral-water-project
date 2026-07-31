import { useState, useEffect } from 'react'
import { FiBell, FiMail, FiMessageSquare, FiRefreshCw, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import adminService from '@services/adminService'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await adminService.getNotifications()
      if (res.success) {
        setNotifications(res.notifications)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRetryNotification = async (id) => {
    try {
      await adminService.retryNotification(id)
      alert('Notification retry queued and sent!')
      fetchNotifications()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Notification Audit Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Audit outbound Email (Nodemailer) & WhatsApp customer status dispatches
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
        >
          <FiRefreshCw className="w-3.5 h-3.5" /> Refresh Audit Logs
        </button>
      </div>

      {/* Notifications Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Event</th>
                <th className="py-3 px-3">Recipient</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Delivery Status</th>
                <th className="py-3 px-3">Sent Time</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">Loading notification audit logs...</td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">No notification records found</td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2 font-bold">
                        {n.type === 'Email' ? (
                          <FiMail className="w-4 h-4 text-cyan-500" />
                        ) : (
                          <FiMessageSquare className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className="text-slate-800 dark:text-slate-200">{n.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-extrabold text-cyan-600 dark:text-cyan-400">
                      {n.event}
                    </td>
                    <td className="py-4 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {n.recipient}
                    </td>
                    <td className="py-4 px-3 text-slate-900 dark:text-white font-bold">
                      {n.customerName || 'Customer'}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${n.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-500 text-[11px]">
                      {new Date(n.sentAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right">
                      {n.status === 'Failed' && (
                        <button
                          onClick={() => handleRetryNotification(n._id)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-extrabold hover:bg-cyan-700"
                        >
                          Retry Dispatch
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
