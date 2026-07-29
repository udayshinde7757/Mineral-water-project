import { motion } from 'framer-motion'
import { FiMapPin } from 'react-icons/fi'
import { CONTACT_MAP_EMBED_URL, CONTACT_MAP_LOCATION_LABEL } from '@constants/contactPage'

function MapPlaceholder() {
  return (
    <section className="section-padding bg-gradient-to-b from-white to-lightblue/30">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <p className="section-label mb-2">Find Us</p>
          <h2 className="section-title flex items-center justify-center gap-2">
            <FiMapPin className="w-8 h-8 text-primary" />
            Our Location
          </h2>
          <p className="section-subtitle mx-auto mt-3">
            Government Polytechnic Nagpur, Nagpur, Maharashtra, India
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-card bg-gray-100"
        >
          <iframe
            title="AquaPure location — Government Polytechnic Nagpur"
            src={CONTACT_MAP_EMBED_URL}
            className="w-full h-72 sm:h-96 border-0 grayscale-[30%] hover:grayscale-0 transition-all duration-500"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 border border-gray-100 shadow-card text-sm text-gray-600">
            <span className="font-bold text-darkgray">Our Location</span> — {CONTACT_MAP_LOCATION_LABEL}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default MapPlaceholder
