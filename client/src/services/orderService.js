import apiClient from './api/apiClient'

export const orderService = {
  /**
   * Create a new order (COD)
   * @param {Object} orderData - { products, shippingAddress, paymentMethod }
   */
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData)
    return response.data
  },

  /**
   * Get all orders for the logged-in user
   */
  getUserOrders: async () => {
    const response = await apiClient.get('/orders')
    return response.data
  },

  /**
   * Get a single order by ID
   * @param {string} orderId
   */
  getOrderById: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}`)
    return response.data
  },

  /**
   * Cancel an order
   * @param {string} orderId
   */
  cancelOrder: async (orderId) => {
    const response = await apiClient.put(`/orders/${orderId}/cancel`)
    return response.data
  },
}

export default orderService
