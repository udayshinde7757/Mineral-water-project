import { Outlet } from 'react-router-dom'
import ScrollToTop from '@components/common/ScrollToTop'
import Navbar from './Navbar'
import Footer from './Footer'

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />

      {/* Main content — pt-16 to pt-20 accounts for fixed navbar height */}
      <main id="main-content" className="flex-1 pt-16 sm:pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout
