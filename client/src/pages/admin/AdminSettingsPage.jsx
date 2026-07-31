import { useState, useEffect, useRef, useCallback } from 'react'
import {
  FiSave, FiCheck, FiAlertTriangle, FiLock, FiMail, FiPhone,
  FiImage, FiTruck, FiCreditCard, FiBell, FiUser,
  FiRefreshCw, FiShield, FiClock
} from 'react-icons/fi'
import adminService from '@services/adminService'

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500'
const labelClass =
  'block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5'

const DEFAULT_SETTINGS = {
  businessName: '',
  logo: '',
  supportEmail: '',
  phone: '',
  address: '',
  gstNumber: '',
  deliveryCharges: 0,
  freeDeliveryThreshold: 0,
  minimumOrderAmount: 0,
  taxPercentage: 0,
  orderCancellationRules: '',
  razorpayKeyId: '',
  razorpayKeySecret: '',
  paymentMethods: ['COD', 'Online'],
  emailNotifications: true,
  whatsappNotifications: true,
}

// ─── Small presentational helpers ─────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function SaveButton({ saving, onClick, label = 'Save Changes' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white text-xs font-extrabold transition-all shadow-lg shadow-cyan-500/20"
    >
      {saving ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
      {saving ? 'Saving...' : label}
    </button>
  )
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3 p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white">{title}</h2>
          <p className="text-[11px] text-slate-400 font-semibold">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Toast({ toast }) {
  if (!toast) return null
  const isError = toast.type === 'error'
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white ${
        isError ? 'bg-rose-500' : 'bg-emerald-500'
      }`}
    >
      {isError ? <FiAlertTriangle className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
      {toast.message}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [profile, setProfile] = useState({ fullname: '', email: '' })
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('') // '' | 'settings' | 'profile' | 'password'
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((type, message) => {
    setToast({ type, message })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }, [])

  const updateField = (field) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setSettings((s) => ({ ...s, [field]: value }))
  }

  const togglePaymentMethod = (method) => {
    setSettings((s) => {
      const has = s.paymentMethods.includes(method)
      const next = has ? s.paymentMethods.filter((m) => m !== method) : [...s.paymentMethods, method]
      return { ...s, paymentMethods: next }
    })
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [settingsRes, profileRes] = await Promise.all([
        adminService.getSettings(),
        adminService.getProfile(),
      ])
      if (settingsRes.success && settingsRes.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsRes.settings })
      }
      if (profileRes.success && profileRes.admin) {
        setProfile({
          fullname: profileRes.admin.fullname || '',
          email: profileRes.admin.email || '',
        })
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadAll()
    return () => clearTimeout(toastTimer.current)
  }, [loadAll])

  // Settings sections (business / order / payment / notification)
  const handleSaveSettings = async () => {
    setSaving('settings')
    try {
      await adminService.updateSettings(settings)
      showToast('success', 'Settings saved successfully')
    } catch (err) {
      showToast('error', err.message || 'Failed to save settings')
    } finally {
      setSaving('')
    }
  }

  // Account section
  const handleSaveProfile = async () => {
    if (!profile.fullname.trim()) {
      showToast('error', 'Admin name cannot be empty')
      return
    }
    setSaving('profile')
    try {
      await adminService.updateProfile({ fullname: profile.fullname.trim() })
      showToast('success', 'Profile updated successfully')
    } catch (err) {
      showToast('error', err.message || 'Failed to update profile')
    } finally {
      setSaving('')
    }
  }

  // Password section
  const handleChangePassword = async () => {
    if (!password.currentPassword || !password.newPassword) {
      showToast('error', 'Enter both current and new password')
      return
    }
    if (password.newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters')
      return
    }
    setSaving('password')
    try {
      await adminService.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      })
      showToast('success', 'Password updated successfully')
      setPassword({ currentPassword: '', newPassword: '' })
    } catch (err) {
      showToast('error', err.message || 'Failed to change password')
    } finally {
      setSaving('')
    }
  }

  const razorpayConfigured = Boolean(
    settings.razorpayKeyId &&
      settings.razorpayKeySecret &&
      !settings.razorpayKeyId.startsWith('rzp_test_sample') &&
      !settings.razorpayKeySecret.startsWith('sampleSecretKey')
  )

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
          Manage business configuration, orders, payments, notifications and your admin account
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-10 text-center">
          <FiClock className="w-6 h-6 animate-spin mx-auto text-cyan-500 mb-3" />
          <p className="text-slate-400 font-bold text-sm">Loading settings...</p>
        </div>
      ) : (
        <>
          {/* ── BUSINESS INFORMATION ── */}
          <SectionCard icon={FiShield} title="Business Information" subtitle="Core company details shown to customers">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Business Name">
                <input type="text" value={settings.businessName} onChange={updateField('businessName')} className={inputClass} />
              </Field>
              <Field label="Logo URL">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {settings.logo ? (
                      <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <FiImage className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <input type="text" value={settings.logo} onChange={updateField('logo')} className={inputClass} placeholder="/images/logo.png" />
                </div>
              </Field>
              <Field label="Email">
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="email" value={settings.supportEmail} onChange={updateField('supportEmail')} className={`${inputClass} pl-10`} />
                </div>
              </Field>
              <Field label="Phone">
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" value={settings.phone} onChange={updateField('phone')} className={`${inputClass} pl-10`} />
                </div>
              </Field>
              <Field label="GST Number">
                <input type="text" value={settings.gstNumber} onChange={updateField('gstNumber')} className={inputClass} />
              </Field>
              <Field label="Address">
                <textarea rows="2" value={settings.address} onChange={updateField('address')} className={`${inputClass} resize-none`} />
              </Field>
            </div>
          </SectionCard>

          {/* ── ORDER SETTINGS ── */}
          <SectionCard icon={FiTruck} title="Order Settings" subtitle="Delivery, pricing and cancellation rules">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Field label="Delivery Charges (₹)">
                <input type="number" min="0" value={settings.deliveryCharges} onChange={updateField('deliveryCharges')} className={inputClass} />
              </Field>
              <Field label="Free Delivery Above (₹)">
                <input type="number" min="0" value={settings.freeDeliveryThreshold} onChange={updateField('freeDeliveryThreshold')} className={inputClass} />
              </Field>
              <Field label="Minimum Order Amount (₹)">
                <input type="number" min="0" value={settings.minimumOrderAmount} onChange={updateField('minimumOrderAmount')} className={inputClass} />
              </Field>
              <Field label="Tax / GST Percentage (%)">
                <input type="number" min="0" max="100" value={settings.taxPercentage} onChange={updateField('taxPercentage')} className={inputClass} />
              </Field>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Order Cancellation Rules">
                  <textarea rows="3" value={settings.orderCancellationRules} onChange={updateField('orderCancellationRules')} className={`${inputClass} resize-none`} placeholder="Describe cancellation policy, deadlines and refund rules..." />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* ── PAYMENT SETTINGS ── */}
          <SectionCard icon={FiCreditCard} title="Payment Settings" subtitle="Razorpay configuration and enabled payment methods">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold ${
                    razorpayConfigured
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${razorpayConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  Razorpay: {razorpayConfigured ? 'Configured' : 'Not configured'}
                </span>
              </div>
              <Field label="Razorpay Key ID">
                <input type="text" value={settings.razorpayKeyId} onChange={updateField('razorpayKeyId')} className={inputClass} />
              </Field>
              <Field label="Razorpay Key Secret">
                <input type="password" value={settings.razorpayKeySecret} onChange={updateField('razorpayKeySecret')} className={inputClass} autoComplete="off" />
              </Field>
              <Field label="Payment Methods">
                <div className="space-y-2.5 pt-1">
                  {['COD', 'Online'].map((method) => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.paymentMethods.includes(method)}
                        onChange={() => togglePaymentMethod(method)}
                        className="w-4 h-4 rounded accent-cyan-500"
                      />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {method === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* ── NOTIFICATION SETTINGS ── */}
          <SectionCard icon={FiBell} title="Notification Settings" subtitle="Email and WhatsApp delivery preferences">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Email Notifications</p>
                  <p className="text-[11px] text-slate-400 font-semibold">Order & status updates by email</p>
                </div>
                <Toggle checked={settings.emailNotifications} onChange={(v) => setSettings((s) => ({ ...s, emailNotifications: v }))} />
              </div>
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">WhatsApp Notifications</p>
                  <p className="text-[11px] text-slate-400 font-semibold">Order & status updates on WhatsApp</p>
                </div>
                <Toggle checked={settings.whatsappNotifications} onChange={(v) => setSettings((s) => ({ ...s, whatsappNotifications: v }))} />
              </div>
            </div>
          </SectionCard>

          {/* Save all settings sections */}
          <div className="flex justify-end">
            <SaveButton saving={saving === 'settings'} onClick={handleSaveSettings} label="Save Settings" />
          </div>

          {/* ── ACCOUNT SETTINGS ── */}
          <SectionCard icon={FiUser} title="Account Settings" subtitle="Your administrator profile details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
              <Field label="Admin Name">
                <input type="text" value={profile.fullname} onChange={(e) => setProfile((p) => ({ ...p, fullname: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Admin Email">
                <input type="email" value={profile.email} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
              </Field>
            </div>
            <div className="flex justify-end mt-5">
              <SaveButton saving={saving === 'profile'} onClick={handleSaveProfile} label="Save Profile" />
            </div>
          </SectionCard>

          {/* ── CHANGE PASSWORD ── */}
          <SectionCard icon={FiLock} title="Change Password" subtitle="Update your administrator account password">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
              <Field label="Current Password">
                <input type="password" value={password.currentPassword} onChange={(e) => setPassword((p) => ({ ...p, currentPassword: e.target.value }))} className={inputClass} autoComplete="current-password" />
              </Field>
              <Field label="New Password">
                <input type="password" value={password.newPassword} onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))} className={inputClass} autoComplete="new-password" />
              </Field>
            </div>
            <div className="flex justify-end mt-5">
              <SaveButton saving={saving === 'password'} onClick={handleChangePassword} label="Change Password" />
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}
