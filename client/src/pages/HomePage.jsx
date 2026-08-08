import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import {
  FiDroplet,
  FiShield,
  FiTruck,
  FiStar,
  FiChevronRight,
  FiAward,
  FiUsers,
  FiCheckCircle,
} from 'react-icons/fi'
import ProductCard from '@components/products/ProductCard'
import productService from '@services/productService'

const MotionLink = motion.create(Link)

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

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: 2000, bounce: 0 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, value, motionValue])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest))
    })
  }, [springValue])

  return (
    <span ref={ref}>
      {displayValue.toLocaleString('en-IN')}{suffix}
    </span>
  )
}

// ─── Star Rating ────────────────────────────────────────────────────────────
function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-1" aria-label={`Rated ${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          aria-hidden="true"
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

// ─── Trust Statistics ─────────────────────────────────────────────────────────
const stats = [
  { icon: FiUsers, value: 100000, suffix: '+', label: 'Happy Households' },
  { icon: FiAward, value: 15, suffix: ' Years', label: 'Of Pure Excellence' },
  { icon: FiShield, value: 100, suffix: '%', label: 'Quality Certified' },
  { icon: FiCheckCircle, value: 5, suffix: ' States', label: 'Delivery Coverage' },
]

// ─── HomePage ────────────────────────────────────────────────────────────────
function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'AquaPure — Pure Natural Mineral Water | Premium Hydration Delivered'
  }, [])

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
          HERO SECTION — Full-Background Image
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        aria-label="Hero — AquaPure premium mineral water"
        className="relative flex items-center min-h-screen overflow-hidden"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/mountainview.png)',
            backgroundPosition: '60% center',
          }}
          aria-hidden="true"
        />

        {/* Gradient overlay — left-to-right for text readability, keeps right side visible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(10, 37, 64, 0.88) 0%, rgba(10, 37, 64, 0.72) 30%, rgba(10, 37, 64, 0.30) 55%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        {/* Top edge gradient for navbar blend */}
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(10, 37, 64, 0.40), transparent)',
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="container-app w-full relative z-10 py-28 md:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Eyebrow */}
              <motion.p
                variants={fadeUp}
                className="text-sm font-semibold tracking-[0.25em] uppercase mb-5"
                style={{ color: '#7DDAFB', fontFamily: 'var(--font-sans)' }}
              >
                Premium Natural Mineral Water
              </motion.p>

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                Pure Water,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7DDAFB] to-[#22D3EE]">
                  Perfect Life
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeUp}
                className="text-base sm:text-lg md:text-xl mt-6 max-w-xl leading-relaxed"
                style={{ color: 'rgba(255, 255, 255, 0.80)', lineHeight: '1.7' }}
              >
                Sourced from nature's finest springs and bottled with care.
                AquaPure brings you the crisp, refreshing taste of pure mineral
                water every single day.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 mt-10"
              >
                <MotionLink
                  to="/products"
                  className="btn-primary !px-10 !py-3.5 !text-sm sm:!text-base shadow-lg shadow-[#0F4C81]/30"
                  whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(15, 76, 129, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Shop Now
                </MotionLink>
                <MotionLink
                  to="/about"
                  className="!inline-flex !items-center !justify-center !gap-2 !font-semibold !px-10 !py-3.5 !rounded-xl !transition-all !duration-300 !ease-out !text-sm sm:!text-base !border-2 !border-white/80 !text-white hover:!bg-white/10"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </MotionLink>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-x-6 gap-y-2 mt-10"
              >
                {['ISO Certified', 'BPA Free', 'Free Delivery'].map((tag) => (
                  <div key={tag} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                    <FiCheckCircle className="w-3.5 h-3.5" style={{ color: '#7DDAFB' }} aria-hidden="true" />
                    {tag}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TRUST STATISTICS SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12" style={{ backgroundColor: '#0F4C81' }} aria-label="AquaPure by the numbers">
        <div className="container-app">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center space-y-2"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: easeOut, delay: i * 0.1 }}
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs sm:text-sm font-medium text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHY AQUAPURE — Features
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ backgroundColor: '#EEF6FB' }} aria-labelledby="features-heading">
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
            <motion.h2 id="features-heading" variants={fadeUp} className="section-title">
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
                  <feature.Icon className="w-7 h-7" style={{ color: '#0F4C81' }} aria-hidden="true" />
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
      <section className="section-padding" style={{ backgroundColor: '#F8FBFD' }} aria-labelledby="products-heading">
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
              <motion.h2 id="products-heading" variants={fadeUp} className="section-title">
                Best Selling Products
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 hover:underline underline-offset-4"
                style={{ color: '#0F4C81' }}
              >
                View All Products
                <FiChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Loading products...">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-gray-100/80 h-96 animate-pulse"
                  aria-hidden="true"
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
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <FiDroplet className="w-8 h-8" style={{ color: '#0F4C81' }} aria-hidden="true" />
              </div>
              <p className="font-semibold" style={{ color: '#102A43' }}>Products coming soon</p>
              <p className="text-sm" style={{ color: '#7B8794' }}>
                We're stocking up. Check back shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="section-padding" style={{ backgroundColor: '#EEF6FB' }} aria-labelledby="testimonials-heading">
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
            <motion.h2 id="testimonials-heading" variants={fadeUp} className="section-title">
              What Our Customers Say
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Yash Thale',
                role: 'Regular Customer',
                text: 'AquaPure has completely changed how I think about drinking water. The taste is incredibly fresh and clean — I can tell the difference immediately. Highly recommended!',
                rating: 5,
              },
              {
                name: 'Sairaj Deshmukh',
                role: 'Fitness Enthusiast',
                text: 'As someone who drinks over 3 litres of water daily, quality matters. AquaPure delivers consistently pure water with free home delivery. A game-changer for my hydration.',
                rating: 5,
              },
              {
                name: 'Vidhi Surve',
                role: 'Home Chef',
                text: 'I use AquaPure for all my cooking and beverages. The natural mineral content enhances the flavour of everything I prepare. It is now the only water in my kitchen.',
                rating: 5,
              },
            ].map((t, i) => (
              <motion.article
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
                <blockquote className="text-sm leading-relaxed mt-4 flex-1" style={{ color: '#486581' }}>
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                {/* Author */}
                <footer className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm font-bold" style={{ color: '#0A2540' }}>{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7B8794' }}>{t.role}</p>
                </footer>
              </motion.article>
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
                  >
                    Order Now
                    <FiChevronRight className="w-4 h-4" aria-hidden="true" />
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
