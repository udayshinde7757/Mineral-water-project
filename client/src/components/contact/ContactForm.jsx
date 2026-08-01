import { useState } from 'react'
import { FiSend, FiAlertCircle, FiMessageSquare, FiCheckCircle } from 'react-icons/fi'
import contactService from '@services/contactService'

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

function ContactForm({ onSuccess }) {
  const [formData, setFormData] = useState(INITIAL)
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Full name is required'

    if (!formData.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else {
      const digits = formData.phone.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 13) {
        errors.phone = 'Please enter a valid phone number (min 10 digits)'
      }
    }

    if (!formData.subject.trim()) errors.subject = 'Subject is required'
    if (!formData.message.trim()) errors.message = 'Message is required'

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      }
      const data = await contactService.submitContact(payload)
      if (data.success) {
        setFormData(INITIAL)
        onSuccess?.()
      } else {
        setApiError(data.message || 'Failed to send message. Please try again.')
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Connection error. Please check your internet and try again.'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (field) => validationErrors[field] || null

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card">
      <h3 className="text-xl font-extrabold text-darkgray mb-6 flex items-center gap-2">
        <FiMessageSquare className="text-primary" /> Send Us a Message
      </h3>

      {apiError && (
        <div role="alert" className="mb-4 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-2xl border border-red-100 flex items-center gap-2">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="contact-name" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Full Name *
            </label>
            <input
              type="text"
              id="contact-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              aria-required="true"
              aria-invalid={!!fieldError('name')}
              aria-describedby={fieldError('name') ? 'err-name' : undefined}
              className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all ${
                fieldError('name') ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {fieldError('name') && (
              <p id="err-name" className="text-xs text-red-500 font-bold">{fieldError('name')}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="contact-email" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Email *
            </label>
            <input
              type="email"
              id="contact-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              aria-required="true"
              aria-invalid={!!fieldError('email')}
              aria-describedby={fieldError('email') ? 'err-email' : undefined}
              className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all ${
                fieldError('email') ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {fieldError('email') && (
              <p id="err-email" className="text-xs text-red-500 font-bold">{fieldError('email')}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="contact-phone" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Phone Number *
            </label>
            <input
              type="tel"
              id="contact-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 98765 43210"
              aria-required="true"
              aria-invalid={!!fieldError('phone')}
              aria-describedby={fieldError('phone') ? 'err-phone' : undefined}
              className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all ${
                fieldError('phone') ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {fieldError('phone') && (
              <p id="err-phone" className="text-xs text-red-500 font-bold">{fieldError('phone')}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="contact-subject" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Subject *
            </label>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Order inquiry, delivery support..."
              aria-required="true"
              aria-invalid={!!fieldError('subject')}
              aria-describedby={fieldError('subject') ? 'err-subject' : undefined}
              className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all ${
                fieldError('subject') ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {fieldError('subject') && (
              <p id="err-subject" className="text-xs text-red-500 font-bold">{fieldError('subject')}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="contact-message" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Message *
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            placeholder="How can we help you today?"
            aria-required="true"
            aria-invalid={!!fieldError('message')}
            aria-describedby={fieldError('message') ? 'err-message' : undefined}
            className={`w-full px-4 py-3 rounded-2xl border text-sm text-darkgray placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50/50 focus:bg-white transition-all resize-none ${
              fieldError('message') ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {fieldError('message') && (
            <p id="err-message" className="text-xs text-red-500 font-bold">{fieldError('message')}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary !py-4 text-base flex items-center justify-center gap-2 shadow-brand-md disabled:opacity-60"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <FiSend className="w-5 h-5" />
              <span>Send Message</span>
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1 pt-1">
          <FiCheckCircle className="w-3.5 h-3.5" />
          Your information is kept private and secure.
        </p>
      </form>
    </div>
  )
}

export default ContactForm
