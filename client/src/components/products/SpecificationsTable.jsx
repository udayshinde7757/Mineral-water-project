import { FiPackage } from 'react-icons/fi'

function SpecificationsTable({ product }) {
  const specs = [
    { label: 'Brand', value: 'AquaPure' },
    { label: 'Water Type', value: 'Natural Mineral Water' },
    { label: 'Package', value: 'Premium Bottle' },
    { label: 'Capacity', value: product.size || '—' },
    { label: 'Country of Origin', value: 'India' },
    { label: 'SKU', value: product._id ? product._id.slice(-8).toUpperCase() : '—' },
  ]

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center">
          <FiPackage className="w-4 h-4" />
        </div>
        <h3 className="text-lg font-bold text-heading">Specifications</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="grid grid-cols-2 gap-4 px-6 sm:px-8 py-3.5 even:bg-gray-50/40"
          >
            <span className="text-sm font-semibold text-muted">{spec.label}</span>
            <span className="text-sm font-semibold text-heading">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SpecificationsTable
