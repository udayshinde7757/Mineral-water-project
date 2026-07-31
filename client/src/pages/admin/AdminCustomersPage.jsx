import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiSearch, FiShieldOff, FiShield, FiTrash2, FiShoppingBag, FiDollarSign } from 'react-icons/fi'
import adminService from '@services/adminService'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchCustomers()
  }, [search, page])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await adminService.getCustomers({ search, page, limit: 10 })
      if (res.success) {
        setCustomers(res.customers)
        setPagination(res.pagination)
      }
    } catch (err) {
      console.error('Error fetching customers:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (customer) => {
    const nextStatus = customer.status === 'blocked' ? 'active' : 'blocked'
    if (!window.confirm(`Set customer account status for ${customer.email} to "${nextStatus}"?`)) return

    try {
      await adminService.updateCustomerStatus(customer._id, nextStatus)
      fetchCustomers()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Permanently delete customer account ${customer.email}?`)) return
    try {
      await adminService.deleteCustomer(customer._id)
      fetchCustomers()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Customer Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Manage registered accounts, view spending metrics, and enforce account security
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Registered Customers: <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">{pagination.total}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 text-slate-800 dark:text-slate-100 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Orders</th>
                <th className="py-3 px-3">Lifetime Spend</th>
                <th className="py-3 px-3">Joined Date</th>
                <th className="py-3 px-3">Account Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">No customers found</td>
                </tr>
              ) : (
                customers.map((cust) => {
                  const isBlocked = cust.status === 'blocked'
                  return (
                    <tr key={cust._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-extrabold text-xs flex items-center justify-center uppercase">
                          {cust.fullname ? cust.fullname.substring(0, 2) : 'CU'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">{cust.fullname}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: #{cust._id.slice(-6)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <p className="text-slate-800 dark:text-slate-200">{cust.email}</p>
                        <p className="text-[10px] text-slate-400">{cust.phone || 'No phone'}</p>
                      </td>
                      <td className="py-4 px-3 font-bold text-slate-900 dark:text-white">
                        {cust.totalOrders || 0} orders
                      </td>
                      <td className="py-4 px-3 font-black text-cyan-600 dark:text-cyan-400">
                        ₹{(cust.lifetimeSpending || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-3 text-slate-500 text-[11px]">
                        {new Date(cust.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${isBlocked ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleToggleBlock(cust)}
                          className={`p-2 rounded-xl transition-all font-bold ${isBlocked ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                          title={isBlocked ? 'Unblock Customer' : 'Block Customer'}
                        >
                          {isBlocked ? <FiShield className="w-3.5 h-3.5" /> : <FiShieldOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(cust)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-all text-slate-700 dark:text-slate-200"
                          title="Delete Customer"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
