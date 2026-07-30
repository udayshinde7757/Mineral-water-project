import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiDroplet, FiCheckCircle } from 'react-icons/fi'
import ContactInfoCards from '@components/contact/ContactInfoCards'
import TeamMemberCards from '@components/contact/TeamMemberCards'
import BusinessHours from '@components/contact/BusinessHours'
import SocialLinks from '@components/contact/SocialLinks'
import ContactForm from '@components/contact/ContactForm'
import MapPlaceholder from '@components/contact/MapPlaceholder'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    document.title = 'Contact AquaPure — Get in Touch'
  }, [])

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-background via-white to-white overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-brand opacity-[0.07] blur-2xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal/[0.08] blur-xl rounded-full pointer-events-none" />

        <div className="container-app relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-primary/20 text-primary text-xs sm:text-sm font-semibold shadow-brand-sm"
            >
              <FiDroplet className="w-4 h-4 fill-primary" />
              <span>We&apos;re Here for You</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-darkgray tracking-tight leading-[1.15]"
            >
              Contact <span className="text-gradient">AquaPure</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-darkgray-light max-w-3xl mx-auto font-normal leading-relaxed"
            >
              We&apos;re here to help. Reach out to us for orders, product inquiries, delivery support, or business
              partnerships.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="section-padding pt-0 bg-white">
        <div className="container-app">
          <ContactInfoCards />
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-gradient-to-b from-background/80 to-white">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="section-label mb-2">Leadership</p>
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle mx-auto">Connect directly with our co-founders for support and partnerships.</p>
          </div>
          <TeamMemberCards />
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="section-padding bg-gradient-to-b from-altSection/30 via-white to-white">
        <div className="container-app max-w-6xl">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-10 sm:p-12 border border-gray-100 shadow-card-hover text-center space-y-5"
              >
                <div className="w-20 h-20 bg-background/80 rounded-full flex items-center justify-center mx-auto">
                  <FiCheckCircle className="w-11 h-11 text-primary" />
                </div>
                <p className="text-lg sm:text-xl text-darkgray font-semibold leading-relaxed">
                  Thank you! Your message has been sent successfully. Our team will contact you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary !px-6 !py-2.5 text-sm"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <p className="section-label">Get in Touch</p>
                  <h2 className="section-title mt-2">Send a Message</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 space-y-6">
                    <BusinessHours />
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-card">
                      <SocialLinks />
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <ContactForm onSuccess={() => setSubmitted(true)} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <MapPlaceholder />
    </div>
  )
}

export default ContactPage
