import { useContext } from 'react'
import BuyNowContext from '@context/BuyNowContext'

export const useBuyNow = () => {
  const context = useContext(BuyNowContext)
  if (!context) {
    throw new Error('useBuyNow must be used within a BuyNowProvider')
  }
  return context
}

export default useBuyNow