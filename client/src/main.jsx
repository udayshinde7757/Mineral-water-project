import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@styles/index.css'
import AppRouter from '@/routes/AppRouter'
import { AuthProvider } from '@context/AuthContext'
import { CartProvider } from '@context/CartContext'
import { BuyNowProvider } from '@context/BuyNowContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <BuyNowProvider>
          <AppRouter />
        </BuyNowProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
)
