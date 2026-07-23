import { createContext, useState, useEffect, useCallback } from 'react'
import cartService from '@services/cartService'
import useAuth from '@hooks/useAuth'

export const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch Cart items from server
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([])
      return
    }
    try {
      setLoading(true)
      const data = await cartService.getCart()
      if (data.success) {
        setCartItems(data.cart || [])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Automatically fetch cart when authentication status changes
  useEffect(() => {
    fetchCart()
  }, [isAuthenticated, fetchCart])

  // Add Item to Cart
  const addToCart = async (productId) => {
    try {
      setLoading(true)
      const data = await cartService.addToCart(productId)
      if (data.success) {
        setCartItems(data.cart || [])
        return data
      } else {
        throw new Error(data.message || 'Failed to add item to cart')
      }
    } catch (error) {
      console.error('Error in addToCart context:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update item quantity
  const updateCartQuantity = async (productId, quantity) => {
    try {
      const data = await cartService.updateCart(productId, quantity)
      if (data.success) {
        setCartItems(data.cart || [])
        return data
      } else {
        throw new Error(data.message || 'Failed to update quantity')
      }
    } catch (error) {
      console.error('Error in updateCartQuantity context:', error)
      throw error
    }
  }

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const data = await cartService.removeFromCart(productId)
      if (data.success) {
        setCartItems(data.cart || [])
        return data
      } else {
        throw new Error(data.message || 'Failed to remove item')
      }
    } catch (error) {
      console.error('Error in removeFromCart context:', error)
      throw error
    }
  }

  // Derived properties
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((total, item) => {
    const price = item.productId?.price || 0
    return total + price * item.quantity
  }, 0)

  const value = {
    cartItems,
    loading,
    cartCount,
    cartSubtotal,
    fetchCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
