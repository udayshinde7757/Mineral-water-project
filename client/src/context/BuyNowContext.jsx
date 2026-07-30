import { createContext, useContext, useState, useCallback } from 'react'

const BuyNowContext = createContext(null)

export const BuyNowProvider = ({ children }) => {
  const [buyNowItem, setBuyNowItem] = useState(null)

  const setBuyNow = useCallback((product) => {
    setBuyNowItem(product)
  }, [])

  const clearBuyNow = useCallback(() => {
    setBuyNowItem(null)
  }, [])

  const value = {
    buyNowItem,
    setBuyNow,
    clearBuyNow,
  }

  return (
    <BuyNowContext.Provider value={value}>
      {children}
    </BuyNowContext.Provider>
  )
}

export const useBuyNow = () => {
  const context = useContext(BuyNowContext)
  if (!context) {
    throw new Error('useBuyNow must be used within a BuyNowProvider')
  }
  return context
}

export default BuyNowContext