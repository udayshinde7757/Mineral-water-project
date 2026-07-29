import { motion } from 'framer-motion'
import { FiPhone, FiMail, FiDroplet } from 'react-icons/fi'
import { CONTACT_COMPANY } from '@constants/contactPage'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

function ContactInfoCards() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <motion.div
        variants={fadeInUp}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center mb-4 shadow-brand-sm">
          <FiDroplet className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-teal mb-1">Company</p>
        <h3 className="text-xl font-extrabold text-darkgray">{CONTACT_COMPANY.name}</h3>
        <p className="text-sm text-gray-500 mt-2">Premium mineral water — purity you can trust.</p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-lightblue text-primary flex items-center justify-center mb-4">
          <FiPhone className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-teal mb-3">Phone</p>
        <ul className="space-y-2">
          {CONTACT_COMPANY.phones.map((phone) => (
            <li key={phone}>
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="text-sm font-bold text-darkgray hover:text-primary transition-colors"
              >
                {phone}
              </a>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all sm:col-span-2 lg:col-span-1"
      >
        <div className="w-12 h-12 rounded-2xl bg-lightblue text-primary flex items-center justify-center mb-4">
          <FiMail className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-teal mb-3">Email</p>
        <ul className="space-y-2">
          {CONTACT_COMPANY.emails.map((email) => (
            <li key={email}>
              <a
                href={`mailto:${email}`}
                className="text-sm font-bold text-darkgray hover:text-primary transition-colors break-all"
              >
                {email}
              </a>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}

export default ContactInfoCards
