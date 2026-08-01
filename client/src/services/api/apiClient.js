import axios from 'axios'

/**
 * Ensures requests hit /api/* on the backend.
 * - Dev: /api (Vite proxy → localhost:5000)
 * - Prod: VITE_API_URL or /api (same-origin behind reverse proxy)
 */
function resolveApiBaseUrl() {
  // In development, always use Vite proxy (no CORS issues, simpler).
  if (import.meta.env.DEV) {
    return '/api'
  }

  // In production, use the absolute URL from env if provided.
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && String(envUrl).trim()) {
    const trimmed = String(envUrl).trim().replace(/\/$/, '')
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
  }

  // Production default: same-origin /api (works when served behind a reverse
  // proxy that forwards /api → backend). Never fall back to localhost.
  return '/api'
}

export const API_BASE_URL = resolveApiBaseUrl()

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

/**
 * Extract a user-visible message from an Axios error.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (data) {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors.join(' ')
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error
    }
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Cannot reach the server. Please check your connection and try again.'
  }

  if (error.response?.status === 404) {
    return 'The requested resource was not found (404).'
  }

  return error?.message || fallback
}

export default apiClient
