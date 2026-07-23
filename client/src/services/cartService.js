import apiClient from './api/apiClient'

export const cartService = {
  /**
   * Fetch logged-in user's cart from backend
   */
  getCart: async () => {
    const response = await apiClient.get('/cart')
    return response.data
  },

  /**
   * Add a product to user's cart
   * @param {string} productId
   */
  addToCart: async (productId) => {
    const response = await apiClient.post('/cart/add', { productId })
    return response.data
  },

  /**
   * Update quantity of a product in the cart
   * @param {string} productId
   * @param {number} quantity
   */
  updateCart: async (productId, quantity) => {
    const response = await apiClient.put('/cart/update', { productId, quantity })
    return response.data
  },

  /**
   * Remove a product from user's cart
   * @param {string} productId
   */
  removeFromCart: async (productId) => {
    const response = await apiClient.delete(`/cart/remove/${productId}`)
    return response.data
  },
}

export default cartService
