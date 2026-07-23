import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import Layout from '@components/layout/Layout'
import PageLoader from '@components/common/PageLoader'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
const HomePage     = lazy(() => import('@pages/HomePage'))
const AboutPage    = lazy(() => import('@pages/AboutPage'))
const ProductsPage = lazy(() => import('@pages/ProductsPage'))
const GalleryPage  = lazy(() => import('@pages/GalleryPage'))
const ContactPage  = lazy(() => import('@pages/ContactPage'))
const LoginPage    = lazy(() => import('@pages/LoginPage'))
const SignupPage   = lazy(() => import('@pages/SignupPage'))
const CartPage     = lazy(() => import('@pages/CartPage'))
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'))

// ─── App Router ───────────────────────────────────────────────────────────────
function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            {/* Guest / Public-only routes (redirects to Home if already logged in) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path={ROUTES.LOGIN}  element={<LoginPage />} />
              <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            </Route>

            {/* Protected Routes (Nobody can access home or e-commerce pages without logging in) */}
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.HOME}     element={<HomePage />} />
              <Route path={ROUTES.ABOUT}    element={<AboutPage />} />
              <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
              <Route path={ROUTES.GALLERY}  element={<GalleryPage />} />
              <Route path={ROUTES.CONTACT}  element={<ContactPage />} />
              <Route path={ROUTES.CART}     element={<CartPage />} />
            </Route>

            {/* Catch-all Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
