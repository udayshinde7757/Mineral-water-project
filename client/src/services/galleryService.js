import apiClient from './api/apiClient'

export const galleryService = {
  /**
   * Fetch all gallery items with optional category filtering
   * @param {Object} params - { category }
   */
  getGallery: async (params = {}) => {
    const response = await apiClient.get('/gallery', { params })
    return response.data
  },

  /**
   * Create a new gallery image card (Admin)
   * @param {Object} itemData - { title, imageUrl, category }
   */
  createGalleryItem: async (itemData) => {
    const response = await apiClient.post('/gallery', itemData)
    return response.data
  },

  /**
   * Update gallery image details (Admin)
   * @param {string} id
   * @param {Object} itemData
   */
  updateGalleryItem: async (id, itemData) => {
    const response = await apiClient.put(`/gallery/${id}`, itemData)
    return response.data
  },

  /**
   * Delete gallery image (Admin)
   * @param {string} id
   */
  deleteGalleryItem: async (id) => {
    const response = await apiClient.delete(`/gallery/${id}`)
    return response.data
  },
}

export default galleryService
