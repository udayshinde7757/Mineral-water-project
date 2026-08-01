import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import Layout from '@components/layout/Layout'
import PageLoader from '@components/common/PageLoader'
import ErrorBoundary from '@components/common/ErrorBoundary'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import AdminLayout from '@components/admin/AdminLayout'
import { useBuyNow } from '@hooks/useBuyNow'

/**
 * Wipes any in-flight Buy Now state the moment the user leaves the checkout
 * route (cancel, browser back, "return home", etc.) — so stale Buy Now data can
 * never survive to hijack a later checkout. StrictMode-safe: it only clears on
 * an actual transition AWAY from /checkout, never on mount.
 */
function RouteChangeWatcher() {
  const location = useLocation()
  const { clearBuyNow } = useBuyNow()
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    const from = prevPath.current
    prevPath.current = location.pathname
    if (from === ROUTES.CHECKOUT && location.pathname !== ROUTES.CHECKOUT) {
      clearBuyNow()
    }
  }, [location.pathname, clearBuyNow])

  return null
}

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
const HomePage         = lazy(() => import('@pages/HomePage'))
const AboutPage        = lazy(() => import('@pages/AboutPage'))
const ProductsPage     = lazy(() => import('@pages/ProductsPage'))
const GalleryPage      = lazy(() => import('@pages/GalleryPage'))
const ContactPage      = lazy(() => import('@pages/ContactPage'))
const LoginPage        = lazy(() => import('@pages/LoginPage'))
const SignupPage       = lazy(() => import('@pages/SignupPage'))
const CartPage         = lazy(() => import('@pages/CartPage'))
const CheckoutPage     = lazy(() => import('@pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('@pages/OrderSuccessPage'))
const MyOrdersPage     = lazy(() => import('@pages/MyOrdersPage'))
const EnquiryPage      = lazy(() => import('@pages/EnquiryPage'))
// Reserved Admin entry — not exposed as a public route.
// eslint-disable-next-line no-unused-vars
const AdminPage        = lazy(() => import('@pages/AdminPage'))
const ProductDetailsPage = lazy(() => import('@pages/ProductDetailsPage'))
const PrivacyPolicyPage    = lazy(() => import('@pages/PrivacyPolicyPage'))
const TermsOfServicePage   = lazy(() => import('@pages/TermsOfServicePage'))
const RefundPolicyPage     = lazy(() => import('@pages/RefundPolicyPage'))
const NotFoundPage     = lazy(() => import('@pages/NotFoundPage'))

// ─── Admin Pages (role-protected) ─────────────────────────────────────────────
const AdminLoginPage         = lazy(() => import('@pages/admin/AdminLoginPage'))
const AdminDashboardPage     = lazy(() => import('@pages/admin/AdminDashboardPage'))
const AdminOrdersPage        = lazy(() => import('@pages/admin/AdminOrdersPage'))
const AdminOrderDetailPage   = lazy(() => import('@pages/admin/AdminOrderDetailPage'))
const AdminProductsPage      = lazy(() => import('@pages/admin/AdminProductsPage'))
const AdminInventoryPage     = lazy(() => import('@pages/admin/AdminInventoryPage'))
const AdminCustomersPage     = lazy(() => import('@pages/admin/AdminCustomersPage'))
const AdminPaymentsPage      = lazy(() => import('@pages/admin/AdminPaymentsPage'))
const AdminRefundsPage       = lazy(() => import('@pages/admin/AdminRefundsPage'))
const AdminNotificationsPage = lazy(() => import('@pages/admin/AdminNotificationsPage'))
const AdminAnalyticsPage     = lazy(() => import('@pages/admin/AdminAnalyticsPage'))
const AdminReportsPage       = lazy(() => import('@pages/admin/AdminReportsPage'))
const AdminActivityLogsPage  = lazy(() => import('@pages/admin/AdminActivityLogsPage'))
const AdminSettingsPage      = lazy(() => import('@pages/admin/AdminSettingsPage'))

// ─── App Router ───────────────────────────────────────────────────────────────
function AppRouter() {
  return (
    <BrowserRouter>
      <RouteChangeWatcher />
      <ErrorBoundary>
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
              <Route path={ROUTES.HOME}          element={<HomePage />} />
              <Route path={ROUTES.ABOUT}         element={<AboutPage />} />
              <Route path={ROUTES.PRODUCTS}      element={<ProductsPage />} />
              <Route path={ROUTES.GALLERY}       element={<GalleryPage />} />
              <Route path={ROUTES.CONTACT}       element={<ContactPage />} />
              <Route path={ROUTES.CART}           element={<CartPage />} />
              <Route path={ROUTES.CHECKOUT}       element={<CheckoutPage />} />
              <Route path={ROUTES.ORDER_SUCCESS}  element={<OrderSuccessPage />} />
              <Route path={ROUTES.MY_ORDERS}      element={<MyOrdersPage />} />
              <Route path={ROUTES.ENQUIRY}       element={<EnquiryPage />} />
              <Route path={ROUTES.PRODUCT_DETAILS} element={<ProductDetailsPage />} />
            </Route>

            {/* Public policy pages (inside Layout, no auth required) */}
            <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
            <Route path={ROUTES.TERMS_OF_SERVICE} element={<TermsOfServicePage />} />
            <Route path={ROUTES.REFUND_POLICY} element={<RefundPolicyPage />} />

            {/* Catch-all Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login (public — no storefront layout) */}
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />

          {/* Admin Panel (requires admin role, uses its own layout) */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.ADMIN_DASHBOARD}     element={<AdminDashboardPage />} />
              <Route path={ROUTES.ADMIN_ORDERS}        element={<AdminOrdersPage />} />
              <Route path={ROUTES.ADMIN_ORDER_DETAILS} element={<AdminOrderDetailPage />} />
              <Route path={ROUTES.ADMIN_PRODUCTS}      element={<AdminProductsPage />} />
              <Route path={ROUTES.ADMIN_INVENTORY}     element={<AdminInventoryPage />} />
              <Route path={ROUTES.ADMIN_CUSTOMERS}     element={<AdminCustomersPage />} />
              <Route path={ROUTES.ADMIN_PAYMENTS}      element={<AdminPaymentsPage />} />
              <Route path={ROUTES.ADMIN_REFUNDS}       element={<AdminRefundsPage />} />
              <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={<AdminNotificationsPage />} />
              <Route path={ROUTES.ADMIN_ANALYTICS}     element={<AdminAnalyticsPage />} />
              <Route path={ROUTES.ADMIN_REPORTS}       element={<AdminReportsPage />} />
              <Route path={ROUTES.ADMIN_LOGS}          element={<AdminActivityLogsPage />} />
              <Route path={ROUTES.ADMIN_SETTINGS}      element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default AppRouter
