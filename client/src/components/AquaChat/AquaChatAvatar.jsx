import { useId } from 'react'

/**
 * Original AquaChat avatar — an inline SVG water-drop badge with a subtle
 * AI sparkle. Uses the AquaPure brand palette (deep navy → teal gradient).
 * No external image assets.
 */
function AquaChatAvatar({ size = 44, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const bgId = `aqa-bg-${uid}`
  const dropId = `aqa-drop-${uid}`
  const shimmerId = `aqa-shimmer-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0B4F6C" />
          <stop offset="1" stopColor="#01BAEF" />
        </linearGradient>
        <linearGradient id={dropId} x1="16" y1="10" x2="16" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DDF3F5" />
        </linearGradient>
        <linearGradient id={shimmerId} x1="10" y1="9" x2="38" y2="39" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Circular badge */}
      <circle cx="24" cy="24" r="23" fill={`url(#${bgId})`} />
      <circle
        cx="24"
        cy="24"
        r="22.25"
        stroke="#FFFFFF"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />

      {/* Water droplet */}
      <path
        d="M24 10.8c3.7 4.8 8.2 8.7 8.2 13.5a8.2 8.2 0 1 1-16.4 0c0-4.8 4.5-8.7 8.2-13.5Z"
        fill={`url(#${dropId})`}
      />

      {/* AI sparkle (four-point star) */}
      <path
        d="M34.1 9.6l1.35 3.35 3.35 1.35-3.35 1.35-1.35 3.35-1.35-3.35-3.35-1.35 3.35-1.35 1.35-3.35Z"
        fill="#FFFFFF"
      />

      {/* Soft highlight / shine */}
      <path
        d="M24 10.8c3.7 4.8 8.2 8.7 8.2 13.5a8.2 8.2 0 0 1-3.1 6.4c1.9-2.7 2-6.4-.3-9.6-1.9-2.6-4.5-4.8-4.5-4.8s-2.6 2.2-4.5 4.8c-2.3 3.2-2.2 6.9-.3 9.6a8.2 8.2 0 0 1-3.1-6.4c0-4.8 4.5-8.7 8.2-13.5Z"
        fill={`url(#${shimmerId})`}
      />
    </svg>
  )
}

export default AquaChatAvatar
