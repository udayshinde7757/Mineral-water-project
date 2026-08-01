import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'

function TermsOfServicePage() {
  document.title = 'Terms of Service — AquaPure'

  return (
    <div className="bg-background min-h-screen py-10 lg:py-16">
      <div className="container-app max-w-3xl">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold mb-8 hover:underline"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-tight mb-6">
          Terms of Service
        </h1>
        <p className="text-sm text-muted mb-8">Last updated: August 2026</p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-heading mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-body leading-relaxed">
              By accessing or using the AquaPure website and services, you agree to be bound by these
              Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">2. Products and Orders</h2>
            <p className="text-sm text-body leading-relaxed">
              All mineral water products are subject to availability. Prices are in Indian Rupees (₹)
              and inclusive of applicable taxes unless stated otherwise. We reserve the right to limit
              order quantities and to refuse any order at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">3. Payment</h2>
            <p className="text-sm text-body leading-relaxed">
              We accept Cash on Delivery (COD) and online payments via Razorpay (UPI, credit/debit
              cards, net banking). Online payments are processed securely by Razorpay and are subject
              to their terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">4. Delivery</h2>
            <p className="text-sm text-body leading-relaxed">
              We aim to deliver orders within 2-5 business days depending on your location. Delivery
              charges and free delivery thresholds are displayed at checkout. Delivery times are
              estimates and may vary based on location and demand.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">5. Cancellation</h2>
            <p className="text-sm text-body leading-relaxed">
              You may cancel an order before it has been shipped. Once shipped, cancellation is not
              possible — please refer to our Refund Policy for returns.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">6. Limitation of Liability</h2>
            <p className="text-sm text-body leading-relaxed">
              AquaPure shall not be liable for any indirect, incidental, or consequential damages
              arising from the use of our products or services. Our liability is limited to the amount
              paid for the product in question.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">7. Contact</h2>
            <p className="text-sm text-body leading-relaxed">
              For questions about these terms, contact us at{' '}
              <a href="tel:+919356212824" className="text-primary font-semibold hover:underline">
                +91 9356212824
              </a>{' '}
              or{' '}
              <a href="mailto:shreyaslande200@gmail.com" className="text-primary font-semibold hover:underline">
                shreyaslande200@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsOfServicePage
