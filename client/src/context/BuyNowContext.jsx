import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const BuyNowContext = createContext(null)

/**
 * Dedicated "Buy Now" state — the SINGLE SOURCE OF TRUTH for the Buy Now
 * checkout flow.
 *
 * It holds ONLY the product the user clicked "Buy Now" on, plus the selected
 * quantity. It must NEVER read or store any cart data. Cart checkout and
 * Buy Now checkout are two completely independent flows (see CheckoutPage).
 *
 * Deliberately NOT persisted to localStorage: a page refresh wipes the
 * in-flight Buy Now session, and CheckoutPage then redirects to a safe
 * "product unavailable" state instead of ever showing stale/random products.
 */
export const BuyNowProvider = ({ children }) => {
  const [buyNowProduct, setBuyNowProductState] = useState(null)

  /**
   * Start a fresh Buy Now session for the clicked product.
   *
   * Replaces any previous Buy Now state atomically (STEP 4: clear previous,
   * save ONLY the clicked product + quantity). Never touches the cart.
   *
   * @param {Object} product Full product object (must have _id, name, price, image)
   * @param {number} [quantity=1] Selected quantity
   */
  const setBuyNowProduct = useCallback((product, quantity = 1) => {
    if (!product) return
    const productId = product._id || product.productId
    if (!productId) {
      console.warn('🧹 BuyNowContext: refusing to store a product without an ID', product)
      return
    }
    console.log('⚡ BuyNowContext → setBuyNowProduct:', { productId, quantity })
    setBuyNowProductState({
      productId,
      quantity: Math.max(1, Number(quantity) || 1),
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.size,
      stock: product.stock,
      category: product.category,
    })
  }, [])

  /** Wipe ALL Buy Now state (after order success, on leaving checkout, etc.) */
  const clearBuyNow = useCallback(() => {
    setBuyNowProductState(null)
  }, [])

  // Derived values required by the Buy Now contract (STEP 3):
  // selectedProduct, quantity, price, subtotal. No cart data here.
  const value = useMemo(() => {
    const selectedProduct = buyNowProduct
    const quantity = buyNowProduct?.quantity || 0
    const price = buyNowProduct?.price || 0
    const subtotal = price * quantity
    return {
      buyNowProduct,
      selectedProduct,
      quantity,
      price,
      subtotal,
      setBuyNowProduct,
      clearBuyNow,
      isBuyNowActive: !!buyNowProduct,
    }
  }, [buyNowProduct, setBuyNowProduct, clearBuyNow])

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
