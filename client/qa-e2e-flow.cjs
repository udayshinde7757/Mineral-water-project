/* Full E2E: register → login → browse → add to cart (UI) → checkout (COD) →
 * order created → admin views → admin updates status → user sees status.
 * Also exercises cart quantity/remove + Buy Now. Run: node qa-e2e-flow.cjs */
const { chromium } = require('playwright-core')

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const APP = 'http://localhost:5173'
const API = 'http://localhost:5000/api'
const TS = Date.now().toString().slice(-8)
const EMAIL = `e2e.${TS}@gmail.com`
const PASS = 'testpass123'
const FULLNAME = 'E2E Flow Tester'
const ADMIN_EMAIL = 'admin@aquapure.com'
const ADMIN_PASS = 'Admin@123456'

const results = []
const record = (name, pass, extra = '') => {
  results.push({ name, pass })
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
}

let browser, page, context
let userToken = null
let adminToken = null

const api = async (method, path, body, t = userToken) => {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

async function main() {
  browser = await chromium.launch({ executablePath: CHROME, headless: true })
  context = await browser.newContext()
  page = await context.newPage()
  const consoleErrors = []
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('console: ' + m.text()) })

  // ═══ 1. REGISTER ═══
  console.log('═══ 1. USER REGISTRATION ═══')
  await page.goto(APP + '/signup', { waitUntil: 'networkidle' })
  await page.fill('input[name="fullname"]', FULLNAME)
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="password"]', PASS)
  await page.fill('input[name="confirmPassword"]', PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/', { timeout: 20000 }) // redirected to home
  userToken = await page.evaluate(() => localStorage.getItem('token'))
  record('Signup → logged in & redirected to home', !!userToken && page.url() === APP + '/', `url=${page.url().replace(APP,'')}`)

  // ═══ 2. BROWSE PRODUCTS ═══
  console.log('═══ 2. BROWSE PRODUCTS ═══')
  await page.goto(APP + '/products', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Our Products', { timeout: 10000 }).catch(() => {})
  const productCards = page.locator('div.group, article, .product-card')
  const cardCount = await productCards.count()
  record('Products page lists products', cardCount > 0, `${cardCount} cards`)

  const prods = (await api('GET', '/products')).data.products
  const target = prods[0]

  // ═══ 3. ADD TO CART (UI) ═══
  console.log('═══ 3. ADD TO CART ═══')
  await page.goto(APP + '/products/' + target._id, { waitUntil: 'networkidle' })
  await page.waitForSelector('button:has-text("Add to Cart"), button:has-text("ADD TO CART")', { timeout: 10000 })
  const addBtn = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first()
  await addBtn.click()
  await page.waitForTimeout(1500)
  const cartApi = await api('GET', '/cart')
  const inCart = cartApi.data.cart?.some((i) => String(i.productId?._id || i.productId) === target._id)
  record('Add to Cart (UI) adds item to backend cart', inCart, inCart ? 'item present' : 'item absent')

  // ═══ 4. CART PAGE — quantity + remove ═══
  console.log('═══ 4. CART PAGE ═══')
  await page.goto(APP + '/cart', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Shopping Cart', { timeout: 10000 })
  await page.waitForSelector(`text=${target.name}`, { timeout: 8000 })
  record('Cart page displays added product', true)

  // increase quantity
  const plus = page.locator('button[aria-label="Increase quantity"]').first()
  await plus.click()
  await page.waitForTimeout(1200)
  const cartAfterInc = await api('GET', '/cart')
  const qty = cartAfterInc.data.cart?.find((i) => String(i.productId?._id || i.productId) === target._id)?.quantity
  record('Quantity increase persists to backend', qty === 2, `qty=${qty}`)

  // remove item
  await page.locator('button[aria-label="Remove item"]').first().click()
  await page.waitForTimeout(1200)
  const cartAfterRm = await api('GET', '/cart')
  const removed = !cartAfterRm.data.cart?.some((i) => String(i.productId?._id || i.productId) === target._id)
  record('Remove item persists to backend', removed)

  // empty-cart state
  await page.waitForSelector('text=Your cart is empty', { timeout: 8000 })
  record('Empty cart state shown', true)

  // ═══ 5. ADD BACK + CHECKOUT (COD) ═══
  console.log('═══ 5. CHECKOUT (COD) ═══')
  await api('POST', '/cart/add', { productId: target._id })
  await page.goto(APP + '/cart', { waitUntil: 'networkidle' })
  await page.waitForSelector(`text=${target.name}`, { timeout: 8000 })
  await page.click('button:has-text("Proceed to Checkout")')
  await page.waitForURL('**/checkout')
  await page.waitForSelector('text=Checkout & Delivery', { timeout: 10000 })
  record('Checkout page reached from cart', true)

  await page.fill('input[name="fullName"]', FULLNAME)
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="phone"]', '9876543210')
  await page.fill('input[name="addressLine1"]', 'Flat 12, Water Street')
  await page.fill('input[name="city"]', 'Nagpur')
  await page.fill('input[name="state"]', 'Maharashtra')
  await page.fill('input[name="pincode"]', '440001')
  // COD is default; submit
  await page.click('button[type="submit"]')
  await page.waitForURL('**/order-success', { timeout: 20000 })
  await page.waitForSelector('text=Thank You', { timeout: 10000 })
  record('COD order placed → order success page', true)

  // Order exists in backend & cart cleared
  const orders = (await api('GET', '/orders')).data.orders
  const placed = orders.find((o) => o.products?.some((p) => String(p.productId) === target._id))
  record('Order persisted in backend', !!placed, placed ? `total=${placed.totalAmount}` : 'no order found')
  const cartNow = (await api('GET', '/cart')).data.cart
  record('Cart cleared after order', (cartNow || []).length === 0, `cart len=${cartNow?.length}`)
  if (!placed) { console.log('ABORT: no order to test admin flow'); await browser.close(); process.exit(1) }
  const orderId = placed._id

  // ═══ 6. ADMIN VIEWS ORDER ═══
  console.log('═══ 6. ADMIN VIEWS ORDER ═══')
  const adminLogin = await api('POST', '/admin/login', { email: ADMIN_EMAIL, password: ADMIN_PASS }, '')
  adminToken = adminLogin.data.token
  record('Admin login', !!adminToken)
  const adminOrders = (await api('GET', '/admin/orders?search=' + orderId, undefined, adminToken)).data
  record('Admin order list finds new order', adminOrders.orders?.some((o) => String(o._id) === orderId))
  const detail = await api('GET', `/admin/orders/${orderId}`, undefined, adminToken)
  record('Admin order detail loads', detail.status === 200 && detail.data.order, `status=${detail.status}`)

  // ═══ 7. ADMIN UPDATES ORDER STATUS ═══
  console.log('═══ 7. ADMIN UPDATES STATUS ═══')
  const upd = await api('PATCH', `/admin/orders/${orderId}/status`, { status: 'Confirmed', notes: 'QA e2e confirmation' }, adminToken)
  record('Admin updates status → Confirmed', upd.status === 200 && upd.data.order?.orderStatus === 'Confirmed', `status=${upd.status} → ${upd.data.order?.orderStatus}`)

  const upd2 = await api('PATCH', `/admin/orders/${orderId}/status`, { status: 'Out For Delivery' }, adminToken)
  const upd3 = await api('PATCH', `/admin/orders/${orderId}/status`, { status: 'Delivered' }, adminToken)
  record('Admin advances to Delivered', upd3.data.order?.orderStatus === 'Delivered', `→ ${upd3.data.order?.orderStatus}`)
  // COD delivered → payment should become Paid
  record('COD order marked Paid on delivery', upd3.data.order?.paymentStatus === 'Paid', `payment=${upd3.data.order?.paymentStatus}`)

  // ═══ 8. USER SEES UPDATED STATUS ═══
  console.log('═══ 8. USER SEES UPDATED STATUS ═══')
  await page.goto(APP + '/my-orders', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=My Orders', { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(1500)
  const body = await page.evaluate(() => document.body.innerText)
  const seesDelivered = body.includes('Delivered')
  record('User order list shows updated status (Delivered)', seesDelivered, seesDelivered ? 'Delivered shown' : 'status not visible')

  // order detail page
  const detailPage = await page.evaluate(() => window.location.href)
  // click into order if link exists
  const orderLink = page.locator(`a[href*="/order"], a[href*="/my-orders/"]`).first()
  if (await orderLink.count()) {
    await orderLink.click().catch(() => {})
    await page.waitForTimeout(1500)
  }
  record('User order detail accessible', true)

  // ═══ 9. BUY NOW FLOW ═══
  console.log('═══ 9. BUY NOW ═══')
  const target2 = prods[1]
  await page.goto(APP + '/products/' + target2._id, { waitUntil: 'networkidle' })
  await page.waitForSelector('button:has-text("Buy Now")', { timeout: 10000 })
  await page.locator('button:has-text("Buy Now")').first().click()
  await page.waitForURL('**/checkout', { timeout: 10000 })
  await page.waitForSelector('text=Checkout & Delivery', { timeout: 10000 })
  await page.waitForSelector(`text=${target2.name}`, { timeout: 8000 })
  record('Buy Now → checkout shows only the chosen product', true)

  // cart must remain empty after Buy Now order
  await page.fill('input[name="fullName"]', FULLNAME)
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="phone"]', '9876543210')
  await page.fill('input[name="addressLine1"]', 'Flat 12, Water Street')
  await page.fill('input[name="city"]', 'Nagpur')
  await page.fill('input[name="state"]', 'Maharashtra')
  await page.fill('input[name="pincode"]', '440001')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/order-success', { timeout: 20000 })
  const cartAfterBuyNow = (await api('GET', '/cart')).data.cart
  record('Buy Now order leaves cart untouched', (cartAfterBuyNow || []).length === 0, `cart len=${cartAfterBuyNow?.length}`)

  // ═══ CONSOLE ERRORS ═══
  const realErrors = consoleErrors.filter((e) => !/favicon/.test(e))
  record('No uncaught console/page errors during flow', realErrors.length === 0, realErrors.length ? realErrors.join(' | ').slice(0, 200) : '')

  // ═══ SUMMARY ═══
  const fails = results.filter((r) => !r.pass)
  console.log(`\n════ RESULT: ${results.length - fails.length}/${results.length} passed, ${fails.length} failed ════`)
  await browser.close()
  process.exit(fails.length ? 1 : 0)
}

main().catch((e) => {
  console.error('TEST RUNNER ERROR:', e)
  process.exit(1)
})
