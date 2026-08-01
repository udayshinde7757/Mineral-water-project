import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiLinkedin, FiFacebook, FiDroplet, FiArrowRight, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { ROUTES } from '@constants/routes'

const NAV_LINKS = [
  { label: 'Home',       to: ROUTES.HOME },
  { label: 'About Us',   to: ROUTES.ABOUT },
  { label: 'Products',   to: ROUTES.PRODUCTS },
  { label: 'Gallery',    to: ROUTES.GALLERY },
  { label: 'Contact',    to: ROUTES.CONTACT },
  { label: 'Enquiry',    to: ROUTES.ENQUIRY },
]

const SOCIAL_LINKS = [
  { icon: FiFacebook,  href: 'https://www.facebook.com/sopan.lande.1297',  label: 'Visit our Facebook page' },
  { icon: FiInstagram, href: 'https://www.instagram.com/shreyaslande_/?hl=en', label: 'Follow us on Instagram' },
  { icon: FiLinkedin,  href: 'https://www.linkedin.com/in/shreyas-lande-94b973344/', label: 'Connect on LinkedIn' },
  { icon: FaWhatsapp,  href: 'https://wa.me/919356212824',                    label: 'Chat on WhatsApp' },
]

// ─── Policy Modal ─────────────────────────────────────────────────────────────
const POLICIES = {
  privacy: {
    title: 'Privacy Policy',
    content: `
**Last Updated:** August 1, 2026

**1. Information We Collect**
AquaPure collects information you provide when placing orders, creating accounts, or contacting us — including name, email, phone number, and delivery address.

**2. How We Use Your Information**
We use your information solely to fulfill orders, process payments, and communicate about your purchases. We never sell your personal data.

**3. Data Security**
Your data is encrypted in transit (SSL/TLS) and stored securely. Payment information is processed through Razorpay and never stored on our servers.

**4. Cookies**
We use essential cookies for authentication and session management. No tracking or third-party ad cookies are used.

**5. Your Rights**
You may request access, correction, or deletion of your personal data by emailing us at shreyaslande200@gmail.com.

**6. Contact**
For privacy concerns, contact: AquaPure, Government Polytechnic Nagpur, Nagpur, Maharashtra — shreyaslande200@gmail.com
    `.trim(),
  },
  terms: {
    title: 'Terms of Service',
    content: `
**Last Updated:** August 1, 2026

**1. Acceptance**
By using AquaPure's website and services, you agree to these Terms of Service. If you disagree, please discontinue use.

**2. Products & Ordering**
All product prices are in INR and subject to change. Orders are confirmed upon payment processing. We reserve the right to cancel orders due to stock unavailability.

**3. Delivery**
Free delivery is available within our service area (Nagpur and surrounding regions). Delivery times are estimates and not guarantees.

**4. Returns & Refunds**
Unused, unopened products may be returned within 3 days of delivery. Damaged goods will be replaced at no cost.

**5. User Accounts**
You are responsible for maintaining the confidentiality of your account credentials. AquaPure is not liable for unauthorized account access resulting from user negligence.

**6. Limitation of Liability**
AquaPure's liability is limited to the value of the product purchased. We are not liable for indirect or consequential damages.

**7. Governing Law**
These terms are governed by Indian law and disputes are subject to the jurisdiction of Nagpur courts.
    `.trim(),
  },
  refund: {
    title: 'Refund Policy',
    content: `
**Last Updated:** August 1, 2026

**1. Our Commitment**
AquaPure is committed to your satisfaction. If you're not completely happy with your order, we'll make it right.

**2. Eligible Returns**
- Damaged or defective products
- Wrong product delivered
- Products not matching description

**3. Non-Returnable Items**
- Opened or used products (for hygiene reasons)
- Products damaged due to improper storage by customer

**4. Return Process**
Contact us within 3 days of delivery via WhatsApp (+91 9356212824) or email (shreyaslande200@gmail.com) with photo evidence of the issue.

**5. Refund Timeline**
- Online payments (Razorpay): Refunded within 5–7 business days
- Cash on Delivery (COD): Bank transfer within 3–5 business days

**6. Exchange Option**
We offer product exchange as an alternative to refunds in all eligible cases.
    `.trim(),
  },
}

function PolicyModal({ policyKey, onClose }) {
  const policy = POLICIES[policyKey]
  if (!policy) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(10, 37, 64, 0.7)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="policy-modal-title" className="text-xl font-bold" style={{ color: '#102A43', fontFamily: 'var(--font-display)' }}>
            {policy.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Close policy modal"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4 text-sm text-gray-600 leading-relaxed" style={{ scrollbarWidth: 'thin' }}>
          {policy.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('**') && paragraph.includes('**\n') === false) {
              // It's a bold header paragraph like **Section Title**
              const parts = paragraph.split(/\*\*(.*?)\*\*/g)
              return (
                <p key={i}>
                  {parts.map((part, j) =>
                    j % 2 === 1 ? <strong key={j} className="text-gray-900 font-bold">{part}</strong> : part
                  )}
                </p>
              )
            }
            return <p key={i}>{paragraph}</p>
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary !py-2.5 !px-6 !text-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  const [openPolicy, setOpenPolicy] = useState(null)

  return (
    <>
      {/* Policy Modal */}
      <AnimatePresence>
        {openPolicy && (
          <PolicyModal
            policyKey={openPolicy}
            onClose={() => setOpenPolicy(null)}
          />
        )}
      </AnimatePresence>

      <footer className="bg-[#0A2540] text-white" aria-label="Site footer">
        {/* CTA Banner */}
        <div className="bg-[#0F4C81] px-4 py-10">
          <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Ready to Order?</h2>
              <p className="text-white/80 text-sm mt-1">Get premium mineral water delivered to your door or office.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                to={ROUTES.ENQUIRY}
                className="inline-flex items-center gap-2 bg-white text-primary font-extrabold px-6 py-3 rounded-full text-sm hover:bg-lightblue transition-colors shadow"
              >
                Submit Enquiry <FiArrowRight aria-hidden="true" />
              </Link>
              <a
                href="https://wa.me/919356212824?text=Hi%20AquaPure!%20I'd%20like%20to%20place%20a%20bulk%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-extrabold px-6 py-3 rounded-full text-sm hover:bg-[#20ba59] transition-colors shadow"
                aria-label="Chat with AquaPure on WhatsApp for bulk orders"
              >
                <FaWhatsapp className="w-5 h-5" aria-hidden="true" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container-app py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-1">
            <Link to={ROUTES.HOME} className="flex items-center gap-2" aria-label="AquaPure — Go to homepage">
              <div className="w-9 h-9 bg-[#0F4C81] rounded-xl flex items-center justify-center">
                <FiDroplet className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-extrabold text-white">AquaPure</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              India's leading mineral water brand delivering pure, natural hydration since 2011. From source to bottle, purity guaranteed.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 pt-1" aria-label="Social media links">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#0F4C81] flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg"
                >
                  <Icon className="w-4 h-4 text-white/70 hover:text-white" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">Quick Links</h3>
              <ul className="space-y-2.5">
                {NAV_LINKS.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-white/60 hover:text-white text-sm transition-all duration-300 flex items-center gap-1.5 group hover:translate-x-1"
                    >
                      <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Products Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">Our Products</h3>
            <ul className="space-y-2.5">
              {['250ml Bottle', '500ml Bottle', '1L Bottle', '2L Family Pack', '5L Bulk Jug', '20L Refill Jar'].map((item) => (
                <li key={item}>
                  <Link
                    to={ROUTES.PRODUCTS}
                    className="text-white/60 hover:text-white text-sm transition-all duration-300 flex items-center gap-1.5 group hover:translate-x-1"
                  >
                    <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0" aria-hidden="true" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">Contact Us</h3>
            <address className="not-italic">
              <ul className="space-y-3">
                <li>
                  <a
                    href="tel:+919356212824"
                    className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-all duration-300 hover:translate-x-1"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiPhone className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs mb-0.5">Phone</p>
                      +91 9356212824 / +91 7757841157
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:shreyaslande200@gmail.com"
                    className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-all duration-300 hover:translate-x-1"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiMail className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs mb-0.5">Email</p>
                      shreyaslande200@gmail.com
                    </div>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/60">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiMapPin className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xs mb-0.5">Address</p>
                    Nagpur, Maharashtra, India
                  </div>
                </li>
              </ul>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-5">
          <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <p>© {year} AquaPure Mineral Water Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-5">
              <button
                type="button"
                onClick={() => setOpenPolicy('privacy')}
                className="hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setOpenPolicy('terms')}
                className="hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setOpenPolicy('refund')}
                className="hover:text-white transition-colors underline-offset-2 hover:underline cursor-pointer"
              >
                Refund Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
