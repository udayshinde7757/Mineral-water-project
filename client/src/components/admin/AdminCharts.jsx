import { useState } from 'react'

/**
 * Modern SVG Bar Chart Component for Monthly Sales & Revenue Growth
 */
export function SalesBarChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">No sales data available</div>
  }

  const maxVal = Math.max(...data.map((d) => d.revenue || 0), 1000)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600" />
            <span className="text-slate-600 dark:text-slate-300">Revenue (₹)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-500" />
            <span className="text-slate-600 dark:text-slate-300">Orders Count</span>
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 px-2 border-b border-slate-200 dark:border-slate-800 relative">
        {data.map((item, idx) => {
          const heightPercent = Math.max(Math.round((item.revenue / maxVal) * 100), 8)
          const isHovered = hoveredIdx === idx

          return (
            <div
              key={item.month || idx}
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-20 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-xl flex flex-col items-center whitespace-nowrap animate-in fade-in zoom-in duration-150">
                  <span>₹{item.revenue?.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-cyan-400">{item.orders} Orders</span>
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full max-w-[42px] rounded-t-2xl transition-all duration-300 ${
                  isHovered
                    ? 'bg-gradient-to-t from-cyan-600 to-blue-500 scale-105 shadow-lg shadow-cyan-500/30'
                    : 'bg-gradient-to-t from-cyan-500/90 to-blue-600/90'
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-2 truncate">
                {item.month}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Modern Donut Chart Component for Order Status & Payment Method Distribution
 */
export function DistributionDonutChart({ data = [], title = 'Distribution' }) {
  if (!data || data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-slate-400 text-xs font-semibold">No data available</div>
  }

  const colors = [
    '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#64748b'
  ]

  const total = data.reduce((acc, curr) => acc + (curr.count || curr.total || 0), 0)
  let cumulativePercent = 0

  const slices = data.map((item, idx) => {
    const val = item.count || item.total || 0
    const percent = total > 0 ? val / total : 0
    const startAngle = cumulativePercent * 360
    cumulativePercent += percent
    const endAngle = cumulativePercent * 360
    return {
      label: item._id || `Category ${idx + 1}`,
      value: val,
      percent: Math.round(percent * 100),
      color: colors[idx % colors.length],
      startAngle,
      endAngle,
    }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
      {/* SVG Donut */}
      <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {slices.map((slice, idx) => {
            const strokeDasharray = `${slice.percent * 2.83} 283`
            const strokeDashoffset = -slices.slice(0, idx).reduce((acc, s) => acc + s.percent * 2.83, 0)
            return (
              <circle
                key={slice.label}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={slice.color}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
              />
            )
          })}
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-slate-800 dark:text-white">{total}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 flex-1 w-full">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 truncate">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-slate-600 dark:text-slate-300 truncate">{slice.label}</span>
            </div>
            <span className="text-slate-800 dark:text-slate-100 font-extrabold ml-2">
              {slice.value} <span className="text-[10px] text-slate-400 font-normal">({slice.percent}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Horizontal Bar Chart for Top Selling Products Ranking
 */
export function TopProductsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-slate-400 text-xs font-semibold">No product sales logged yet</div>
  }

  const maxQty = Math.max(...data.map((d) => d.totalQuantity || 0), 1)

  return (
    <div className="space-y-3.5">
      {data.map((prod, idx) => {
        const percent = Math.round((prod.totalQuantity / maxQty) * 100)
        return (
          <div key={prod._id || idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-200 truncate max-w-[220px]">
                {idx + 1}. {prod._id}
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">
                {prod.totalQuantity} units <span className="text-slate-400 text-[10px] font-normal">(₹{prod.totalRevenue?.toLocaleString('en-IN')})</span>
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
