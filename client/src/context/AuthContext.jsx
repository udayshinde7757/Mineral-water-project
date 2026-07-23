import { createContext, useState, useEffect, useCallback } from 'react'
import authService from '@services/authService'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Verify and fetch user session on initial load or token change
  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    try {
      const data = await authService.getCurrentUser()
      if (data.success && data.user) {
        setUser(data.user)
        setToken(storedToken)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        setUser(null)
        setToken(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Failed to authenticate session:', error)
      localStorage.removeItem('token')
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Login Handler
  const login = async (email, password) => {
    const data = await authService.login({ email, password })
    if (data.success && data.token) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      setIsAuthenticated(true)
      return data
    } else {
      throw new Error(data.message || 'Login failed')
    }
  }

  // Signup Handler
  const signup = async (fullname, email, password) => {
    const data = await authService.signup({ fullname, email, password })
    if (data.success && data.token) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      setIsAuthenticated(true)
      return data
    } else {
      throw new Error(data.message || 'Registration failed')
    }
  }

  // Logout Handler
  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.warn('Logout API call error:', err)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
    }
  }

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    refreshUser: loadUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
