import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiBox, FiTag, FiDollarSign, FiPercent, FiX, FiCheck, FiRefreshCw
} from 'react-icons/fi'
import adminService from '@services/adminService'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    size: '1 Litre',
    price: '',
    originalPrice: '',
    discountPercent: 0,
    category: 'Personal',
    stock: 50,
    description: '',
    image: '',
    imagesStr: '',
    isFeatured: false,
    isOffer: false,
    offerText: '',
    isVisible: true,
  })

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await adminService.getProducts({ search, category })
      if (res.success) {
        setProducts(res.products)
      }
    } catch (err) {
      console.error('Error fetching products:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      size: '1 Litre',
      price: '',
      originalPrice: '',
      discountPercent: 0,
      category: 'Personal',
      stock: 50,
      description: '',
      image: '',
      imagesStr: '',
      isFeatured: false,
      isOffer: false,
      offerText: '',
      isVisible: true,
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod)
    setFormData({
      name: prod.name || '',
      size: prod.size || '1 Litre',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      discountPercent: prod.discountPercent || 0,
      category: prod.category || 'Personal',
      stock: prod.stock || 0,
      description: prod.description || '',
      image: prod.image || '',
      imagesStr: (prod.images || []).join(', '),
      isFeatured: Boolean(prod.isFeatured),
      isOffer: Boolean(prod.isOffer),
      offerText: prod.offerText || '',
      isVisible: prod.isVisible !== undefined ? prod.isVisible : true,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const imagesArray = formData.imagesStr
      ? formData.imagesStr.split(',').map((s) => s.trim()).filter(Boolean)
      : [formData.image]

    const payload = {
      ...formData,
      images: imagesArray.length > 0 ? imagesArray : [formData.image],
    }

    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, payload)
        alert('Product updated successfully!')
      } else {
        await adminService.createProduct(payload)
        alert('Product created successfully!')
      }
      setIsModalOpen(false)
      fetchProducts()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return
    try {
      await adminService.deleteProduct(id)
      fetchProducts()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleToggleVisibility = async (id) => {
    try {
      await adminService.toggleVisibility(id)
      fetchProducts()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleQuickStockUpdate = async (id, newStock) => {
    try {
      await adminService.updateStock(id, newStock)
      fetchProducts()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Manage mineral water products, stock levels, offers, and pricing
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
        >
          <FiPlus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search product by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 text-slate-800 dark:text-slate-100 focus:outline-none transition-all"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 text-slate-800 dark:text-slate-100 focus:outline-none font-bold"
        >
          <option value="All">Category: All</option>
          <option value="Personal">Personal</option>
          <option value="Bulk">Bulk</option>
          <option value="Corporate">Corporate</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Stock Level</th>
                <th className="py-3 px-3">Visibility</th>
                <th className="py-3 px-3">Offer Tag</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">Loading product catalog...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 font-bold">No products found</td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-3 flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white">{prod.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold">{prod.size}</p>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-slate-700 dark:text-slate-300 font-bold">
                      {prod.category}
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-black text-slate-900 dark:text-white">₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{prod.originalPrice}</span>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${prod.stock === 0 ? 'bg-rose-100 text-rose-700' : prod.stock <= 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {prod.stock} in stock
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <button
                        onClick={() => handleToggleVisibility(prod._id)}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                          prod.isVisible !== false
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                        title="Toggle Store Visibility"
                      >
                        {prod.isVisible !== false ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                        <span>{prod.isVisible !== false ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-3">
                      {prod.isOffer ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                          {prod.offerText || 'Offer'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Regular</span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-white transition-all text-slate-700 dark:text-slate-200"
                        title="Edit Product"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id, prod.name)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-all text-slate-700 dark:text-slate-200"
                        title="Delete Product"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 uppercase text-[10px]">Product Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AquaPure 1L Bottle"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 uppercase text-[10px]">Size / Volume</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1 Litre, 20L Can"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-400 uppercase text-[10px]">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 uppercase text-[10px]">Original Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 uppercase text-[10px]">Initial Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 uppercase text-[10px]">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Bulk">Bulk</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 uppercase text-[10px]">Primary Image URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://example.com/water.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px]">Additional Image URLs (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="https://img1.jpg, https://img2.jpg"
                    value={formData.imagesStr}
                    onChange={(e) => setFormData({ ...formData, imagesStr: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px]">Description</label>
                  <textarea
                    rows="3"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>Visible in Store</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-extrabold hover:bg-cyan-700 shadow-md shadow-cyan-600/25"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
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
