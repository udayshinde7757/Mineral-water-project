import apiClient from './api/apiClient'

export const testimonialService = {
  /**
   * Fetch all customer reviews
   */
  getTestimonials: async () => {
    const response = await apiClient.get('/testimonials')
    return response.data
  },

  /**
   * Create a new review card (Admin)
   * @param {Object} testimonialData - { name, role, quote, rating }
   */
  createTestimonial: async (testimonialData) => {
    const response = await apiClient.post('/testimonials', testimonialData)
    return response.data
  },

  /**
   * Update review details (Admin)
   * @param {string} id
   * @param {Object} testimonialData
   */
  updateTestimonial: async (id, testimonialData) => {
    const response = await apiClient.put(`/testimonials/${id}`, testimonialData)
    return response.data
  },

  /**
   * Delete review card (Admin)
   * @param {string} id
   */
  deleteTestimonial: async (id) => {
    const response = await apiClient.delete(`/testimonials/${id}`)
    return response.data
  },
}

export default testimonialService
