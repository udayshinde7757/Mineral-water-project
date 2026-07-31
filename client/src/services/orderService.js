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
   * Cancel an order (customer)
   * @param {string} orderId
   * @param {string} [cancellationReason] - optional reason
   */
  cancelOrder: async (orderId, cancellationReason = '') => {
    const response = await apiClient.put(`/orders/${orderId}/cancel`, { cancellationReason })
    return response.data
  },

  /**
   * Update order status (admin)
   * @param {string} orderId
   * @param {string} orderStatus
   * @param {string} [cancellationReason]
   */
  updateOrderStatus: async (orderId, orderStatus, cancellationReason = '') => {
    const response = await apiClient.put(`/orders/${orderId}/status`, { orderStatus, cancellationReason })
    return response.data
  },

  /**
   * Get all orders with search/filter/pagination (admin)
   * @param {Object} params - { page, limit, search, status, paymentMethod, refundStatus }
   */
  getAdminOrders: async (params = {}) => {
    const response = await apiClient.get('/orders/admin', { params })
    return response.data
  },

  /**
   * Get cancelled orders with refund info (admin)
   * @param {Object} params - { page, limit, search, refundStatus }
   */
  getAdminCancelledOrders: async (params = {}) => {
    const response = await apiClient.get('/orders/admin/cancelled', { params })
    return response.data
  },

  /**
   * Get a single order by ID (admin)
   * @param {string} orderId
   */
  getAdminOrderById: async (orderId) => {
    const response = await apiClient.get(`/orders/admin/${orderId}`)
    return response.data
  },

  /**
   * Cancel an order from the admin dashboard
   * @param {string} orderId
   * @param {string} [cancellationReason]
   */
  adminCancelOrder: async (orderId, cancellationReason = '') => {
    const response = await apiClient.put(`/orders/admin/${orderId}/cancel`, { cancellationReason })
    return response.data
  },

  /**
   * Retry a failed refund (admin)
   * @param {string} orderId
   */
  retryRefund: async (orderId) => {
    const response = await apiClient.post(`/orders/admin/${orderId}/refund/retry`)
    return response.data
  },

  /**
   * Re-check an in-flight refund and complete it if the gateway confirms (admin)
   * @param {string} orderId
   */
  checkRefundStatus: async (orderId) => {
    const response = await apiClient.post(`/orders/admin/${orderId}/refund/check`)
    return response.data
  },
}

export default orderService
