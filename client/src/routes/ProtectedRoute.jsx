import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@hooks/useAuth'
import PageLoader from '@components/common/PageLoader'
import { ROUTES } from '@constants/routes'

/**
 * ProtectedRoute component
 * Wraps routes that require authentication.
 * If user is not authenticated, redirects to /login.
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to login, preserving intended path
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

/**
 * PublicOnlyRoute component
 * Wraps login/signup routes.
 * If user is ALREADY authenticated, redirects to homepage.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
