import { Outlet } from 'react-router-dom'
import ScrollToTop from '@components/common/ScrollToTop'

// ─── Placeholder Navbar ───────────────────────────────────────────────────────
// Will be replaced by the full Navbar component in the next phase
function NavbarPlaceholder() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="container-app flex items-center justify-between h-16">
        <span className="text-xl font-bold text-gradient">AquaPure</span>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-darkgray-light">
          <a href="/"         className="hover:text-primary transition-colors">Home</a>
          <a href="/about"    className="hover:text-primary transition-colors">About</a>
          <a href="/products" className="hover:text-primary transition-colors">Products</a>
          <a href="/gallery"  className="hover:text-primary transition-colors">Gallery</a>
          <a href="/contact"  className="btn-primary !py-2 !px-5 !text-sm">Contact</a>
        </nav>
      </div>
    </header>
  )
}

// ─── Placeholder Footer ───────────────────────────────────────────────────────
// Will be replaced by the full Footer component in the next phase
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

// ─── Layout ───────────────────────────────────────────────────────────────────
// App shell that wraps all pages. Outlet renders the matched route's page.
function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <NavbarPlaceholder />

      {/* Main content — pt-16 accounts for fixed navbar height */}
      <main id="main-content" className="flex-1 pt-16">
        <Outlet />
      </main>

      <FooterPlaceholder />
    </div>
  )
}

export default Layout
