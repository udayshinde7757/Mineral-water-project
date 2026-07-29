export const CONTACT_COMPANY = {
  name: 'AquaPure',
  phones: ['+91 9356212824', '+91 7757841157'],
  emails: ['shreyaslande200@gmail.com', 'udayshinde7757@gmail.com'],
}

export const CONTACT_TEAM = [
  {
    id: 'shreyas',
    name: 'Shreyas Lande',
    role: 'Co-Founder & IT-Team Lead',
    phone: '+91 9356212824',
    email: 'shreyaslande200@gmail.com',
    image: '/images/shreyas_lande.png',
    initials: 'SL',
  },
  {
    id: 'uday',
    name: 'Uday Shinde',
    role: 'Founder & CEO',
    phone: '+91 7757841157',
    email: 'udayshinde7757@gmail.com',
    image: '/images/uday_shinde.png',
    initials: 'US',
  },
]

export const CONTACT_BUSINESS_HOURS = [
  {
    id: 'weekdays',
    label: 'Monday – Saturday',
    hours: '8:00 AM – 8:00 PM',
  },
  {
    id: 'sunday',
    label: 'Sunday',
    hours: '9:00 AM – 2:00 PM',
  },
]

const WHATSAPP_PREFILL_MESSAGE =
  'Hello AquaPure, I would like to know more about your mineral water products.'

export const CONTACT_SOCIAL_LINKS = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/shreyaslande_/?hl=en',
    network: 'instagram',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/sopan.lande.1297',
    network: 'facebook',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: `https://wa.me/919356212824?text=${encodeURIComponent(WHATSAPP_PREFILL_MESSAGE)}`,
    network: 'whatsapp',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/shreyas-lande-94b973344/',
    network: 'linkedin',
  },
]

/** Google Maps embed — Government Polytechnic Nagpur */
export const CONTACT_MAP_EMBED_URL =
  import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL ||
  'https://maps.google.com/maps?q=Government+Polytechnic+Nagpur,+Nagpur,+Maharashtra,+India&hl=en&z=16&output=embed'

export const CONTACT_MAP_LOCATION_LABEL =
  'Government Polytechnic Nagpur, Nagpur, Maharashtra, India'
