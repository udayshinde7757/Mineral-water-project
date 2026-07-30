import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FiLogOut,
  FiChevronDown,
  FiMenu,
  FiX,
  FiDroplet,
  FiMail,
  FiShoppingCart,
  FiPackage,
} from 'react-icons/fi'
import useAuth from '@hooks/useAuth'
import useCart from '@hooks/useCart'
import { ROUTES } from '@constants/routes'

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.94, y: -6 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0, scale: 0.94, y: -6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

const mobileMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto', opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    height: 0, opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cartCount } = useCart()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Track scroll for glassmorphism intensity
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    await logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const navLinks = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'About', path: ROUTES.ABOUT },
    { name: 'Products', path: ROUTES.PRODUCTS },
    { name: 'Gallery', path: ROUTES.GALLERY },
    { name: 'Contact', path: ROUTES.CONTACT },
  ]

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100/80 transition-all duration-500 ${
        scrolled
          ? 'shadow-sm mx-auto max-w-7xl rounded-2xl top-2'
          : ''
      }`}
    >
      <div className="container-app flex items-center justify-between h-16 sm:h-20">
        {/* Brand Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#0F4F81' }}
          >
            <FiDroplet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span style={{ color: '#0F4F81' }}>AquaPure</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium relative">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `py-1 transition-colors duration-200 ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-gray-500 hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <span className="relative inline-block">
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2.5px] rounded-full"
                      style={{ backgroundColor: '#0F4F81' }}
                    />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Auth State Buttons / User Profile */}
        <div className="hidden md:flex items-center gap-5">
          {/* Cart Icon Link */}
          {isAuthenticated && (
            <Link
              to={ROUTES.CART}
              className="relative p-2.5 rounded-full text-gray-500 hover:text-primary hover:bg-primary-50/60 transition-all duration-200 hover:scale-105 mr-2"
              aria-label={`View Cart with ${cartCount} items`}
            >
              <FiShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
                  whileHover={{ scale: 1.15 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-brand-sm"
                  style={{ backgroundColor: '#0F4F81' }}
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            /* Logged In: User Profile Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all border shadow-sm focus:outline-none"
                style={{
                  background: 'rgba(15, 79, 129, 0.06)',
                  color: '#0F4F81',
                  borderColor: 'rgba(15, 79, 129, 0.15)',
                }}
                aria-expanded={dropdownOpen}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                     style={{ backgroundColor: '#0F4F81' }}>
                  {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-semibold max-w-[120px] truncate">
                  {user?.fullname || 'Profile'}
                </span>
                <FiChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu — Animated */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-card border border-gray-100 py-1 z-50 overflow-hidden"
                    style={{ transformOrigin: 'top' }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-navy truncate">
                        {user?.fullname}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate mt-0.5">
                        <FiMail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0F4F81' }} />
                        <span className="truncate">{user?.email}</span>
                      </div>
                    </div>

                    <div className="p-1">
                      <Link
                        to={ROUTES.MY_ORDERS}
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50/50 rounded-xl transition-colors"
                      >
                        <FiPackage className="w-4 h-4" style={{ color: '#0F4F81' }} />
                        <span>My Orders</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                      >
                        <FiLogOut className="w-4 h-4 text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Logged Out: Login & Signup Buttons */
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.LOGIN}
                className="btn-secondary !py-2 !px-5 !text-sm"
              >
                Log In
              </Link>
              <Link
                to={ROUTES.SIGNUP}
                className="btn-primary !py-2 !px-5 !text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && (
            <Link
              to={ROUTES.CART}
              className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors mr-1"
              aria-label="View Cart"
            >
              <FiShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, transition: { type: 'spring', stiffness: 500, damping: 15 } }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-brand-sm"
                  style={{ backgroundColor: '#0F4F81' }}
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl text-navy hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu — Animated */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-4">
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-white font-semibold bg-[#0F4F81]'
                          : 'text-gray-700 hover:bg-primary-50/50'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
                {isAuthenticated && (
                  <>
                    <NavLink
                      to={ROUTES.CART}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                          isActive
                            ? 'text-white font-semibold bg-[#0F4F81]'
                            : 'text-gray-700 hover:bg-primary-50/50'
                        }`
                      }
                    >
                      <span>Cart</span>
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white"
                            style={{ backgroundColor: '#0F4F81' }}>
                        {cartCount}
                      </span>
                    </NavLink>
                    <NavLink
                      to={ROUTES.MY_ORDERS}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                          isActive
                            ? 'text-white font-semibold bg-[#0F4F81]'
                            : 'text-gray-700 hover:bg-primary-50/50'
                        }`
                      }
                    >
                      <FiPackage className="w-4 h-4" />
                      <span>My Orders</span>
                    </NavLink>
                  </>
                )}
              </nav>

              <div className="pt-3 border-t border-gray-100">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2.5 rounded-xl"
                         style={{ background: 'rgba(15, 79, 129, 0.04)' }}>
                      <p className="text-xs text-gray-500 font-medium">Logged in user</p>
                      <p className="text-sm font-bold text-navy">{user?.fullname}</p>
                      <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-secondary !py-2.5 !px-3 !text-sm text-center"
                    >
                      Log In
                    </Link>
                    <Link
                      to={ROUTES.SIGNUP}
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-primary !py-2.5 !px-3 !text-sm text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
