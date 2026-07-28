import apiClient from './api/apiClient'

export const paymentService = {
  /**
   * Create a Razorpay order
   * @param {Array} products - [{ productId, quantity }]
   */
  createRazorpayOrder: async (products) => {
    const response = await apiClient.post('/payment/create-order', { products })
    return response.data
  },

  /**
   * Verify Razorpay payment and create order
   * @param {Object} paymentData - { razorpay_order_id, razorpay_payment_id, razorpay_signature, products, shippingAddress, paymentMethod }
   */
  verifyPayment: async (paymentData) => {
    const response = await apiClient.post('/payment/verify', paymentData)
    return response.data
  },
}

export default paymentService
