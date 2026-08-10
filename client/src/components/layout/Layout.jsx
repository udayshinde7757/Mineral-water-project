import { Outlet } from 'react-router-dom'
import ScrollToTop from '@components/common/ScrollToTop'
import Navbar from './Navbar'
import Footer from './Footer'
import AquaChat from '@components/AquaChat/AquaChat'

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FBFD]">
      {/* Skip to main content — WCAG 2.2 AA Requirement */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#0F4C81] focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      <ScrollToTop />
      <Navbar />

      {/* Main content — pt-16 to pt-20 accounts for fixed navbar height */}
      <main id="main-content" className="flex-1 pt-16 sm:pt-20" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />

      {/* AquaChat — global AI customer-support assistant (all pages) */}
      <AquaChat />
    </div>
  )
}

export default Layout
