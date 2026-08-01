import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'

function PrivacyPolicyPage() {
  document.title = 'Privacy Policy — AquaPure'

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
          Privacy Policy
        </h1>
        <p className="text-sm text-muted mb-8">Last updated: August 2026</p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-heading mb-3">1. Information We Collect</h2>
            <p className="text-sm text-body leading-relaxed">
              When you use AquaPure, we collect information you provide directly, such as your name,
              email address, phone number, and delivery address when you place an order or create an
              account. We also collect payment information through our secure payment processor
              (Razorpay) and browsing data such as IP address and device information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">2. How We Use Your Information</h2>
            <p className="text-sm text-body leading-relaxed">
              We use your information to process and deliver orders, communicate with you about your
              orders, improve our products and services, send promotional communications (with your
              consent), and comply with legal obligations. We do not sell your personal information to
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">3. Data Security</h2>
            <p className="text-sm text-body leading-relaxed">
              We implement industry-standard security measures including SSL encryption, secure payment
              processing via Razorpay, and access controls. However, no method of transmission over
              the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">4. Cookies</h2>
            <p className="text-sm text-body leading-relaxed">
              We use essential cookies to maintain your session and authentication. You can control
              cookie settings through your browser preferences. Disabling essential cookies may affect
              your ability to use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">5. Your Rights</h2>
            <p className="text-sm text-body leading-relaxed">
              You have the right to access, correct, or delete your personal data. To exercise these
              rights, please contact us at{' '}
              <a href="mailto:shreyaslande200@gmail.com" className="text-primary font-semibold hover:underline">
                shreyaslande200@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-heading mb-3">6. Contact</h2>
            <p className="text-sm text-body leading-relaxed">
              For questions about this Privacy Policy, contact us at{' '}
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

export default PrivacyPolicyPage
