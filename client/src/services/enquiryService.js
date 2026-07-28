import apiClient from './api/apiClient'

export const enquiryService = {
  /**
   * Submit a new enquiry (Public)
   * @param {Object} enquiryData - { name, email, phone, productId, quantity, message }
   */
  submitEnquiry: async (enquiryData) => {
    const response = await apiClient.post('/enquiries', enquiryData)
    return response.data
  },

  /**
   * Fetch all enquiries with sorting, pagination, and status filters (Admin)
   * @param {Object} params - { search, status, page, limit }
   */
  getEnquiries: async (params = {}) => {
    const response = await apiClient.get('/enquiries', { params })
    return response.data
  },

  /**
   * Mark an enquiry as completed (Admin)
   * @param {string} id
   */
  completeEnquiry: async (id) => {
    const response = await apiClient.put(`/enquiries/${id}`)
    return response.data
  },

  /**
   * Delete an enquiry (Admin)
   * @param {string} id
   */
  deleteEnquiry: async (id) => {
    const response = await apiClient.delete(`/enquiries/${id}`)
    return response.data
  },

  /**
   * Fetch Dashboard analytics and statistics (Admin)
   */
  getDashboardStats: async () => {
    const response = await apiClient.get('/enquiries/stats')
    return response.data
  },
}

export default enquiryService
