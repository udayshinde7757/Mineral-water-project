import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPhone, FiMail, FiUser } from 'react-icons/fi'
import { CONTACT_TEAM } from '@constants/contactPage'

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

function TeamAvatar({ member }) {
  const [imgError, setImgError] = useState(false)

  if (!imgError && member.image) {
    return (
      <img
        src={member.image}
        alt={member.name}
        onError={() => setImgError(true)}
        className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-brand-sm"
      />
    )
  }

  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-brand text-white flex items-center justify-center text-xl font-extrabold border-4 border-white shadow-brand-sm">
      {member.initials}
    </div>
  )
}

function TeamMemberCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {CONTACT_TEAM.map((member, index) => (
        <motion.article
          key={member.id}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ delay: index * 0.1 }}
          className="group bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <TeamAvatar member={member} />
            <div className="flex-1 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lightblue text-primary text-xs font-bold">
                <FiUser className="w-3.5 h-3.5" />
                {member.role}
              </div>
              <h3 className="text-xl font-extrabold text-darkgray group-hover:text-primary transition-colors">
                {member.name}
              </h3>
              <a
                href={`tel:${member.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center sm:justify-start gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                <FiPhone className="w-4 h-4 text-primary" />
                {member.phone}
              </a>
              <a
                href={`mailto:${member.email}`}
                className="flex items-center justify-center sm:justify-start gap-2 text-sm font-semibold text-gray-600 hover:text-primary transition-colors break-all"
              >
                <FiMail className="w-4 h-4 text-primary" />
                {member.email}
              </a>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  )
}

export default TeamMemberCards
