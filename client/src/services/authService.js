import apiClient from './api/apiClient'

export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { fullname, email, password }
   */
  signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData)
    return response.data
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  /**
   * Get current authenticated user details
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}

export default authService
