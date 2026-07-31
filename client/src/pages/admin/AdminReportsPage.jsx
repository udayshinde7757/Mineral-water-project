import { useState } from 'react'
import { FiFileText, FiDownload, FiPrinter, FiDatabase } from 'react-icons/fi'
import adminService from '@services/adminService'

export default function AdminReportsPage() {
  const [generating, setGenerating] = useState('')

  const reportTypes = [
    {
      id: 'orders',
      title: 'Orders Report',
      description: 'Complete export of all customer orders with status, payment, and shipping details',
      icon: FiFileText,
      color: 'cyan',
    },
    {
      id: 'products',
      title: 'Products Report',
      description: 'Full product catalog with pricing, stock levels, categories, and ratings',
      icon: FiDatabase,
      color: 'indigo',
    },
    {
      id: 'customers',
      title: 'Customers Report',
      description: 'Registered customer accounts with contact details, status, and join dates',
      icon: FiDatabase,
      color: 'emerald',
    },
  ]

  const colorStyles = {
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    indigo: 'from-indigo-500/10 to-violet-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  }

  const handleDownloadCSV = async (type) => {
    setGenerating(type)
    try {
      const url = adminService.exportDataUrl(type)
      const token = localStorage.getItem('token')

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Failed to generate report')

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `aquapure_${type}_report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      alert(err.message || 'Failed to generate report')
    } finally {
      setGenerating('')
    }
  }

  const handlePrintReport = (type) => {
    handleDownloadCSV(type)
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Reports & Data Export</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
          Generate and download business reports in CSV format for offline analysis
        </p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const style = colorStyles[report.color]
          const isGenerating = generating === report.id

          return (
            <div
              key={report.id}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${style}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{report.title}</h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {report.description}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleDownloadCSV(report.id)}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  {isGenerating ? 'Generating...' : 'Download CSV'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Note */}
      <div className="p-5 rounded-3xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-900/60">
        <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
          💡 Reports are generated on-demand from your live MongoDB database. CSV files can be opened in Microsoft Excel, Google Sheets, or any spreadsheet application for further analysis.
        </p>
      </div>
    </div>
  )
}
