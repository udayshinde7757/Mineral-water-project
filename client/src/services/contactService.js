import apiClient from './api/apiClient'

const contactService = {
  submitContact: async (contactData) => {
    const response = await apiClient.post('/contact', contactData, {
      validateStatus: (status) => status >= 200 && status < 300,
    })
    return response.data
  },

  getContacts: async (params = {}) => {
    const response = await apiClient.get('/contact', { params })
    return response.data
  },
}

export default contactService
