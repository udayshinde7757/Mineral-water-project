import apiClient from './api/apiClient'

export const settingsService = {
  /**
   * Fetch current public website settings (delivery, tax, business info)
   */
  getSettings: async () => {
    const response = await apiClient.get('/settings')
    return response.data
  },
}

export default settingsService
