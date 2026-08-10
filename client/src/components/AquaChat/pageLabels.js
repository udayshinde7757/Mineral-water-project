/**
 * Safe page labels sent to the backend for page-aware context.
 * Only these labels are accepted server-side (see ALLOWED_PAGES in
 * aquaChatController.js) — an unknown path sends no page context.
 */
export const PAGE_LABELS = {
  '/': 'Home',
  '/about': 'About',
  '/products': 'Products',
  '/gallery': 'Gallery',
  '/contact': 'Contact',
  '/enquiry': 'Enquiry',
  '/login': 'Login',
  '/signup': 'Signup',
  '/cart': 'Cart',
  '/checkout': 'Checkout',
  '/order-success': 'Order Success',
  '/my-orders': 'My Orders',
  '/privacy-policy': 'Privacy Policy',
  '/terms-of-service': 'Terms of Service',
  '/refund-policy': 'Refund Policy',
}

export function getPageLabel(pathname) {
  if (!pathname) return null
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
  if (pathname.startsWith('/products/')) return 'Product Details'
  return null
}
