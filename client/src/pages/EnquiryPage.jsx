import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiDroplet,
  FiPhone,
  FiMail,
  FiPackage,
  FiMessageSquare,
  FiArrowRight
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import enquiryService from '@services/enquiryService'
import productService from '@services/productService'
import { ROUTES } from '@constants/routes'

function EnquiryPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Parse pre-filled productId from URL query params
  const queryParams = new URLSearchParams(location.search)
  const prefilledProductId = queryParams.get('productId') || ''

  // SEO Page Title
  useEffect(() => {
    document.title = 'Submit Bulk Enquiry — AquaPure Mineral Water'
  }, [])

  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    productId: prefilledProductId,
    quantity: 1,
    message: '',
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState('')

  // Load products for dropdown
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getProducts()
        if (data.success) {
          setProducts(data.products)
        }
      } catch (err) {
        console.error('Failed to load products for enquiry:', err)
      }
    }
    loadProducts()
  }, [])

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Full name is required'

    if (!formData.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^[0-9+\s-]{10,14}$/.test(formData.phone.replace(/[^0-9]/g, '').padStart(10, '0'))) {
      errors.phone = 'Please enter a valid phone number (min 10 digits)'
    }

    if (!formData.quantity || formData.quantity < 1) {
      errors.quantity = 'Quantity must be at least 1'
    }

    if (!formData.message.trim()) {
      errors.message = 'Please describe your requirement'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, parseInt(value, 10) || 1) : value,
    }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validate()) return

    try {
      setLoading(true)
      const payload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        productId: formData.productId || undefined,
        quantity: formData.quantity,
        message: formData.message.trim(),
      }
      const data = await enquiryService.submitEnquiry(payload)
      if (data.success) {
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setApiError(data.message || 'Failed to submit enquiry. Please try again.')
      }
    } catch (err) {
      console.error('Enquiry Submit Error:', err)
      setApiError('Connection error. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppEnquiry = () => {
    const selectedProduct = products.find((p) => p._id === formData.productId)
    const productName = selectedProduct ? selectedProduct.name : 'General Enquiry'
    const msg = `Hi AquaPure! I'm interested in placing a bulk order.\n\nCustomer Name: ${formData.name || 'N/A'}\nProduct: ${productName}\nQuantity: ${formData.quantity}\nMessage: ${formData.message || 'Please contact me with pricing details.'}`
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // ─── SUCCESS STATE ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 sm:p-14 max-w-lg w-full shadow-2xl border border-gray-100 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="w-11 h-11 text-emerald-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-darkgray">
            Enquiry Submitted Successfully!
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Thank you for reaching out to <strong>AquaPure</strong>. Your enquiry has been saved in our database. A confirmation email has been sent to your inbox, and our team will contact you within 24 business hours.
          </p>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-2 text-left text-sm">
            <p className="font-bold text-emerald-900">What happens next?</p>
            <p className="flex items-start gap-2 text-emerald-700">
              <FiCheckCircle className="flex-shrink-0 mt-0.5" /> Confirmation email dispatched to your inbox
            </p>
            <p className="flex items-start gap-2 text-emerald-700">
              <FiCheckCircle className="flex-shrink-0 mt-0.5" /> Manager reviews your product requirement
            </p>
            <p className="flex items-start gap-2 text-emerald-700">
              <FiCheckCircle className="flex-shrink-0 mt-0.5" /> You get a customised quote within 24 hours
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              Back to Home <FiArrowRight />
            </button>
            <button
              onClick={handleWhatsAppEnquiry}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-6 rounded-full shadow transition-all text-sm"
            >
              <FaWhatsapp className="w-5 h-5" /> Chat on WhatsApp
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── FORM STATE ────────────────────────────────────────────────────────────
  return (
    <div className="section-padding bg-gradient-to-b from-lightblue/20 via-white to-white min-h-screen">
      <div className="container-app max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <p className="section-label">Bulk & Corporate Hydration</p>
          <h1 className="section-title">Submit a Product Enquiry</h1>
          <p className="section-subtitle mx-auto">
            Fill in your details and we'll get back to you with a personalised pricing quote within 24 business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Info Panel */}
          <div className="lg:col-span-4 space-y-5">
            {/* Why enquire box */}
            <div className="bg-gradient-brand text-white p-6 rounded-3xl shadow-brand-md space-y-4">
              <h3 className="text-lg font-extrabold">Why Submit an Enquiry?</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  'Get personalised bulk pricing quotes',
                  'Custom delivery schedule & routes',
                  'Corporate subscription plans available',
                  'Priority support & dedicated manager',
                  'Flexible payment terms for business',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <FiCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal" />
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* WhatsApp Quick Contact */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
              <h3 className="text-base font-extrabold text-darkgray">Prefer Direct Contact?</h3>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 text-sm font-bold text-darkgray hover:text-primary transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-lightblue text-primary flex items-center justify-center">
                  <FiPhone className="w-4 h-4" />
                </div>
                +91 98765 43210
              </a>
              <a
                href="mailto:hello@aquapure.in"
                className="flex items-center gap-3 text-sm font-bold text-darkgray hover:text-primary transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-lightblue text-primary flex items-center justify-center">
                  <FiMail className="w-4 h-4" />
                </div>
                hello@aquapure.in
              </a>
              <button
                type="button"
                onClick={handleWhatsAppEnquiry}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20ba59] font-bold py-3 rounded-2xl text-sm shadow transition-all"
              >
                <FaWhatsapp className="w-5 h-5" />
                WhatsApp Now
              </button>
            </div>
          </div>

          {/* Right: Enquiry Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card">
              <h3 className="text-xl font-extrabold text-darkgray mb-6 flex items-center gap-2">
                <FiMessageSquare className="text-primary" /> Enquiry Form
              </h3>

              {apiError && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-2xl border border-red-100 flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="enq-name" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="enq-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all ${
                        validationErrors.name ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {validationErrors.name && (
                      <p className="text-xs text-red-500 font-bold">{validationErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="enq-email" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="enq-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all ${
                        validationErrors.email ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="text-xs text-red-500 font-bold">{validationErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone & Quantity Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="enq-phone" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="enq-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all ${
                        validationErrors.phone ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {validationErrors.phone && (
                      <p className="text-xs text-red-500 font-bold">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="enq-quantity" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Quantity Required *
                    </label>
                    <input
                      type="number"
                      id="enq-quantity"
                      name="quantity"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all ${
                        validationErrors.quantity ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {validationErrors.quantity && (
                      <p className="text-xs text-red-500 font-bold">{validationErrors.quantity}</p>
                    )}
                  </div>
                </div>

                {/* Product Dropdown */}
                <div className="space-y-1">
                  <label htmlFor="enq-product" className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <FiPackage className="w-3.5 h-3.5" /> Product of Interest (Optional)
                  </label>
                  <select
                    id="enq-product"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-darkgray bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                  >
                    <option value="">— Select a product (Optional) —</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.size}) — ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Textarea */}
                <div className="space-y-1">
                  <label htmlFor="enq-message" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Requirement Details / Message *
                  </label>
                  <textarea
                    id="enq-message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your bulk order requirements, delivery frequency, business details, or any questions..."
                    className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all resize-none ${
                      validationErrors.message ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {validationErrors.message && (
                    <p className="text-xs text-red-500 font-bold">{validationErrors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary !py-4 text-base flex items-center justify-center gap-2 shadow-brand-md disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      <span>Submit Enquiry</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-400 pt-2">
                  Your information is secure and will never be shared with third parties.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnquiryPage
