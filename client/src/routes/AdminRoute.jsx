import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@hooks/useAuth'
import PageLoader from '@components/common/PageLoader'
import { ROUTES } from '@constants/routes'

/**
 * AdminRoute Guard Component
 * Enforces role-based authorization for /admin routes
 */
export function AdminRoute() {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoader />
  }

  // Not logged in -> Redirect to /login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  const isAdmin = user && user.role === 'admin'

  // Logged in but not an admin -> Show 403 Access Denied UI
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/60 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 text-3xl font-black shadow-inner">
            403
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-white">403 - Access Denied</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
              You do not have permission to access this page.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-200"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default AdminRoute

