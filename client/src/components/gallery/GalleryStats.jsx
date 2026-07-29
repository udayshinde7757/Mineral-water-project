import { motion } from 'framer-motion'
import { FiUsers, FiActivity, FiCheckCircle, FiTruck } from 'react-icons/fi'
import { GALLERY_STATS } from '@data/galleryData'

const ICON_MAP = {
  FiUsers: FiUsers,
  FiActivity: FiActivity,
  FiCheckCircle: FiCheckCircle,
  FiTruck: FiTruck,
}

function GalleryStats() {
  return (
    <section className="relative -mt-6 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {GALLERY_STATS.map((stat, index) => {
          const IconComponent = ICON_MAP[stat.iconName] || FiCheckCircle

          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="flex flex-col justify-between h-full p-6 bg-white/90 backdrop-blur-md rounded-xl border border-primary-50 shadow-card hover:shadow-brand-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-teal-50 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-teal group-hover:text-white transition-all duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold tracking-wider text-primary/70 uppercase bg-lightblue px-2.5 py-1 rounded-full group-hover:bg-primary-100 transition-colors">
                  Verified
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-darkgray tracking-tight mb-1 group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                <div className="text-base font-bold text-darkgray mb-1">
                  {stat.label}
                </div>
                <p className="text-xs text-darkgray-lighter font-normal leading-relaxed">
                  {stat.subtext}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default GalleryStats
