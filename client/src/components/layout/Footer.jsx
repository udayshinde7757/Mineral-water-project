import { Link } from 'react-router-dom'
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiLinkedin, FiFacebook, FiDroplet, FiArrowRight } from 'react-icons/fi'
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
  { icon: FiFacebook,  href: 'https://www.facebook.com/sopan.lande.1297',  label: 'Facebook' },
  { icon: FiInstagram, href: 'https://www.instagram.com/shreyaslande_/?hl=en', label: 'Instagram' },
  { icon: FiLinkedin,  href: 'https://www.linkedin.com/in/shreyas-lande-94b973344/', label: 'LinkedIn' },
  { icon: FaWhatsapp,  href: 'https://wa.me/919356212824',                    label: 'WhatsApp' },
]

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-darkgray text-white" aria-label="Site footer">
      {/* CTA Banner */}
      <div className="bg-gradient-brand px-4 py-10">
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
              Submit Enquiry <FiArrowRight />
            </Link>
            <a
              href="https://wa.me/919356212824?text=Hi%20AquaPure!%20I'd%20like%20to%20place%20a%20bulk%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-extrabold px-6 py-3 rounded-full text-sm hover:bg-[#20ba59] transition-colors shadow"
            >
              <FaWhatsapp className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-app py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-4 lg:col-span-1">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center">
              <FiDroplet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gradient">AquaPure</span>
          </Link>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            India's leading mineral water brand delivering pure, natural hydration since 2011. From source to bottle, purity guaranteed.
          </p>
          {/* Social Icons */}
          <div className="flex gap-3 pt-1">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-gradient-brand flex items-center justify-center transition-all hover:scale-105"
              >
                <Icon className="w-4 h-4 text-white/70 hover:text-white" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">Quick Links</h3>
          <ul className="space-y-2.5">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group"
                >
                  <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Products Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">Our Products</h3>
          <ul className="space-y-2.5">
            {['250ml Bottle', '500ml Bottle', '1L Bottle', '2L Family Pack', '5L Bulk Jug', '20L Refill Jar'].map((item) => (
              <li key={item}>
                <Link
                  to={ROUTES.PRODUCTS}
                  className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1.5 group"
                >
                  <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">Contact Us</h3>
          <ul className="space-y-3">
            <li>
              <a
                href="tel:+919356212824"
                className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-4 h-4" />
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
                className="flex items-start gap-3 text-sm text-white/60 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-bold text-xs mb-0.5">Email</p>
                  shreyaslande200@gmail.com
                </div>
              </a>
            </li>
            <li className="flex items-start gap-3 text-sm text-white/60">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <FiMapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white font-bold text-xs mb-0.5">Address</p>
                Nagpur, Maharashtra, India
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-5">
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {year} AquaPure Mineral Water Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
