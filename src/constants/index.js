import { ROUTES } from './routes'

// ─── App Meta ─────────────────────────────────────────────────────────────────
export const APP_NAME = 'AquaPure'
export const APP_TAGLINE = 'Pure from Source to Bottle'
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://aquapure.vercel.app'

// ─── Navigation Links ─────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { id: 'nav-home',     label: 'Home',     to: ROUTES.HOME },
  { id: 'nav-about',    label: 'About',    to: ROUTES.ABOUT },
  { id: 'nav-products', label: 'Products', to: ROUTES.PRODUCTS },
  { id: 'nav-gallery',  label: 'Gallery',  to: ROUTES.GALLERY },
  { id: 'nav-contact',  label: 'Contact',  to: ROUTES.CONTACT },
]

// ─── Footer Links ─────────────────────────────────────────────────────────────
export const FOOTER_COMPANY_LINKS = [
  { id: 'footer-about',    label: 'About Us',  to: ROUTES.ABOUT },
  { id: 'footer-products', label: 'Products',  to: ROUTES.PRODUCTS },
  { id: 'footer-gallery',  label: 'Gallery',   to: ROUTES.GALLERY },
  { id: 'footer-contact',  label: 'Contact',   to: ROUTES.CONTACT },
]

// ─── Contact Info ─────────────────────────────────────────────────────────────
export const CONTACT_INFO = {
  email:    'hello@aquapure.in',
  phone:    '+91 98765 43210',
  address:  '123 Pure Water Lane, Mineral Springs, India — 400001',
  mapUrl:   'https://maps.google.com',
}

// ─── Social Links ─────────────────────────────────────────────────────────────
export const SOCIAL_LINKS = [
  { id: 'social-facebook',  label: 'Facebook',  url: 'https://facebook.com/aquapure',  icon: 'FaFacebook' },
  { id: 'social-instagram', label: 'Instagram', url: 'https://instagram.com/aquapure', icon: 'FaInstagram' },
  { id: 'social-twitter',   label: 'Twitter',   url: 'https://twitter.com/aquapure',   icon: 'FaTwitter' },
  { id: 'social-linkedin',  label: 'LinkedIn',  url: 'https://linkedin.com/company/aquapure', icon: 'FaLinkedin' },
]

// ─── Framer Motion Shared Variants ───────────────────────────────────────────
export const MOTION_VARIANTS = {
  fadeInUp: {
    hidden:  { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  },
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  },
  scaleIn: {
    hidden:  { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
  },
  staggerContainer: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  },
  slideInLeft: {
    hidden:  { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  },
  slideInRight: {
    hidden:  { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  },
}

// ─── Business Stats ──────────────────────────────────────────────────────────
export const COMPANY_STATS = [
  { id: 'stat-years',     value: 15,     suffix: '+', label: 'Years of Purity'  },
  { id: 'stat-customers', value: 50000,  suffix: '+', label: 'Happy Customers'  },
  { id: 'stat-products',  value: 12,     suffix: '',  label: 'Product Variants' },
  { id: 'stat-cities',    value: 100,    suffix: '+', label: 'Cities Served'    },
]

export { ROUTES }
