import { useState, useEffect, useCallback } from 'react'
import {
  FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight,
  FiActivity, FiClock, FiMapPin, FiInbox
} from 'react-icons/fi'
import adminService from '@services/adminService'

const MODULE_COLORS = {
  Orders: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  Products: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  Inventory: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  Customers: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  Payments: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  Settings: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Notifications: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
  Auth: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  Security: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  Profile: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  System: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const moduleColor = (m) => MODULE_COLORS[m] || MODULE_COLORS.System

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500'

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [module, setModule] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getActivityLogs({
        search,
        module,
        startDate,
        endDate,
        page,
        limit: 10,
      })
      if (res.success) {
        setLogs(res.logs)
        setPagination(res.pagination)
      }
    } catch (err) {
      setError(err.message || 'Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }, [search, module, startDate, endDate, page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Any filter change returns to the first page
  const changeFilter = (setter) => (value) => {
    setter(value)
    if (page !== 1) setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setModule('All')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  // Derive module options from the logs currently in view
  const modules = [...new Set(logs.map((l) => l.targetResource || 'System'))].sort()

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin Activity Logs</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Complete history of every action performed by administrators
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Logs: <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">{pagination.total}</span>
        </div>
      </div>

      {/* ── SEARCH & FILTERS TOOLBAR ── */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => changeFilter(setSearch)(e.target.value)}
              placeholder="Search admin, action or details..."
              className={`${inputClass} pl-10`}
            />
          </div>

          {/* Module filter */}
          <select value={module} onChange={(e) => changeFilter(setModule)(e.target.value)} className={inputClass}>
            <option value="All">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Date range */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => changeFilter(setStartDate)(e.target.value)}
              className={inputClass}
              title="From date"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => changeFilter(setEndDate)(e.target.value)}
              className={inputClass}
              title="To date"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-semibold">
            Showing {logs.length} of {pagination.total} log entries
          </span>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold">
          {error}
        </div>
      )}

      {/* ── LOGS TABLE ── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                <th className="py-4 px-3">Admin Name</th>
                <th className="py-4 px-3">Action</th>
                <th className="py-4 px-3">Module</th>
                <th className="py-4 px-3">Description</th>
                <th className="py-4 px-3">Date</th>
                <th className="py-4 px-3">Time</th>
                <th className="py-4 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400 font-bold">
                    <FiClock className="w-5 h-5 inline animate-spin mr-2" />
                    Loading activity logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-14">
                    <FiInbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-slate-400 font-bold">No activity logs found</p>
                    <p className="text-[11px] text-slate-400/70 mt-1">
                      Try adjusting your search or filters, or check back later.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-3">
                      <p className="text-slate-900 dark:text-white text-sm">{log.adminName || 'Admin'}</p>
                      <p className="text-[10px] text-slate-400">{log.adminEmail}</p>
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <FiActivity className="w-3 h-3 text-cyan-500" />
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${moduleColor(log.targetResource)}`}>
                        {log.targetResource || 'System'}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-slate-500 dark:text-slate-400 text-xs max-w-[300px]">
                      <span className="line-clamp-2">{log.details}</span>
                    </td>
                    <td className="py-4 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <FiMapPin className="w-3 h-3 text-slate-400" />
                        {log.ipAddress || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLS ── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 dark:border-slate-800">
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
