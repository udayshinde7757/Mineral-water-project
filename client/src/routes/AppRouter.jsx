import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import Layout from '@components/layout/Layout'
import PageLoader from '@components/common/PageLoader'

// ─── Lazy-loaded Pages (code splitting per route) ─────────────────────────────
const HomePage     = lazy(() => import('@pages/HomePage'))
const AboutPage    = lazy(() => import('@pages/AboutPage'))
const ProductsPage = lazy(() => import('@pages/ProductsPage'))
const GalleryPage  = lazy(() => import('@pages/GalleryPage'))
const ContactPage  = lazy(() => import('@pages/ContactPage'))
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'))

// ─── App Router ───────────────────────────────────────────────────────────────
function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path={ROUTES.HOME}     element={<HomePage />} />
            <Route path={ROUTES.ABOUT}    element={<AboutPage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.GALLERY}  element={<GalleryPage />} />
            <Route path={ROUTES.CONTACT}  element={<ContactPage />} />
            <Route path="*"               element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
