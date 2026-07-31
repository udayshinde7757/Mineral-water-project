import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArchive, FiAlertTriangle, FiCheckCircle, FiEdit2, FiRefreshCw, FiPlus } from 'react-icons/fi'
import adminService from '@services/adminService'

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true)

  // Stock update modal state
  const [editingProd, setEditingProd] = useState(null)
  const [stockInput, setStockInput] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const res = await adminService.getInventory()
      if (res.success) {
        setInventory(res.inventory)
      }
    } catch (err) {
      console.error('Error fetching inventory:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = async (e) => {
    e.preventDefault()
    if (!editingProd) return
    setUpdating(true)
    try {
      await adminService.updateStock(editingProd._id, Number(stockInput))
      setEditingProd(null)
      fetchInventory()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-bold">Loading inventory metrics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Inventory Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Monitor stock levels, low-stock warnings, and replenish inventory
          </p>
        </div>
        <button
          onClick={fetchInventory}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"
        >
          <FiRefreshCw className="w-3.5 h-3.5" /> Refresh Inventory
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase">Total Items in Catalog</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{inventory?.totalProducts || 0}</p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-300">
            <FiArchive className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-amber-500 uppercase">Low Stock Alerts (≤10)</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{inventory?.lowStockCount || 0}</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-rose-500 uppercase">Out of Stock Items</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{inventory?.outOfStockCount || 0}</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Stock Level Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Size</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Stock Status</th>
                <th className="py-3 px-3 text-right">Replenish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
              {inventory?.products?.map((prod) => {
                const isOut = prod.stock === 0
                const isLow = prod.stock > 0 && prod.stock <= 10
                return (
                  <tr key={prod._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-3 flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-xl object-cover" />
                      <span className="font-extrabold text-slate-900 dark:text-white">{prod.name}</span>
                    </td>
                    <td className="py-4 px-3 text-slate-500">{prod.size}</td>
                    <td className="py-4 px-3 text-slate-500">{prod.category}</td>
                    <td className="py-4 px-3 font-extrabold text-slate-900 dark:text-white">₹{prod.price}</td>
                    <td className="py-4 px-3 font-mono font-black text-sm text-slate-900 dark:text-white">
                      {prod.stock}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${isOut ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : isLow ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <button
                        onClick={() => {
                          setEditingProd(prod)
                          setStockInput(prod.stock)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 text-white font-extrabold text-xs hover:bg-cyan-600 transition-all shadow-sm"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK STOCK ADJUSTMENT MODAL */}
      {editingProd && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Replenish Stock: {editingProd.name}
            </h3>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400">Stock Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProd(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-extrabold hover:bg-cyan-700"
                >
                  {updating ? 'Saving...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
