import { useState, useEffect, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiPackage, FiImage, FiStar, FiMessageSquare,
  FiSearch, FiCheckCircle, FiTrash2, FiEdit2, FiPlus,
  FiX, FiRefreshCw, FiAlertCircle, FiUsers, FiBarChart2,
  FiLoader, FiEye, FiClock, FiTrendingUp, FiZap,
  FiShoppingCart, FiXCircle, FiInfo,
} from 'react-icons/fi'
import { AuthContext } from '@context/AuthContext'
import enquiryService from '@services/enquiryService'
import productService from '@services/productService'
import galleryService from '@services/galleryService'
import testimonialService from '@services/testimonialService'
import orderService from '@services/orderService'

// ─── Reusable Modal ────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-xl shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-base font-extrabold text-darkgray">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'primary', sub }) {
  const colorMap = {
    primary:  'bg-blue-50 text-primary',
    emerald:  'bg-emerald-50 text-emerald-600',
    amber:    'bg-amber-50 text-amber-600',
    rose:     'bg-rose-50 text-rose-600',
    violet:   'bg-violet-50 text-violet-600',
  }
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-darkgray leading-tight">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-400 font-semibold">{message}</p>
    </div>
  )
}

// ─── Input Field ───────────────────────────────────────────────────────────────
function FormInput({ label, id, error, ...props }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 focus:bg-white transition-all ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
    </div>
  )
}

function FormSelect({ label, id, children, ...props }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
      >
        {children}
      </select>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardTab() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const data = await enquiryService.getDashboardStats()
        if (data.success) setStats(data.stats)
        else setError('Failed to load dashboard data.')
      } catch {
        setError('Server error loading dashboard stats. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-52 gap-2 text-gray-400">
        <FiLoader className="animate-spin w-5 h-5" />
        <span className="text-sm font-semibold">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40 gap-2 text-red-500 text-sm font-bold">
        <FiAlertCircle className="w-5 h-5" /> {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={FiMessageSquare} label="Total Enquiries" value={stats?.enquiries?.total} color="primary" />
        <StatCard icon={FiClock} label="Pending" value={stats?.enquiries?.pending} color="amber" />
        <StatCard icon={FiCheckCircle} label="Completed" value={stats?.enquiries?.completed} color="emerald" />
        <StatCard icon={FiUsers} label="Registered Users" value={stats?.counts?.users} color="violet" />
        <StatCard icon={FiPackage} label="Products" value={stats?.counts?.products} color="primary" />
        <StatCard icon={FiImage} label="Gallery Items" value={stats?.counts?.gallery} color="rose" />
        <StatCard icon={FiStar} label="Testimonials" value={stats?.counts?.testimonials} color="amber" />
        <StatCard
          icon={FiTrendingUp}
          label="Resolution Rate"
          value={`${stats?.enquiries?.total > 0 ? Math.round((stats?.enquiries?.completed / stats?.enquiries?.total) * 100) : 0}%`}
          color="emerald"
        />
      </div>

      {/* Recent Enquiries */}
      <div>
        <h4 className="text-sm font-extrabold text-darkgray mb-3 flex items-center gap-2">
          <FiZap className="text-amber-500" /> Recent Enquiries
        </h4>
        {stats?.recentEnquiries?.length > 0 ? (
          <div className="space-y-2">
            {stats.recentEnquiries.map((enq) => (
              <div
                key={enq._id}
                className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-card transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-darkgray truncate">{enq.name}</p>
                  <p className="text-xs text-gray-400 truncate">{enq.email}</p>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  {enq.product && (
                    <p className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full hidden sm:block">
                      {enq.product.name}
                    </p>
                  )}
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      enq.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={FiMessageSquare} message="No enquiries yet." />
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENQUIRIES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState('')
  const [error, setError] = useState('')
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)

  const loadEnquiries = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = { page, limit: 10 }
      if (search.trim()) params.search = search.trim()
      if (statusFilter !== 'All') params.status = statusFilter
      const data = await enquiryService.getEnquiries(params)
      if (data.success) {
        setEnquiries(data.enquiries)
        setTotal(data.total)
        setTotalPages(data.pages)
      } else {
        setError('Failed to load enquiries.')
      }
    } catch {
      setError('Server error fetching enquiries.')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    loadEnquiries()
  }, [loadEnquiries])

  const handleComplete = async (id) => {
    try {
      setActionLoading(id + '-complete')
      const data = await enquiryService.completeEnquiry(id)
      if (data.success) {
        setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, status: 'completed' } : e)))
      }
    } catch {
      alert('Failed to update enquiry status.')
    } finally {
      setActionLoading('')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this enquiry?')) return
    try {
      setActionLoading(id + '-delete')
      const data = await enquiryService.deleteEnquiry(id)
      if (data.success) {
        setEnquiries((prev) => prev.filter((e) => e._id !== id))
        setTotal((t) => t - 1)
      }
    } catch {
      alert('Failed to delete enquiry.')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            id="enq-search"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <select
          id="enq-status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={loadEnquiries}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-bold p-3 bg-red-50 rounded-xl">
          <FiAlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <FiLoader className="animate-spin w-6 h-6 text-primary" />
        </div>
      ) : enquiries.length === 0 ? (
        <EmptyState icon={FiMessageSquare} message="No enquiries found matching your criteria." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Product</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enquiries.map((enq) => (
                <tr key={enq._id} className="bg-white hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-darkgray">{enq.name}</p>
                    <p className="text-xs text-gray-400">{enq.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{enq.phone}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {enq.product ? enq.product.name : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{enq.quantity}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        enq.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedEnquiry(enq)}
                        title="View Details"
                        className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary flex items-center justify-center transition-colors"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      {enq.status === 'pending' && (
                        <button
                          onClick={() => handleComplete(enq._id)}
                          title="Mark Completed"
                          disabled={actionLoading === enq._id + '-complete'}
                          className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          {actionLoading === enq._id + '-complete' ? (
                            <FiLoader className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FiCheckCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(enq._id)}
                        title="Delete Enquiry"
                        disabled={actionLoading === enq._id + '-delete'}
                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        {actionLoading === enq._id + '-delete' ? (
                          <FiLoader className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FiTrash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-400">
            Showing {enquiries.length} of {total} enquiries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-bold">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedEnquiry && (
        <Modal title="Enquiry Details" onClose={() => setSelectedEnquiry(null)}>
          <div className="space-y-3 text-sm">
            {[
              ['Customer', selectedEnquiry.name],
              ['Email', selectedEnquiry.email],
              ['Phone', selectedEnquiry.phone],
              ['Product', selectedEnquiry.product?.name || '—'],
              ['Quantity', selectedEnquiry.quantity],
              ['Status', selectedEnquiry.status],
              ['Submitted', new Date(selectedEnquiry.createdAt).toLocaleString('en-IN')],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-3">
                <span className="text-gray-400 font-bold w-24 flex-shrink-0">{label}:</span>
                <span className="text-darkgray font-semibold capitalize">{val}</span>
              </div>
            ))}
            <div className="pt-2">
              <span className="text-gray-400 font-bold block mb-1">Message:</span>
              <p className="text-darkgray bg-gray-50 p-3 rounded-xl text-sm leading-relaxed">
                {selectedEnquiry.message}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ProductsTab() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '', size: '', price: '', category: 'Still', description: '', imageUrl: '', stock: 100, isAvailable: true
  })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getProducts()
      if (data.success) setProducts(data.products)
      else setError('Failed to load products.')
    } catch {
      setError('Server error loading products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  const openAdd = () => {
    setEditingProduct(null)
    setFormData({ name: '', size: '', price: '', category: 'Still', description: '', imageUrl: '', stock: 100, isAvailable: true })
    setFormErrors({})
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      size: product.size,
      price: product.price,
      category: product.category,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      stock: product.stock ?? 100,
      isAvailable: product.isAvailable !== false,
    })
    setFormErrors({})
    setShowModal(true)
  }

  const validateProduct = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Product name is required'
    if (!formData.size.trim()) errors.size = 'Size is required'
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Valid price is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateProduct()) return
    try {
      setSaving(true)
      const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock) }
      let data
      if (editingProduct) {
        data = await productService.updateProduct(editingProduct._id, payload)
      } else {
        data = await productService.createProduct(payload)
      }
      if (data.success) {
        setShowModal(false)
        await loadProducts()
      } else {
        alert(data.message || 'Failed to save product.')
      }
    } catch {
      alert('Server error saving product.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this product?')) return
    try {
      setDeletingId(id)
      const data = await productService.deleteProduct(id)
      if (data.success) setProducts((prev) => prev.filter((p) => p._id !== id))
    } catch {
      alert('Failed to delete product.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{products.length} products total</p>
        <button onClick={openAdd} id="admin-add-product" className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-1.5">
          <FiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-bold p-3 bg-red-50 rounded-xl">
          <FiAlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><FiLoader className="animate-spin w-6 h-6 text-primary" /></div>
      ) : products.length === 0 ? (
        <EmptyState icon={FiPackage} message="No products found. Add your first product above." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Stock</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p._id} className="bg-white hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-darkgray">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.size}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.category}</td>
                  <td className="px-4 py-3 text-right font-bold text-darkgray">₹{p.price}</td>
                  <td className="px-4 py-3 text-center text-gray-600 hidden md:table-cell">{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.isAvailable !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {p.isAvailable !== false ? 'Available' : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary flex items-center justify-center transition-colors" title="Edit">
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deletingId === p._id}
                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === p._id ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiTrash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <Modal title={editingProduct ? 'Edit Product' : 'Add New Product'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormInput id="p-name" label="Product Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Premium Mineral Water" error={formErrors.name} />
              <FormInput id="p-size" label="Size *" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder="e.g. 500ml" error={formErrors.size} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput id="p-price" label="Price (₹) *" type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. 20" error={formErrors.price} />
              <FormInput id="p-stock" label="Stock Quantity" type="number" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="e.g. 100" />
            </div>
            <FormSelect id="p-category" label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option value="Still">Still</option>
              <option value="Sparkling">Sparkling</option>
              <option value="Flavoured">Flavoured</option>
              <option value="Bulk">Bulk</option>
            </FormSelect>
            <FormInput id="p-image" label="Image URL" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" />
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm font-semibold text-darkgray">Mark as Available</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary !py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <FiLoader className="animate-spin w-4 h-4" /> : null}
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY TAB
// ═══════════════════════════════════════════════════════════════════════════════
function GalleryTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ title: '', imageUrl: '', category: 'Products' })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await galleryService.getGallery()
      if (data.success) setItems(data.gallery)
      else setError('Failed to load gallery.')
    } catch {
      setError('Server error loading gallery.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  const openAdd = () => {
    setEditingItem(null)
    setFormData({ title: '', imageUrl: '', category: 'Products' })
    setFormErrors({})
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setFormData({ title: item.title, imageUrl: item.imageUrl, category: item.category })
    setFormErrors({})
    setShowModal(true)
  }

  const validate = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.imageUrl.trim()) errors.imageUrl = 'Image URL is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      let data
      if (editingItem) {
        data = await galleryService.updateGalleryItem(editingItem._id, formData)
      } else {
        data = await galleryService.createGalleryItem(formData)
      }
      if (data.success) {
        setShowModal(false)
        await loadItems()
      } else {
        alert(data.message || 'Failed to save gallery item.')
      }
    } catch {
      alert('Server error saving gallery item.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this gallery item?')) return
    try {
      setDeletingId(id)
      const data = await galleryService.deleteGalleryItem(id)
      if (data.success) setItems((prev) => prev.filter((i) => i._id !== id))
    } catch {
      alert('Failed to delete gallery item.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{items.length} gallery items</p>
        <button onClick={openAdd} id="admin-add-gallery" className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-1.5">
          <FiPlus className="w-4 h-4" /> Add Image
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-bold p-3 bg-red-50 rounded-xl">
          <FiAlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><FiLoader className="animate-spin w-6 h-6 text-primary" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={FiImage} message="No gallery items found." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item._id} className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/300x300/e8f4fd/0A77B7?text=Image' }}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <p className="text-white text-xs font-bold text-center px-2 line-clamp-2">{item.title}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center" title="Edit">
                    <FiEdit2 className="w-3.5 h-3.5 text-primary" />
                  </button>
                  <button onClick={() => handleDelete(item._id)} disabled={deletingId === item._id} className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center" title="Delete">
                    {deletingId === item._id ? <FiLoader className="w-3.5 h-3.5 text-white animate-spin" /> : <FiTrash2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Modal */}
      {showModal && (
        <Modal title={editingItem ? 'Edit Gallery Item' : 'Add Gallery Image'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <FormInput id="g-title" label="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Image title" error={formErrors.title} />
            <FormInput id="g-image" label="Image URL *" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." error={formErrors.imageUrl} />
            <FormSelect id="g-cat" label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option value="Products">Products</option>
              <option value="Factory">Factory</option>
              <option value="Events">Events</option>
              <option value="Team">Team</option>
            </FormSelect>
            {formData.imageUrl && (
              <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x200/e8f4fd/0A77B7?text=Invalid+URL' }} />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary !py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <FiLoader className="animate-spin w-4 h-4" /> : null}
                {saving ? 'Saving...' : editingItem ? 'Update' : 'Add Image'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', role: '', quote: '', rating: 5 })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const loadTestimonials = async () => {
    try {
      setLoading(true)
      const data = await testimonialService.getTestimonials()
      if (data.success) setTestimonials(data.testimonials)
      else setError('Failed to load testimonials.')
    } catch {
      setError('Server error loading testimonials.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTestimonials() }, [])

  const openAdd = () => {
    setEditingItem(null)
    setFormData({ name: '', role: '', quote: '', rating: 5 })
    setFormErrors({})
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setFormData({ name: item.name, role: item.role, quote: item.quote, rating: item.rating })
    setFormErrors({})
    setShowModal(true)
  }

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.quote.trim()) errors.quote = 'Review quote is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      const payload = { ...formData, rating: Number(formData.rating) }
      let data
      if (editingItem) {
        data = await testimonialService.updateTestimonial(editingItem._id, payload)
      } else {
        data = await testimonialService.createTestimonial(payload)
      }
      if (data.success) {
        setShowModal(false)
        await loadTestimonials()
      } else {
        alert(data.message || 'Failed to save testimonial.')
      }
    } catch {
      alert('Server error saving testimonial.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try {
      setDeletingId(id)
      const data = await testimonialService.deleteTestimonial(id)
      if (data.success) setTestimonials((prev) => prev.filter((t) => t._id !== id))
    } catch {
      alert('Failed to delete testimonial.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{testimonials.length} testimonials</p>
        <button onClick={openAdd} id="admin-add-testimonial" className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-1.5">
          <FiPlus className="w-4 h-4" /> Add Review
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-bold p-3 bg-red-50 rounded-xl">
          <FiAlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><FiLoader className="animate-spin w-6 h-6 text-primary" /></div>
      ) : testimonials.length === 0 ? (
        <EmptyState icon={FiStar} message="No testimonials found." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {testimonials.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-extrabold text-sm text-darkgray">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {'★'.repeat(t.rating)}<span className="text-xs text-amber-400 font-bold ml-1">{t.rating}/5</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">"{t.quote}"</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => openEdit(t)} className="flex-1 py-1.5 rounded-xl bg-blue-50 text-primary text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors">
                  <FiEdit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(t._id)} disabled={deletingId === t._id} className="flex-1 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-100 transition-colors disabled:opacity-50">
                  {deletingId === t._id ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiTrash2 className="w-3 h-3" />}
                  {deletingId === t._id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Testimonial Modal */}
      {showModal && (
        <Modal title={editingItem ? 'Edit Review' : 'Add Customer Review'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <FormInput id="t-name" label="Customer Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Jane Smith" error={formErrors.name} />
            <FormInput id="t-role" label="Role / Company" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="Office Manager, TechCorp" />
            <FormSelect id="t-rating" label="Star Rating" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
            </FormSelect>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Review Quote *</label>
              <textarea
                rows="3"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="Customer's review..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-darkgray bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none ${formErrors.quote ? 'border-red-400' : 'border-gray-200'}`}
              />
              {formErrors.quote && <p className="text-xs text-red-500 font-bold">{formErrors.quote}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary !py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <FiLoader className="animate-spin w-4 h-4" /> : null}
                {saving ? 'Saving...' : editingItem ? 'Update' : 'Add Review'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const ORDER_STATUSES = [
  'Placed', 'Pending', 'Confirmed', 'Processing', 'Packed',
  'Shipped', 'Out For Delivery', 'Delivered', 'Completed', 'Cancelled',
]

const ORDER_STATUS_BADGE = {
  Placed: 'bg-blue-50 text-blue-600',
  Pending: 'bg-gray-100 text-gray-600',
  Confirmed: 'bg-indigo-50 text-indigo-600',
  Processing: 'bg-violet-50 text-violet-600',
  Packed: 'bg-cyan-50 text-cyan-600',
  Shipped: 'bg-amber-50 text-amber-600',
  'Out For Delivery': 'bg-amber-50 text-amber-600',
  Delivered: 'bg-emerald-50 text-emerald-600',
  Completed: 'bg-emerald-50 text-emerald-600',
  Cancelled: 'bg-red-50 text-red-600',
}

const REFUND_STATUS_BADGE = {
  None: 'bg-gray-100 text-gray-500',
  Initiated: 'bg-amber-50 text-amber-600',
  Completed: 'bg-emerald-50 text-emerald-600',
  Failed: 'bg-red-50 text-red-600',
}

function AdminStatusBadge({ status }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ORDER_STATUS_BADGE[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

function RefundStatusBadge({ status }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${REFUND_STATUS_BADGE[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

const formatDateTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const shortOrderId = (id) => (id ? `#${id.toString().slice(-8).toUpperCase()}` : '—')

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = { page, limit: 10 }
      if (search.trim()) params.search = search.trim()
      if (statusFilter !== 'All') params.status = statusFilter
      if (paymentFilter !== 'All') params.paymentMethod = paymentFilter
      const data = await orderService.getAdminOrders(params)
      if (data.success) {
        setOrders(data.orders)
        setTotal(data.total)
        setTotalPages(data.pages)
      } else {
        setError('Failed to load orders.')
      }
    } catch {
      setError('Server error fetching orders.')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, paymentFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === order.orderStatus) return
    if (newStatus === 'Cancelled') {
      const ok = window.confirm(`Cancel order ${shortOrderId(order._id)}?\n\nStock will be restored and online payments refunded. This cannot be undone.`)
      if (!ok) return
    }
    try {
      setUpdatingId(order._id)
      const data = await orderService.updateOrderStatus(order._id, newStatus)
      if (data.success) {
        await loadOrders()
      } else {
        alert(data.message || 'Failed to update status.')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            id="order-search"
            placeholder="Search by order ID, name, email, phone, city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <select
          id="order-status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="All">All Status</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          id="order-payment-filter"
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="All">All Payments</option>
          <option value="COD">Cash on Delivery</option>
          <option value="Razorpay / Online">Razorpay / Online</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
          <option value="NetBanking">NetBanking</option>
        </select>
        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-bold p-3 bg-red-50 rounded-xl">
          <FiAlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <FiLoader className="animate-spin w-6 h-6 text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={FiShoppingCart} message="No orders found matching your criteria." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">Items</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Payment</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order._id} className="bg-white hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">{shortOrderId(order._id)}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-darkgray">{order.shippingAddress?.fullName}</p>
                    <p className="text-xs text-gray-400">{order.shippingAddress?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 hidden lg:table-cell">
                    {order.products?.reduce((sum, p) => sum + p.quantity, 0) || 0}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-darkgray">{formatINR(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-center text-gray-600 hidden md:table-cell">
                    {order.paymentMethod === 'COD' ? 'COD' : order.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AdminStatusBadge status={order.orderStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        title="View Details"
                        className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary flex items-center justify-center transition-colors"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        disabled={updatingId === order._id}
                        className="text-xs font-bold px-2 py-1.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
                        title="Update status"
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-400">Showing {orders.length} of {total} orders</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-bold">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal title={`Order ${shortOrderId(selectedOrder._id)}`} onClose={() => setSelectedOrder(null)}>
          <OrderDetails order={selectedOrder} />
        </Modal>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANCELLED ORDERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function CancelledOrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refundFilter, setRefundFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const loadCancelled = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setNotice('')
      const params = { page, limit: 10 }
      if (search.trim()) params.search = search.trim()
      if (refundFilter !== 'All') params.refundStatus = refundFilter
      const data = await orderService.getAdminCancelledOrders(params)
      if (data.success) {
        setOrders(data.orders)
        setTotal(data.total)
        setTotalPages(data.pages)
      } else {
        setError('Failed to load cancelled orders.')
      }
    } catch {
      setError('Server error fetching cancelled orders.')
    } finally {
      setLoading(false)
    }
  }, [page, search, refundFilter])

  useEffect(() => {
    loadCancelled()
  }, [loadCancelled])

  const handleRetryRefund = async (orderId) => {
    if (!window.confirm('Retry the refund for this order?')) return
    try {
      setActionLoading(orderId + '-retry')
      setNotice('')
      const data = await orderService.retryRefund(orderId)
      if (data.success) {
        setNotice(data.message || 'Refund retried successfully.')
      } else {
        setNotice(data.message || 'Refund retry failed.')
      }
      await loadCancelled()
    } catch (err) {
      setNotice(err.response?.data?.message || 'Refund retry failed.')
      await loadCancelled()
    } finally {
      setActionLoading('')
    }
  }

  const handleCheckRefund = async (orderId) => {
    try {
      setActionLoading(orderId + '-check')
      setNotice('')
      const data = await orderService.checkRefundStatus(orderId)
      setNotice(data.message || 'Refund status checked.')
      await loadCancelled()
    } catch (err) {
      setNotice(err.response?.data?.message || 'Could not check refund status.')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            id="cancelled-search"
            placeholder="Search by order ID, name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <select
          id="cancelled-refund-filter"
          value={refundFilter}
          onChange={(e) => { setRefundFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-darkgray bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="All">All Refund Status</option>
          <option value="None">No Refund (COD)</option>
          <option value="Initiated">Initiated</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
        </select>
        <button
          onClick={loadCancelled}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 text-primary text-sm font-bold p-3 bg-blue-50 rounded-xl">
          <FiInfo className="w-4 h-4" /> {notice}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-bold p-3 bg-red-50 rounded-xl">
          <FiAlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <FiLoader className="animate-spin w-6 h-6 text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={FiXCircle} message="No cancelled orders found." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Payment</th>
                <th className="px-4 py-3 text-center">Refund Status</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">Refund ID</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Cancelled At</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order._id} className="bg-white hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">{shortOrderId(order._id)}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-darkgray">{order.shippingAddress?.fullName}</p>
                    <p className="text-xs text-gray-400">{order.shippingAddress?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-darkgray">{formatINR(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{order.paymentMethod === 'COD' ? 'COD' : order.paymentMethod}</td>
                  <td className="px-4 py-3 text-center">
                    <RefundStatusBadge status={order.refundStatus || 'None'} />
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-mono text-gray-500 hidden lg:table-cell">
                    {order.refundId || '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500 hidden md:table-cell">
                    {formatDateTime(order.cancelledAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        title="View Details"
                        className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary flex items-center justify-center transition-colors"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      {order.refundStatus === 'Failed' && (
                        <button
                          onClick={() => handleRetryRefund(order._id)}
                          disabled={actionLoading === order._id + '-retry'}
                          title="Retry Refund"
                          className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          {actionLoading === order._id + '-retry'
                            ? <FiLoader className="w-3.5 h-3.5 animate-spin" />
                            : <FiRefreshCw className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {order.refundStatus === 'Initiated' && (
                        <button
                          onClick={() => handleCheckRefund(order._id)}
                          disabled={actionLoading === order._id + '-check'}
                          title="Check Refund Status"
                          className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          {actionLoading === order._id + '-check'
                            ? <FiLoader className="w-3.5 h-3.5 animate-spin" />
                            : <FiClock className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-400">Showing {orders.length} of {total} cancelled orders</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Prev
            </button>
            <span className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-bold">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal title={`Order ${shortOrderId(selectedOrder._id)}`} onClose={() => setSelectedOrder(null)}>
          <OrderDetails order={selectedOrder} />
        </Modal>
      )}
    </div>
  )
}

// ─── Shared Order Details (used by Orders + Cancelled tabs) ───────────────────
function OrderDetails({ order }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {[
          ['Order ID', shortOrderId(order._id)],
          ['Customer', order.shippingAddress?.fullName],
          ['Email', order.shippingAddress?.email],
          ['Phone', order.shippingAddress?.phone],
          ['Placed On', formatDateTime(order.orderDate || order.createdAt)],
          ['Order Status', order.orderStatus],
          ['Payment Method', order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod],
          ['Payment Status', order.paymentStatus],
          ['Refund Status', order.refundStatus || 'None'],
        ].map(([label, val]) => (
          <div key={label}>
            <p className="text-gray-400 font-bold text-xs">{label}</p>
            <p className="text-darkgray font-semibold">{val}</p>
          </div>
        ))}
      </div>

      {order.cancellationReason && (
        <div>
          <p className="text-gray-400 font-bold text-xs">Cancellation Reason</p>
          <p className="text-darkgray bg-gray-50 p-3 rounded-xl text-sm">{order.cancellationReason}</p>
        </div>
      )}

      {order.refundId && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {[
            ['Refund ID', order.refundId],
            ['Refund Amount', formatINR(order.refundAmount)],
            ['Refunded At', formatDateTime(order.refundedAt)],
            ['Refund Attempts', order.refundAttempts || 0],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-gray-400 font-bold text-xs">{label}</p>
              <p className="text-darkgray font-semibold">{val}</p>
            </div>
          ))}
          {order.refundErrorMessage && (
            <div className="col-span-2">
              <p className="text-gray-400 font-bold text-xs">Refund Error</p>
              <p className="text-red-600 bg-red-50 p-3 rounded-xl text-sm">{order.refundErrorMessage}</p>
            </div>
          )}
        </div>
      )}

      <div>
        <p className="text-gray-400 font-bold text-xs mb-1">Shipping Address</p>
        <p className="text-darkgray bg-gray-50 p-3 rounded-xl leading-relaxed">
          {order.shippingAddress?.addressLine1}
          {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
          <br />
          {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
        </p>
      </div>

      <div>
        <p className="text-gray-400 font-bold text-xs mb-1">Products ({order.products?.length || 0})</p>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl p-3 max-h-48 overflow-y-auto">
          {order.products?.map((item, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img src={item.image} alt={item.name} className="w-8 h-8 object-contain rounded-lg bg-[#F8FBFD] p-0.5" loading="lazy"
                  onError={(e) => { e.target.src = 'https://placehold.co/200x200/e8f4fd/0B4F6C?text=Water' }} />
                <span className="font-bold text-darkgray">{item.name} × {item.quantity}</span>
              </div>
              <span className="font-extrabold text-darkgray">{formatINR(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between border-t border-gray-100 pt-3">
        <span className="font-extrabold text-darkgray">Total Amount</span>
        <span className="font-black text-primary text-base">{formatINR(order.totalAmount)}</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PAGE CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { key: 'dashboard',    label: 'Dashboard',    icon: FiGrid },
  { key: 'orders',       label: 'Orders',       icon: FiShoppingCart },
  { key: 'cancelled',    label: 'Cancelled',    icon: FiXCircle },
  { key: 'enquiries',   label: 'Enquiries',    icon: FiMessageSquare },
  { key: 'products',    label: 'Products',     icon: FiPackage },
  { key: 'gallery',     label: 'Gallery',      icon: FiImage },
  { key: 'testimonials',label: 'Testimonials', icon: FiStar },
]

function AdminPage() {
  const { user } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    document.title = 'Admin Panel — AquaPure'
  }, [])

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container-app section-padding">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-darkgray">Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Welcome back, <span className="font-bold text-primary">{user?.fullname || user?.name || 'Admin'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-2 rounded-xl shadow-sm text-xs font-bold text-emerald-600">
            <FiBarChart2 className="w-4 h-4" /> AquaPure Control Center
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              id={`admin-tab-${key}`}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === key
                  ? 'bg-primary text-white shadow-brand-sm'
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-card min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'dashboard'    && <DashboardTab />}
              {activeTab === 'orders'       && <OrdersTab />}
              {activeTab === 'cancelled'    && <CancelledOrdersTab />}
              {activeTab === 'enquiries'   && <EnquiriesTab />}
              {activeTab === 'products'    && <ProductsTab />}
              {activeTab === 'gallery'     && <GalleryTab />}
              {activeTab === 'testimonials'&& <TestimonialsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
