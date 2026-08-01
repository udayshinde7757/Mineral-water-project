import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'

function RefundPolicyPage() {
  document.title = 'Refund Policy — AquaPure'

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
          Refund Policy
        </h1>
        <p className="text-sm text-muted mb-8">Last updated: August 2026</p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-heading mb-3">1. Eligibility for Refund</h2>
            <p className="text-sm text-body leading-relaxed">
              You may request a refund if your order is cancelled before delivery, if the product
              arrives damaged or defective, or if you receive the wrong product. Refund requests must
              be made within 7 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">2. Online Payments (Razorpay)</h2>
            <p className="text-sm text-body leading-relaxed">
              For orders paid online via Razorpay, refunds are processed back to the original payment
              method within 5-10 business days after approval. You will receive an email notification
              when the refund is initiated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">3. Cash on Delivery (COD)</h2>
            <p className="text-sm text-body leading-relaxed">
              For COD orders, refunds are processed via bank transfer to the account details you
              provide during the refund request. Processing takes 7-10 business days after approval.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">4. Non-Refundable Items</h2>
            <p className="text-sm text-body leading-relaxed">
              Opened or partially consumed products are not eligible for refund unless they are
              defective or contaminated. Promotional or discounted items are refundable at the price
              paid.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">5. How to Request a Refund</h2>
            <p className="text-sm text-body leading-relaxed">
              Contact us at{' '}
              <a href="tel:+919356212824" className="text-primary font-semibold hover:underline">
                +91 9356212824
              </a>{' '}
              or{' '}
              <a href="mailto:shreyaslande200@gmail.com" className="text-primary font-semibold hover:underline">
                shreyaslande200@gmail.com
              </a>{' '}
              with your order ID and reason for the refund. Our team will review your request and
              respond within 2 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default RefundPolicyPage
