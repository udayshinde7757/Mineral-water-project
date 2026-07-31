import { useState, useContext, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiShoppingBag, FiBox, FiArchive, FiUsers,
  FiCreditCard, FiRefreshCw, FiBell, FiBarChart2, FiFileText,
  FiActivity, FiSettings, FiUser, FiLogOut, FiMenu, FiX,
  FiSearch, FiSun, FiMoon, FiChevronRight, FiShield, FiDroplet
} from 'react-icons/fi'
import { AuthContext } from '@context/AuthContext'
import { ROUTES } from '@constants/routes'
import adminService from '@services/adminService'

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('admin_theme') === 'dark' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const [recentNotifs, setRecentNotifs] = useState([])
  const [globalSearch, setGlobalSearch] = useState('')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('admin_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('admin_theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    // Fetch quick notification logs for bell dropdown
    adminService.getNotifications()
      .then((data) => {
        if (data.success && data.notifications) {
          setRecentNotifs(data.notifications.slice(0, 5))
        }
      })
      .catch(() => {})
  }, [location.pathname])

  const navItems = [
    { label: 'Dashboard', icon: FiGrid, path: ROUTES.ADMIN_DASHBOARD },
    { label: 'Orders', icon: FiShoppingBag, path: ROUTES.ADMIN_ORDERS },
    { label: 'Products', icon: FiBox, path: ROUTES.ADMIN_PRODUCTS },
    { label: 'Inventory', icon: FiArchive, path: ROUTES.ADMIN_INVENTORY },
    { label: 'Customers', icon: FiUsers, path: ROUTES.ADMIN_CUSTOMERS },
    { label: 'Payments', icon: FiCreditCard, path: ROUTES.ADMIN_PAYMENTS },
    { label: 'Refunds', icon: FiRefreshCw, path: ROUTES.ADMIN_REFUNDS },
    { label: 'Notifications', icon: FiBell, path: ROUTES.ADMIN_NOTIFICATIONS },
    { label: 'Analytics', icon: FiBarChart2, path: ROUTES.ADMIN_ANALYTICS },
    { label: 'Reports', icon: FiFileText, path: ROUTES.ADMIN_REPORTS },
    { label: 'Activity Logs', icon: FiActivity, path: ROUTES.ADMIN_LOGS },
    { label: 'Settings', icon: FiSettings, path: ROUTES.ADMIN_SETTINGS },
  ]

  // Generate breadcrumb links based on pathname
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((seg, idx) => {
    const url = `/${pathSegments.slice(0, idx + 1).join('/')}`
    return { name: seg.charAt(0).toUpperCase() + seg.slice(1), url }
  })

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`${ROUTES.ADMIN_ORDERS}?search=${encodeURIComponent(globalSearch.trim())}`)
    }
  }

  const handleLogout = () => {
    logout()
    navigate(ROUTES.ADMIN_LOGIN)
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-300 font-sans flex flex-col`}>
      {/* ── TOP NAVBAR ── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Left: Sidebar Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hidden md:flex"
              title="Toggle Sidebar"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all md:hidden"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            <Link to={ROUTES.ADMIN_DASHBOARD} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <FiDroplet className="w-5 h-5 fill-current" />
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  AquaPure
                </span>
                <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300">
                  Admin Pro
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden lg:flex items-center w-full max-w-md mx-6">
            <div className="relative w-full">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, customers, products (Press Enter)..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
                className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <FiSun className="w-5 h-5 text-amber-400" /> : <FiMoon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative"
              >
                <FiBell className="w-5 h-5" />
                {recentNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              <AnimatePresence>
                {notifDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Recent Notifications</h4>
                      <Link
                        to={ROUTES.ADMIN_NOTIFICATIONS}
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recentNotifs.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No recent notification dispatches</p>
                      ) : (
                        recentNotifs.map((n) => (
                          <div key={n._id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-cyan-600 dark:text-cyan-400">{n.type} • {n.event}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${n.status === 'Sent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>
                                {n.status}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 line-clamp-1">{n.recipient} — {n.customerName}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                  {user?.fullname ? user.fullname.substring(0, 2) : 'AD'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {user?.fullname || 'Administrator'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Admin Owner</span>
                </div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.fullname}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to={ROUTES.ADMIN_PROFILE}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <FiUser className="w-4 h-4 text-cyan-500" /> Admin Profile
                    </Link>
                    <Link
                      to={ROUTES.ADMIN_SETTINGS}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <FiSettings className="w-4 h-4 text-indigo-500" /> Store Settings
                    </Link>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN BODY (SIDEBAR + CONTENT) ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 shadow-sm z-30 select-none`}
        >
          <div className="p-3 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              )
            })}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            {sidebarOpen ? (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 p-3.5 rounded-2xl border border-cyan-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <FiShield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">AquaPure Protected</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Role: Master Administrator
                </p>
              </div>
            ) : (
              <div className="flex justify-center text-cyan-500">
                <FiShield className="w-5 h-5" />
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Slide-over Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                onClick={(e) => e.stopPropagation()}
                className="w-72 bg-white dark:bg-slate-900 h-full flex flex-col p-4 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <FiDroplet className="w-6 h-6 text-cyan-500 fill-current" />
                    <span className="font-black text-lg text-slate-900 dark:text-white">AquaPure Admin</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1 flex-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONTENT AREA ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <Link to={ROUTES.ADMIN_DASHBOARD} className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              Admin
            </Link>
            {breadcrumbs.slice(1).map((b, idx) => (
              <div key={b.url} className="flex items-center gap-2">
                <FiChevronRight className="w-3 h-3 text-slate-400" />
                <span className={idx === breadcrumbs.length - 2 ? 'text-cyan-600 dark:text-cyan-400 font-bold' : ''}>
                  {b.name}
                </span>
              </div>
            ))}
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  )
}
