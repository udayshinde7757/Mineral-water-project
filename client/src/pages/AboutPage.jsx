import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiDroplet,
  FiShield,
  FiHeart,
  FiAward,
  FiArrowRight,
  FiCheckCircle,
  FiCheck,
  FiGlobe,
  FiCpu,
  FiTrendingUp,
  FiUsers,
  FiFeather,
  FiZap,
} from 'react-icons/fi'
import { ROUTES } from '@constants/routes'

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

function AboutPage() {
  // Timeline Data
  const milestones = [
    {
      year: '2011',
      title: 'Foundation & Spring Sourcing',
      desc: 'AquaPure was born with a single mission: sourcing pristine mineral water from protected natural mountain aquifers.',
      icon: <FiDroplet className="w-6 h-6 text-primary" />,
    },
    {
      year: '2016',
      title: 'Multi-Stage Purification Tech',
      desc: 'Pioneered advanced 7-stage filtration and UV sterilization while keeping natural electrolytes 100% intact.',
      icon: <FiCpu className="w-6 h-6 text-teal" />,
    },
    {
      year: '2021',
      title: '100,000+ Happy Households',
      desc: 'Expanded doorstep eco-deliveries and introduced 100% recyclable glass and BPA-free smart hydration containers.',
      icon: <FiUsers className="w-6 h-6 text-primary" />,
    },
    {
      year: '2026',
      title: 'Sustainable Hydration Leadership',
      desc: 'Celebrating 15 years of excellence with carbon-neutral logistics, digital smart delivery, and global purity standards.',
      icon: <FiAward className="w-6 h-6 text-teal" />,
    },
  ]

  // Purification Steps Data
  const purificationSteps = [
    {
      step: '01',
      title: 'Deep Source Extraction',
      subtitle: 'Protected Underground Aquifers',
      desc: 'Extracted directly from natural, underground aquifers sheltered beneath layers of protective rock formations, ensuring natural mineral purity from the very start.',
      icon: <FiDroplet className="w-7 h-7 text-primary" />,
      color: 'from-blue-500/10 to-primary/5',
      borderColor: 'border-primary/20',
    },
    {
      step: '02',
      title: 'Multi-Stage Filtration',
      subtitle: 'Microscopic Level Purification',
      desc: 'Passed through dual sand filters, carbon beds, and sub-micron membranes to eliminate all suspended sediment, organic compounds, and micro-impurities.',
      icon: <FiShield className="w-7 h-7 text-teal" />,
      color: 'from-teal/10 to-teal/5',
      borderColor: 'border-teal/20',
    },
    {
      step: '03',
      title: 'Essential Mineral Infusion',
      subtitle: 'Optimal Taste & Health Balance',
      desc: 'Carefully re-balanced with essential minerals—Calcium, Magnesium, and Potassium—to deliver a crisp, refreshingly smooth taste and vital hydration.',
      icon: <FiHeart className="w-7 h-7 text-primary" />,
      color: 'from-blue-500/10 to-primary/5',
      borderColor: 'border-primary/20',
    },
    {
      step: '04',
      title: 'UV Sterilization & Quality Control',
      subtitle: 'Rigorous Batch Testing',
      desc: 'Subjected to double UV radiation disinfection and continuous automated lab testing before being sealed in eco-friendly, sanitized containers.',
      icon: <FiZap className="w-7 h-7 text-teal" />,
      color: 'from-teal/10 to-teal/5',
      borderColor: 'border-teal/20',
    },
  ]

  // Leadership Team Data
  const teamMembers = [
    {
      name: 'Uday Shinde',
      role: 'Founder & CEO',
      bio: 'Visionary entrepreneur with over a decade of leadership in sustainable water management and brand strategy.',
      image: '/images/uday_shinde.png',
      badge: 'Founder',
    },
    {
      name: 'Shreyas Lande',
      role: 'Co-Founder & IT Lead',
      bio: 'Technology pioneer leading AquaPure’s digital transformation, e-commerce platform, and smart supply chain systems.',
      image: '/images/shreyas_lande.png',
      badge: 'Co-Founder',
    },
  ]

  return (
    <div className="bg-white overflow-hidden">
      {/* ─── 1. HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-lightblue/60 via-white to-white overflow-hidden">
        {/* Decorative Ambient Glowing Orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-brand opacity-10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal/10 blur-3xl rounded-full pointer-events-none" />

        <div className="container-app relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6"
          >
            {/* Pill Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lightblue border border-primary/20 text-primary text-xs sm:text-sm font-semibold shadow-brand-sm">
              <FiDroplet className="w-4 h-4 fill-primary" />
              <span>15 Years of Certified Purity & Excellence</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-darkgray tracking-tight leading-[1.15]"
            >
              Pure Water, <span className="text-gradient">Pure Life.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-darkgray-light max-w-2xl mx-auto font-normal leading-relaxed"
            >
              15 years of unwavering commitment to health, eco-sustainability, and unmatched premium hydration for every family.
            </motion.p>

            {/* Call to Action Button */}
            <motion.div variants={fadeInUp} className="pt-4">
              <Link
                to={ROUTES.PRODUCTS}
                className="btn-primary !py-4 !px-8 text-base shadow-brand-md hover:shadow-brand-lg transition-all duration-300 group"
              >
                <span>Explore Our Water Products</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. WHO WE ARE ────────────────────────────────────────────────── */}
      <section className="section-padding bg-white relative">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Image / Visual Composition */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-card border border-gray-100 bg-gradient-to-br from-lightblue to-white p-2">
                <img
                  src="https://img.magnific.com/premium-photo/capped-bottles-with-purified-carbonated-mineral-water-moving-production-line-large-modern_660230-63166.jpg?ga=GA1.1.2137670955.1781590794&semt=ais_test_c&w=740&q=80"
                  alt="Crystal Clear AquaPure Mineral Water"
                  className="w-full h-[400px] sm:h-[480px] object-cover rounded-2xl shadow-inner"
                />
              </div>

              {/* Floating Stat Card Overlay */}
              <div className="absolute -bottom-6 -right-6 sm:right-6 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-card-hover border border-gray-100 max-w-xs hidden sm:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-lightblue flex items-center justify-center text-primary">
                    <FiShield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-extrabold text-darkgray">100%</h4>
                    <p className="text-xs text-gray-500 font-medium">Naturally Sourced & Lab Certified</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Text Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <div>
                <p className="section-label mb-2">Who We Are</p>
                <h2 className="section-title">
                  Nourishing Lives with Nature's Finest Minerals
                </h2>
              </div>

              <p className="text-gray-600 leading-relaxed text-base">
                Founded on the principle that clean hydration is the foundation of human health, <strong className="text-primary font-semibold">AquaPure</strong> has spent 15 years perfecting the balance between pristine natural spring extraction and modern eco-friendly filtration technology.
              </p>

              <p className="text-gray-600 leading-relaxed text-base">
                We believe that water should not just quench your thirst—it should revitalize your body. That's why every drop of AquaPure undergoes stringent quality checks to ensure essential minerals like Calcium, Magnesium, and Potassium are preserved in their ideal ratios.
              </p>

              {/* Key Features Bullet List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  '100% Protected Aquifer Source',
                  'Rigorous 7-Stage Purification',
                  'Balanced Electrolytes & Minerals',
                  'BPA-Free & Eco Packaging',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-lightblue flex items-center justify-center text-primary flex-shrink-0">
                      <FiCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-semibold text-darkgray">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 3. OUR STORY (15 YEARS JOURNEY) ──────────────────────────────── */}
      <section className="section-padding bg-gradient-to-b from-gray-50/70 via-white to-gray-50/70 relative">
        <div className="container-app">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="section-label mb-2">15 Years Journey</p>
            <h2 className="section-title">Our Story of Continuous Evolution</h2>
            <p className="section-subtitle mx-auto">
              From a humble spring sourcing facility to serving over 100,000 households, discover how AquaPure became a household name in premium hydration.
            </p>
          </div>

          {/* Timeline Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="card p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-gradient">{item.year}</span>
                  <div className="w-12 h-12 rounded-2xl bg-lightblue/80 flex items-center justify-center shadow-brand-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-darkgray mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>

                {/* Decorative Top Accent Line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. OUR MISSION & VISION ───────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-lightblue/50 via-white to-white p-8 sm:p-10 rounded-3xl border border-primary/20 shadow-card relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl mb-6 shadow-brand-md">
                <FiDroplet className="w-7 h-7" />
              </div>
              <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">Our Core Purpose</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-darkgray mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                To deliver crystal-clear, mineral-rich hydration that promotes overall wellness while actively safeguarding our planet's water ecosystems through zero-waste packaging and sustainable spring management.
              </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-teal/10 via-white to-white p-8 sm:p-10 rounded-3xl border border-teal/20 shadow-card relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal text-white flex items-center justify-center text-2xl mb-6 shadow-brand-md">
                <FiGlobe className="w-7 h-7" />
              </div>
              <p className="text-xs uppercase tracking-widest text-teal font-bold mb-2">Future Outlook</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-darkgray mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                To become the most trusted, innovative, and eco-conscious mineral water brand globally, setting the standard for pure hydration, tech-enabled supply chains, and environmental stewardship.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 5. WATER PURIFICATION PROCESS ────────────────────────────────── */}
      <section className="section-padding bg-gradient-to-b from-gray-50/80 via-white to-gray-50/80">
        <div className="container-app">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="section-label mb-2">Uncompromising Purity</p>
            <h2 className="section-title">Our 4-Step Water Purification Process</h2>
            <p className="section-subtitle mx-auto">
              How we transform pristine aquifer water into nature’s most refreshing, mineral-balanced drink.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {purificationSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`bg-white rounded-3xl p-8 shadow-card border ${step.borderColor} relative flex flex-col justify-between hover:shadow-card-hover transition-all duration-300 group`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-extrabold tracking-wider uppercase px-3 py-1 rounded-full bg-lightblue text-primary">
                      Step {step.step}
                    </span>
                    <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-lightblue transition-colors">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-darkgray mb-1 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-teal mb-4">
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-primary">
                  <FiCheckCircle className="w-4 h-4 text-teal" />
                  <span>Quality Verified Stage</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. TEAM SECTION ──────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
  <div className="container-app">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <p className="section-label mb-2">Leadership & Visionaries</p>
      <h2 className="section-title">Meet the People Behind AquaPure</h2>
      <p className="section-subtitle mx-auto">
        Driven by passion for health, technology innovation, and environmental sustainability.
      </p>
    </div>

    {/* Changed lg:grid-cols-4 to lg:grid-cols-2 and constrained max-w-4xl mx-auto */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 justify-center max-w-4xl mx-auto">
      {teamMembers.map((member, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.12 }}
          className="bg-white rounded-3xl overflow-hidden shadow-card border border-gray-100 group hover:shadow-card-hover transition-all duration-300 max-w-sm mx-auto w-full"
        >
          {/* Member Avatar */}
          <div className="relative h-64 overflow-hidden bg-gray-50 flex items-center justify-center">
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
              {member.badge}
            </div>
          </div>

          {/* Member Details */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-darkgray group-hover:text-primary transition-colors">
              {member.name}
            </h3>
            <p className="text-xs font-semibold text-teal mb-3">
              {member.role}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {member.bio}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>

      {/* ─── 7. CALL TO ACTION BANNER ──────────────────────────────────────── */}
      <section className="py-16 bg-gradient-brand text-white relative overflow-hidden">
        <div className="container-app relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Experience Pure Hydration Today
          </h2>
          <p className="text-white/80 text-base sm:text-lg">
            Join over 100,000 satisfied households enjoying crisp, mineral-rich water delivered directly to their doorstep.
          </p>
          <div>
            <Link
              to={ROUTES.PRODUCTS}
              className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-full shadow-lg hover:bg-lightblue hover:scale-105 transition-all duration-300"
            >
              <span>Order AquaPure Now</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
