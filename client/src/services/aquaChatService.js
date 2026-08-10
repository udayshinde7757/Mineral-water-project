import apiClient from './api/apiClient'

/**
 * AquaChat — talks only to the server-side endpoint. The Gemini API key is
 * NEVER loaded in the browser; every AI request is proxied through the backend.
 */
const aquaChatService = {
  sendMessage: async ({ message, history, page }) => {
    const response = await apiClient.post('/aquachat/chat', {
      message,
      history,
      page,
    })
    return response.data
  },

  getStatus: async () => {
    const response = await apiClient.get('/aquachat')
    return response.data
  },
}

export default aquaChatService
