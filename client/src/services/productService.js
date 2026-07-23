import apiClient from './api/apiClient'

export const productService = {
  /**
   * Fetch all products with optional filters
   * @param {Object} params - { category, search, sort, minPrice, maxPrice }
   */
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params })
    return response.data
  },

  /**
   * Fetch a single product by ID
   * @param {string} id
   */
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  /**
   * Create a new product (Admin)
   * @param {Object} productData
   */
  createProduct: async (productData) => {
    const response = await apiClient.post('/products', productData)
    return response.data
  },

  /**
   * Update a product (Admin)
   * @param {string} id
   * @param {Object} productData
   */
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData)
    return response.data
  },

  /**
   * Delete a product (Admin)
   * @param {string} id
   */
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data
  },
}

export default productService
