import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '@hooks/useAuth'
import useBuyNow from '@hooks/useBuyNow'
import { ROUTES } from '@constants/routes'

/**
 * Shared "Buy Now" action — the ONE place every Buy Now button sends the user
 * to checkout. Guarantees the exact contract (STEP 4):
 *
 *   1. Clears any previous Buy Now state (context set replaces it atomically).
 *   2. Saves ONLY the clicked product + selected quantity.
 *   3. Navigates to checkout with EXPLICIT state { mode: 'BUY_NOW', productId, quantity }.
 *
 * It NEVER calls addToCart() and NEVER modifies the cart.
 */
const useBuyNowAction = () => {
  const { isAuthenticated } = useAuth()
  const { setBuyNowProduct } = useBuyNow()
  const navigate = useNavigate()
  const location = useLocation()

  const buyNow = useCallback(
    (product, quantity = 1) => {
      if (!product) return
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN, { state: { from: location } })
        return
      }

      const productId = product._id || product.productId

      // STEP 7 — log the ID that entered the Buy Now flow.
      console.log(
        `⚡ Buy Now click → productId: ${productId} | quantity: ${quantity} | name: ${product.name}`
      )

      // 1 + 2. Replace any previous Buy Now state with ONLY this product.
      setBuyNowProduct(product, quantity)

      // 3. Navigate with explicit state — never rely on previous state.
      navigate(ROUTES.CHECKOUT, {
        state: { mode: 'BUY_NOW', productId, quantity },
      })
    },
    [isAuthenticated, navigate, location, setBuyNowProduct]
  )

  return { buyNow }
}

export default useBuyNowAction
