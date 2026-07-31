import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@styles/index.css'
import AppRouter from '@/routes/AppRouter'
import { AuthProvider } from '@context/AuthContext'
import { CartProvider } from '@context/CartContext'
import { BuyNowProvider } from '@context/BuyNowContext'
import { SettingsProvider } from '@context/SettingsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <BuyNowProvider>
            <AppRouter />
          </BuyNowProvider>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  </StrictMode>
)
