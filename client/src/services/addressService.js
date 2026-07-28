import apiClient from './api/apiClient'

export const addressService = {
  /**
   * Get user's saved shipping address
   */
  getSavedAddress: async () => {
    const response = await apiClient.get('/address')
    return response.data
  },

  /**
   * Save / update shipping address
   * @param {Object} addressData - { fullName, email, phone, addressLine1, addressLine2, city, state, pincode, country }
   */
  saveAddress: async (addressData) => {
    const response = await apiClient.put('/address', addressData)
    return response.data
  },
}

export default addressService
