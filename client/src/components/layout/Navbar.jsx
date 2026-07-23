import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiMenu,
  FiX,
  FiDroplet,
  FiMail,
} from 'react-icons/fi'
import useAuth from '@hooks/useAuth'
import { ROUTES } from '@constants/routes'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-200">
      <div className="container-app flex items-center justify-between h-16 sm:h-20">
        {/* Brand Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gradient tracking-tight"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-lightblue rounded-xl flex items-center justify-center text-primary shadow-brand-sm">
            <FiDroplet className="w-5 h-5 sm:w-6 sm:h-6 fill-primary" />
          </div>
          <span>AquaPure</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-darkgray-light">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `transition-colors hover:text-primary ${
                  isActive ? 'text-primary font-semibold' : 'text-gray-600'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Auth State Buttons / User Profile */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            /* Logged In: User Profile Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-lightblue/60 hover:bg-lightblue text-primary font-medium text-sm transition-all border border-primary/20 shadow-sm focus:outline-none"
                aria-expanded={dropdownOpen}
              >
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
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

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-darkgray truncate">
                      {user?.fullname}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate mt-0.5">
                      <FiMail className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                  </div>

                  <div className="p-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                    >
                      <FiLogOut className="w-4 h-4 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
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
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl text-darkgray hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-fadeIn">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-lightblue text-primary font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-3 py-2 bg-lightblue/40 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium">Logged in user</p>
                  <p className="text-sm font-bold text-darkgray">{user?.fullname}</p>
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
      )}
    </header>
  )
}

export default Navbar
