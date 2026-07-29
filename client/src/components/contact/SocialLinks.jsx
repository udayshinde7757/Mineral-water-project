import { FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { CONTACT_SOCIAL_LINKS } from '@constants/contactPage'

const ICONS = {
  instagram: FiInstagram,
  facebook: FiFacebook,
  whatsapp: FaWhatsapp,
  linkedin: FiLinkedin,
}

function SocialLinks({ className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Follow Us</p>
      <div className="flex flex-wrap gap-3">
        {CONTACT_SOCIAL_LINKS.map(({ id, label, href, network }) => {
          const Icon = ICONS[network]
          const isWhatsApp = network === 'whatsapp'
          return (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 shadow-brand-sm ${
                isWhatsApp
                  ? 'bg-[#25D366] text-white hover:bg-[#20ba59]'
                  : 'bg-lightblue text-primary hover:bg-gradient-brand hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default SocialLinks
