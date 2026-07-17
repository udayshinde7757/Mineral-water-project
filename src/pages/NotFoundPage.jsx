import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'

// ─── NotFoundPage ─────────────────────────────────────────────────────────────
function NotFoundPage() {
  return (
    <section className="section-padding flex items-center justify-center min-h-[70vh]">
      <div className="container-app text-center">
        {/* Large 404 */}
        <p className="text-[8rem] md:text-[12rem] font-extrabold text-gradient leading-none select-none">
          404
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-darkgray mt-4">
          Oops! This page is gone
        </h1>
        <p className="section-subtitle mx-auto mt-3 text-center">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link to={ROUTES.HOME}    className="btn-primary">Back to Home</Link>
          <Link to={ROUTES.CONTACT} className="btn-secondary">Contact Support</Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
