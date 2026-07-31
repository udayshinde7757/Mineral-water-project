import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import settingsService from '@services/settingsService'

export const SettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  deliveryCharges: 0,
  freeDeliveryThreshold: 0,
  minimumOrderAmount: 0,
  taxPercentage: 0,
}

/**
 * Provides global website settings (delivery charges, free-delivery threshold,
 * tax percentage, business info) fetched once from GET /api/settings.
 */
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await settingsService.getSettings()
      if (data.success && data.settings) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error('Failed to load site settings:', err.message)
      setError(err.message || 'Failed to load site settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Re-fetch so the storefront picks up any admin changes
  const refresh = useCallback(async () => {
    await loadSettings()
  }, [loadSettings])

  const value = useMemo(() => {
    const deliveryCharges = Number(settings.deliveryCharges) || 0
    const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold) || 0
    const taxPercentage = Number(settings.taxPercentage) || 0

    return {
      settings,
      loading,
      error,
      refresh,
      // Convenience accessors used by cart/checkout calculations
      deliveryCharges,
      freeDeliveryThreshold,
      taxPercentage,
      minimumOrderAmount: Number(settings.minimumOrderAmount) || 0,
      /**
       * Delivery charge for a given subtotal, honouring the free-delivery threshold.
       * @param {number} subtotal
       */
      getDeliveryCharge: (subtotal) => {
        const s = Number(subtotal) || 0
        if (s === 0 || s >= freeDeliveryThreshold) return 0
        return deliveryCharges
      },
      /**
       * GST amount (rounded) for a given subtotal.
       * @param {number} subtotal
       */
      getGstAmount: (subtotal) => {
        const s = Number(subtotal) || 0
        return Math.round(s * (taxPercentage / 100))
      },
    }
  }, [settings, loading, error, refresh])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export default SettingsContext
