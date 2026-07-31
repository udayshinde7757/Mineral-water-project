import apiClient, { getApiErrorMessage } from './api/apiClient'

const adminService = {
  // Auth
  adminLogin: async (credentials) => {
    try {
      const response = await apiClient.post('/admin/login', credentials)
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.admin))
      }
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Admin login failed'))
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/admin/me')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch admin profile'))
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/admin/profile', data)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update admin profile'))
    }
  },

  changePassword: async (data) => {
    try {
      const response = await apiClient.put('/admin/profile/password', data)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to change password'))
    }
  },

  // Stats & Analytics
  getStats: async () => {
    try {
      const response = await apiClient.get('/admin/stats')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch dashboard stats'))
    }
  },

  getAnalytics: async () => {
    try {
      const response = await apiClient.get('/admin/analytics')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch analytics'))
    }
  },

  // Orders
  getOrders: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/orders', { params })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch orders'))
    }
  },

  getOrderDetails: async (id) => {
    try {
      const response = await apiClient.get(`/admin/orders/${id}`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch order details'))
    }
  },

  updateOrderStatus: async (id, status, notes = '') => {
    try {
      const response = await apiClient.patch(`/admin/orders/${id}/status`, { status, notes })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update order status'))
    }
  },

  markOrderCompleted: async (id) => {
    try {
      const response = await apiClient.post(`/admin/orders/${id}/complete`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to mark order as completed'))
    }
  },

  cancelOrder: async (id, cancellationReason = '') => {
    try {
      const response = await apiClient.post(`/admin/orders/${id}/cancel`, { cancellationReason })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to cancel order'))
    }
  },

  // Products
  getProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/products', { params })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch products'))
    }
  },

  createProduct: async (data) => {
    try {
      const response = await apiClient.post('/admin/products', data)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create product'))
    }
  },

  updateProduct: async (id, data) => {
    try {
      const response = await apiClient.put(`/admin/products/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update product'))
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/products/${id}`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete product'))
    }
  },

  updateStock: async (id, stock) => {
    try {
      const response = await apiClient.patch(`/admin/products/${id}/stock`, { stock })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update stock'))
    }
  },

  toggleVisibility: async (id) => {
    try {
      const response = await apiClient.patch(`/admin/products/${id}/visibility`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to toggle product visibility'))
    }
  },

  // Inventory
  getInventory: async () => {
    try {
      const response = await apiClient.get('/admin/inventory')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch inventory'))
    }
  },

  // Customers
  getCustomers: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/customers', { params })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch customers'))
    }
  },

  updateCustomerStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/admin/customers/${id}/status`, { status })
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update customer status'))
    }
  },

  deleteCustomer: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/customers/${id}`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete customer'))
    }
  },

  promoteUser: async (id) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/promote`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to promote user to admin'))
    }
  },


  // Payments & Refunds
  getPayments: async () => {
    try {
      const response = await apiClient.get('/admin/payments')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch payments'))
    }
  },

  getRefunds: async () => {
    try {
      const response = await apiClient.get('/admin/refunds')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch refunds'))
    }
  },

  retryRefund: async (id) => {
    try {
      const response = await apiClient.post(`/admin/refunds/${id}/retry`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to retry refund'))
    }
  },

  // Notifications & Logs
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/admin/notifications')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch notification logs'))
    }
  },

  retryNotification: async (id) => {
    try {
      const response = await apiClient.post(`/admin/notifications/${id}/retry`)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to retry notification'))
    }
  },

  getActivityLogs: async () => {
    try {
      const response = await apiClient.get('/admin/logs')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch activity logs'))
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const response = await apiClient.get('/admin/settings')
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch settings'))
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await apiClient.put('/admin/settings', settings)
      return response.data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update settings'))
    }
  },

  // Export
  exportDataUrl: (type) => `${apiClient.defaults.baseURL}/admin/reports/export?type=${type}`,
}

export default adminService
