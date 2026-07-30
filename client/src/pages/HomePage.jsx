import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiDroplet,
  FiShield,
  FiTruck,
  FiStar,
  FiChevronRight,
} from 'react-icons/fi'
import ProductCard from '@components/products/ProductCard'
import productService from '@services/productService'

const MotionLink = motion(Link)

// ─── Easing ───────────────────────────────────────────────────────────────────
const easeOut = [0.22, 1, 0.36, 1]

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const cardReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
}

// ─── Hero Bottle SVG ─────────────────────────────────────────────────────────
function BottleIllustration() {
  return (
    <svg
      viewBox="0 0 240 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-48 sm:w-56 md:w-64 h-auto drop-shadow-xl"
      aria-hidden="true"
    >
      {/* Bottle body */}
      <defs>
        <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F4C81" stopOpacity="0.08" />
          <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0F4C81" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="waterFill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0F4C81" stopOpacity="0.20" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Bottle outline */}
      <path
        d="M100 20 C100 20 95 8 100 4 C105 0 135 0 140 4 C145 8 140 20 140 20
           L142 30 C142 30 155 50 158 80 C161 110 160 130 160 160
           C160 190 158 210 155 240 C152 270 148 290 145 310
           C142 330 140 350 140 370
           C140 380 145 390 150 394
           C155 398 155 400 120 400
           C85 400 85 398 90 394
           C95 390 100 380 100 370
           C100 350 98 330 95 310
           C92 290 88 270 85 240
           C82 210 80 190 80 160
           C80 130 79 110 82 80
           C85 50 98 30 98 30 L100 20 Z"
        fill="url(#bottleGrad)"
        stroke="#0F4C81"
        strokeWidth="1.5"
        strokeOpacity="0.15"
      />

      {/* Water inside */}
      <path
        d="M86 240 C88 210 90 190 92 170
           L148 170 C150 190 152 210 154 240
           C155 280 154 320 152 360
           C150 380 148 390 145 394
           C140 398 100 398 95 394
           C92 390 90 380 88 360
           C86 320 85 280 86 240 Z"
        fill="url(#waterFill)"
      />

      {/* Water ripple line */}
      <path
        d="M86 240 C100 250 120 235 140 245 C150 250 152 245 154 240"
        stroke="#22D3EE"
        strokeWidth="1"
        strokeOpacity="0.5"
        fill="none"
      />

      {/* Shine / highlight */}
      <path
        d="M100 60 L102 320"
        stroke="url(#shine)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />

      {/* Cap */}
      <rect x="95" y="2" width="50" height="18" rx="4" fill="#0F4C81" opacity="0.9" />
      <rect x="98" y="4" width="44" height="4" rx="2" fill="#22D3EE" opacity="0.3" />

      {/* Label */}
      <rect x="92" y="290" width="56" height="60" rx="6" fill="#0F4C81" opacity="0.08" />
      <rect x="98" y="298" width="44" height="3" rx="1.5" fill="#0F4C81" opacity="0.25" />
      <rect x="98" y="306" width="30" height="2" rx="1" fill="#0F4C81" opacity="0.15" />
      <circle cx="120" cy="330" r="8" fill="#22D3EE" opacity="0.2" />
    </svg>
  )
}

// ─── Star Rating ────────────────────────────────────────────────────────────
function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

// ─── HomePage ────────────────────────────────────────────────────────────────
function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts({})
        if (mounted && data.success) {
          setProducts((data.products || []).slice(0, 4))
        }
      } catch {
        // silently fail – products section simply won't render
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchProducts()
    return () => { mounted = false }
  }, [])

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center justify-center min-h-[85vh] overflow-hidden section-padding"
        style={{
          background: 'linear-gradient(170deg, #EEF6FB 0%, #F8FBFD 50%, #ffffff 100%)',
        }}
      >
        <div className="container-app w-full relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text Content */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Eyebrow */}
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold tracking-[0.25em] uppercase mb-5"
                style={{ color: '#22D3EE', fontFamily: 'var(--font-sans)' }}
              >
                Premium Natural Mineral Water
              </motion.p>

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.02em',
                  color: '#0A2540',
                }}
              >
                Pure Water,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F4C81] to-[#22D3EE]">
                  Perfect Life
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeUp}
                className="text-base sm:text-lg md:text-xl mt-5 max-w-xl mx-auto lg:mx-0"
                style={{ color: '#486581', lineHeight: '1.7' }}
              >
                Sourced from nature's finest springs and bottled with care.
                AquaPure brings you the crisp, refreshing taste of pure mineral
                water every single day.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 mt-10 justify-center lg:justify-start"
              >
                <MotionLink
                  to="/products"
                  className="btn-primary !px-10 !py-3.5 !text-sm sm:!text-base shadow-lg shadow-[#0F4C81]/20"
                  whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(15, 76, 129, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Shop Now
                </MotionLink>
                <MotionLink
                  to="/about"
                  className="btn-secondary !px-10 !py-3.5 !text-sm sm:!text-base"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </MotionLink>
              </motion.div>
            </motion.div>

            {/* Bottle Illustration */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: easeOut, delay: 0.3 }}
            >
              <BottleIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHY AQUAPURE — Features
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ backgroundColor: '#EEF6FB' }}>
        <div className="container-app">
          {/* Section Header */}
          <motion.div
            className="text-center mb-14 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.p variants={fadeUp} className="section-label mb-4">
              Why AquaPure
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-title">
              What Makes Us Different
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle mx-auto">
              We believe in purity at every step — from the spring to your glass.
            </motion.p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                Icon: FiDroplet,
                title: '100% Natural Spring Water',
                desc: 'Sourced from protected underground springs, naturally filtered through mineral-rich layers for that pure, crisp taste.',
              },
              {
                Icon: FiShield,
                title: 'Certified Quality',
                desc: 'Every batch undergoes rigorous lab testing and quality certification to ensure the highest purity standards.',
              },
              {
                Icon: FiTruck,
                title: 'Free Home Delivery',
                desc: 'We bring hydration to your doorstep with free delivery on all orders. Fresh water, whenever you need it.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-white rounded-2xl border border-[#0F4C81]/10 p-8 text-center hover:shadow-lg hover:border-[#0F4C81]/20 transition-all duration-300"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: easeOut, delay: 0.1 + i * 0.12 }}
                whileHover={{ y: -4 }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.08), rgba(34, 211, 238, 0.12))',
                  }}
                >
                  <feature.Icon className="w-7 h-7" style={{ color: '#0F4C81' }} />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: '#0A2540', fontFamily: 'var(--font-display)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#486581' }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BEST SELLING PRODUCTS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ backgroundColor: '#F8FBFD' }}>
        <div className="container-app">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <div>
              <motion.p variants={fadeUp} className="section-label mb-3">
                Shop
              </motion.p>
              <motion.h2 variants={fadeUp} className="section-title">
                Best Selling Products
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200"
                style={{ color: '#0F4C81' }}
              >
                View All Products
                <FiChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-gray-100/80 h-96 animate-pulse"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  variants={cardReveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12" style={{ color: '#7B8794' }}>
              Products coming soon.
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ backgroundColor: '#EEF6FB' }}>
        <div className="container-app">
          <motion.div
            className="text-center mb-14 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.p variants={fadeUp} className="section-label mb-4">
              Testimonials
            </motion.p>
            <motion.h2 variants={fadeUp} className="section-title">
              What Our Customers Say
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Priya Sharma',
                role: 'Regular Customer',
                text: 'AquaPure has completely changed how I think about drinking water. The taste is incredibly fresh and clean — I can tell the difference immediately. Highly recommended!',
                rating: 5,
              },
              {
                name: 'Rahul Mehta',
                role: 'Fitness Enthusiast',
                text: 'As someone who drinks over 3 litres of water daily, quality matters. AquaPure delivers consistently pure water with free home delivery. A game-changer for my hydration.',
                rating: 5,
              },
              {
                name: 'Ananya Gupta',
                role: 'Home Chef',
                text: 'I use AquaPure for all my cooking and beverages. The natural mineral content enhances the flavour of everything I prepare. It is now the only water in my kitchen.',
                rating: 4,
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                className="bg-white rounded-2xl border border-[#0F4C81]/10 p-8 flex flex-col h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.1 + i * 0.1 }}
                whileHover={{ y: -3 }}
              >
                {/* Stars */}
                <StarRating rating={t.rating} />
                {/* Quote */}
                <p className="text-sm leading-relaxed mt-4 flex-1" style={{ color: '#486581' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                {/* Author */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm font-bold" style={{ color: '#0A2540' }}>{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7B8794' }}>{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          DELIVERY CTA
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ backgroundColor: '#F8FBFD' }}>
        <motion.div
          className="container-app"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#EEF6FB' }}
          >
            <div className="px-8 py-12 md:py-16 md:px-16 text-center">
              <div className="max-w-2xl mx-auto">
                <motion.p
                  variants={fadeUp}
                  className="section-label mb-4"
                >
                  Free Delivery
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: '#0A2540', fontFamily: 'var(--font-display)' }}
                >
                  Fresh Water, Delivered to Your Doorstep
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  className="text-base mb-8 max-w-lg mx-auto"
                  style={{ color: '#486581' }}
                >
                  Enjoy free home delivery on all orders across the city.
                  We ensure your water arrives fresh, clean, and on time —
                  every single time.
                </motion.p>
                <motion.div variants={fadeUp}>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 btn-primary !px-10 !py-3.5 shadow-lg shadow-[#0F4C81]/20"
                    style={{ textDecoration: 'none' }}
                  >
                    Order Now
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

export default HomePage
