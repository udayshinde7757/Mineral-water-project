import { motion } from 'framer-motion'
import {
  FiDroplet,
  FiFilter,
  FiShield,
  FiCpu,
  FiBox,
  FiTruck,
  FiArrowRight,
} from 'react-icons/fi'
import { PROCESS_TIMELINE } from '@data/galleryData'

const ICON_MAP = {
  FiDroplet: FiDroplet,
  FiFilter: FiFilter,
  FiShieldCheck: FiShield,
  FiCpu: FiCpu,
  FiBox: FiBox,
  FiTruck: FiTruck,
}

function ProcessTimeline() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-blue-50/40 to-white relative overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200/60 uppercase tracking-wider">
            OPERATIONAL EXCELLENCE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-4 mb-3">
            Company Manufacturing Lifecycle
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            From protected natural mountain springs to your doorstep — how AquaPure guarantees 100% purity across every single stage.
          </p>
        </div>

        {/* Timeline Grid / Row */}
        <div className="relative">
          {/* Connecting Line across desktop screens */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-teal-300 to-primary-400 -translate-y-12 z-0 rounded-full opacity-60" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
            {PROCESS_TIMELINE.map((item, idx) => {
              const IconComponent = ICON_MAP[item.iconName] || FiDroplet

              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="flex flex-col justify-between p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-100 shadow-card hover:shadow-brand-md transition-all duration-300 group"
                >
                  <div>
                    {/* Header Step & Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-primary-700 font-extrabold text-xs flex items-center justify-center border border-primary-100">
                        {item.step}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-teal-600 mb-2">
                      {item.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Flow Arrow indicator (visible on desktop between items except last) */}
                  {idx < PROCESS_TIMELINE.length - 1 && (
                    <div className="hidden lg:flex items-center justify-end mt-3 text-primary-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all">
                      <FiArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProcessTimeline
