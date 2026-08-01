import { FiPackage } from 'react-icons/fi'

function SpecificationsTable({ product }) {
  const specs = [
    { label: 'Brand', value: 'AquaPure' },
    { label: 'Water Type', value: 'Natural Mineral Water' },
    { label: 'Package', value: product.category || 'Premium Bottle' },
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
      <table className="w-full text-left">
        <caption className="sr-only">Product specifications for {product?.name}</caption>
        <tbody>
          {specs.map((spec) => (
            <tr key={spec.label} className="even:bg-gray-50/40">
              <th scope="row" className="text-sm font-semibold text-muted px-6 sm:px-8 py-3.5 w-1/2">
                {spec.label}
              </th>
              <td className="text-sm font-semibold text-heading px-6 sm:px-8 py-3.5">
                {spec.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SpecificationsTable
