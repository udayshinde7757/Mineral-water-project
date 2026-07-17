import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// ─── ScrollToTop ──────────────────────────────────────────────────────────────
// Automatically scrolls the window to the top on every route change.
// Must be rendered inside <BrowserRouter> — placed in Layout.jsx.

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default ScrollToTop
