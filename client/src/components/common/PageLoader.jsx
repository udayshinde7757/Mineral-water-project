// ─── PageLoader ───────────────────────────────────────────────────────────────
// Full-screen loading spinner shown during lazy page chunk loading (Suspense fallback)

function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
    >
      {/* Animated water drop ripple */}
      <div className="relative flex items-center justify-center w-20 h-20">
        <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-20 animate-ping" />
        <span className="relative inline-flex w-10 h-10 rounded-full bg-gradient-brand shadow-brand-md" />
      </div>

      {/* Brand name */}
      <p className="mt-6 text-sm font-semibold tracking-widest uppercase text-primary">
        AquaPure
      </p>
      <p className="mt-1 text-xs text-darkgray-subtle">Loading...</p>
    </div>
  )
}

export default PageLoader
