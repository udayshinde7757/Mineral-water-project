import { Outlet } from 'react-router-dom'
import ScrollToTop from '@components/common/ScrollToTop'
import Navbar from './Navbar'

function FooterPlaceholder() {
  return (
    <footer className="bg-darkgray text-white py-10">
      <div className="container-app text-center">
        <p className="text-gradient text-xl font-bold mb-2">AquaPure</p>
        <p className="text-sm text-white/50">© {new Date().getFullYear()} AquaPure. All rights reserved.</p>
      </div>
    </footer>
  )
}

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />

      {/* Main content — pt-16 to pt-20 accounts for fixed navbar height */}
      <main id="main-content" className="flex-1 pt-16 sm:pt-20">
        <Outlet />
      </main>

      <FooterPlaceholder />
    </div>
  )
}

export default Layout
