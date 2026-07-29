import axios from 'axios'

/**
 * Ensures requests hit /api/* on the backend.
 * - Dev default: /api (Vite proxy → localhost:5000)
 * - Prod: VITE_API_URL or http://localhost:5000/api
 */
function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && String(envUrl).trim()) {
    const trimmed = String(envUrl).trim().replace(/\/$/, '')
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
  }
  if (import.meta.env.DEV) {
    return '/api'
  }
  return 'http://localhost:5000/api'
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
    return `Cannot reach the server at ${API_BASE_URL}. Make sure the backend is running on port 5000.`
  }

  if (error.response?.status === 404) {
    return `Contact API not found (404). Check that the server registers app.use("/api/contact", contactRoutes).`
  }

  return error?.message || fallback
}

export default apiClient
