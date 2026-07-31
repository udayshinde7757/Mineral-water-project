import { FiDroplet, FiTruck, FiShield, FiAward } from 'react-icons/fi'

const deliveryItems = [
  {
    icon: FiDroplet,
    title: 'Fresh Mineral Water',
    desc: 'Sourced from protected natural springs, bottled at source for purity.',
    color: 'text-blue-500 bg-blue-50',
  },
  {
    icon: FiTruck,
    title: 'Fast Home Delivery',
    desc: 'Free delivery on orders above ₹499. Delivered within 2-3 business days.',
    color: 'text-emerald-500 bg-emerald-50',
  },
  {
    icon: FiShield,
    title: 'Secure Payment',
    desc: '100% secure checkout with encrypted payment gateway.',
    color: 'text-purple-500 bg-purple-50',
  },
  {
    icon: FiAward,
    title: 'Quality Assured',
    desc: 'ISI certified, FSSAI approved. Every batch lab-tested for purity.',
    color: 'text-amber-500 bg-amber-50',
  },
]

function DeliveryInfo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {deliveryItems.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow duration-300"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-heading">{item.title}</h4>
            <p className="text-xs text-body leading-relaxed">{item.desc}</p>
          </div>
        )
      })}
    </div>
  )
}

export default DeliveryInfo
