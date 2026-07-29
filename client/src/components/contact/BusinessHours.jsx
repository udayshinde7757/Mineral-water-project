import { motion } from 'framer-motion'
import { FiClock } from 'react-icons/fi'
import { CONTACT_BUSINESS_HOURS } from '@constants/contactPage'

function BusinessHours() {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-primary/10 shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-lightblue text-primary flex items-center justify-center">
          <FiClock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-extrabold text-darkgray">Business Hours</h3>
      </div>
      <ul className="space-y-4">
        {CONTACT_BUSINESS_HOURS.map((row, i) => (
          <motion.li
            key={row.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-gray-100 last:border-0"
          >
            <span className="text-sm font-bold text-darkgray">{row.label}</span>
            <span className="text-sm font-semibold text-primary">{row.hours}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

export default BusinessHours
