/* QA smoke test — walks every storefront route, captures console errors /
 * warnings, page exceptions and failed network requests. Run: node qa-smoke-test.cjs */
const { chromium } = require('playwright-core')

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const APP = 'http://localhost:5173'
const API = 'http://localhost:5000/api'
const EMAIL = 'qa.user.0807@gmail.com'
const PASS = 'testpass123'
const ADMIN_EMAIL = 'admin@aquapure.com'
const ADMIN_PASS = 'Admin@123456'

const results = []
const issues = [] // {route, kind, text}

let browser, page
let token = null
let adminToken = null

const record = (name, pass, extra = '') => {
  results.push({ name, pass })
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
}

const api = async (method, path, body, t = token) => {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => null) }
}

async function visit(route, { asUser = false } = {}) {
  const pageIssues = []
  const handler = (type, payload) => {
    if (payload) {
      const text = typeof payload === 'string' ? payload : payload.text ? payload.text() : String(payload)
      if (text) pageIssues.push({ kind: type, text: String(text).slice(0, 300) })
    }
  }
  const onConsole = (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      const text = msg.text()
      // Ignore dev-only noise + intentional RouteChangeWatcher debug log
      if (/Download the React DevTools/.test(text)) return
      if (/RouteChangeWatcher: leaving checkout/.test(text)) return
      pageIssues.push({ kind: `console.${msg.type()}`, text: text.slice(0, 300) })
    }
  }
  const onReqFailed = (req) => pageIssues.push({ kind: 'req.failed', text: `${req.method()} ${req.url()} ${req.failure()?.errorText || ''}` })
  const onResponse = (res) => {
    if (res.status() >= 400) pageIssues.push({ kind: `http.${res.status()}`, text: `${res.request().method()} ${res.url()}` })
  }
  const onPageError = (err) => pageIssues.push({ kind: 'pageerror', text: String(err.message).slice(0, 300) })

  page.removeAllListeners('console')
  page.removeAllListeners('requestfailed')
  page.removeAllListeners('response')
  page.removeAllListeners('pageerror')
  page.on('console', onConsole)
  page.on('requestfailed', onReqFailed)
  page.on('response', onResponse)
  page.on('pageerror', onPageError)

  await page.goto(APP + route, { waitUntil: 'networkidle', timeout: 30000 }).catch((e) => {
    pageIssues.push({ kind: 'nav.error', text: e.message })
  })
  await page.waitForTimeout(2500)

  const clean = pageIssues.filter((i) => {
    const t = i.text
    // Whitelist benign noise
    if (/favicon/.test(t)) return false
    if (/net::ERR_ABORTED/.test(t) && /favicon|\.ico/.test(t)) return false
    return true
  })
  if (clean.length) issues.push({ route, issues: clean })
  return clean
}

async function registerUser() {
  const existing = await api('POST', '/auth/login', { email: EMAIL, password: PASS })
  if (existing.status === 200 && existing.data?.success) {
    token = existing.data.token
    record('QA user login (existing)', true)
    return
  }
  const res = await api('POST', '/auth/signup', { fullname: 'QA Tester', email: EMAIL, password: PASS })
  record('QA user signup', res.status === 201 && res.data?.success, `status=${res.status}`)
  if (res.data?.token) token = res.data.token
}

async function loginAdmin() {
  const res = await api('POST', '/admin/login', { email: ADMIN_EMAIL, password: ADMIN_PASS }, '')
  adminToken = res.data?.token
  record('Admin login (API)', res.status === 200 && !!res.data?.token, `status=${res.status}`)
}

async function main() {
  browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const context = await browser.newContext()
  page = await context.newPage()

  // ── Anonymous (public) routes ─────────────────────────────────────────────
  console.log('\n═══ PUBLIC ROUTES (anonymous) ═══')
  const anonRoutes = ['/', '/about', '/products', '/gallery', '/contact', '/enquiry',
    '/login', '/signup', '/privacy-policy', '/terms-of-service', '/refund-policy',
    '/admin/login', '/admin/dashboard', '/admin/orders', '/admin/products',
    '/cart', '/checkout', '/my-orders', '/order-success', '/products/invalid-id']
  for (const r of anonRoutes) {
    const probs = await visit(r)
    const expProtected = ['/cart', '/checkout', '/my-orders', '/order-success', '/admin/dashboard', '/admin/orders', '/admin/products']
    if (expProtected.includes(r)) {
      // Protected routes should redirect to /login (not render a broken page)
      const url = page.url()
      record(`Anonymous visit ${r} → redirected`, url.includes('/login') || url.includes('/signup'), `final=${url.replace(APP,'')}`)
    } else {
      record(`Anonymous visit ${r} loads`, probs.length === 0, probs.length ? `${probs.length} issue(s): ${probs[0].text}` : '')
    }
  }

  // ── Register + login as user ──────────────────────────────────────────────
  console.log('\n═══ AUTH ═══')
  await registerUser()
  record('Auth token obtained', !!token)

  // Invalid credentials
  const badLogin = await api('POST', '/auth/login', { email: 'nobody@nowhere.com', password: 'wrongpass' })
  record('Invalid login rejected (401)', badLogin.status === 401, `status=${badLogin.status}`)

  // Seed the browser's localStorage so full page reloads stay authenticated.
  await page.goto(APP + '/login')
  await page.evaluate((t) => localStorage.setItem('token', t), token)
  await page.goto(APP + '/', { waitUntil: 'networkidle' })
  const authedHome = await page.evaluate(() => !!localStorage.getItem('token'))
  record('Browser session authenticated for reloads', authedHome)

  // ── Protected routes as logged-in user ────────────────────────────────────
  console.log('\n═══ PROTECTED ROUTES (logged-in) ═══')
  const protectedRoutes = ['/', '/about', '/products', '/gallery', '/contact', '/enquiry',
    '/cart', '/checkout', '/my-orders']
  for (const r of protectedRoutes) {
    const probs = await visit(r)
    const redirected = page.url().includes('/login')
    record(`Authenticated visit ${r} renders (no redirect)`, !redirected && probs.length === 0,
      redirected ? `redirected to /login` : (probs.length ? `${probs.length} issue(s): ${probs[0].text}` : ''))
  }

  // Home page main elements
  await visit('/')
  record('Home page shows hero/products', (await page.textContent('body')).includes('Shop Now') || (await page.textContent('body')).length > 500)

  // ── Products & product details ────────────────────────────────────────────
  console.log('\n═══ PRODUCTS ═══')
  const prod = await api('GET', '/products')
  const products = prod.data?.products || []
  record('Backend returns products', products.length > 0, `${products.length} products`)
  if (products.length) {
    const pid = products[0]._id
    const probs = await visit('/products/' + pid)
    record(`Product details page (${products[0].name.slice(0, 30)})`, probs.length === 0, probs.length ? probs[0].text : '')

    // Add to cart via API then verify cart page
    const add = await api('POST', '/cart/add', { productId: pid })
    record('Add to cart (API)', add.status === 200 && add.data?.success, `status=${add.status}`)

    const cartPage = await visit('/cart')
    const hasItem = await page.getByText(products[0].name, { exact: false }).first()
      .waitFor({ timeout: 8000 }).then(() => true).catch(() => false)
    record('Cart page loads with item', cartPage.length === 0 && hasItem,
      cartPage.length ? cartPage[0].text : hasItem ? 'cart content ok' : 'product name not found on cart page')
  }

  // ── Admin panel (needs separate admin login) ──────────────────────────────
  console.log('\n═══ ADMIN ═══')
  await loginAdmin()
  // Seed the ADMIN token so /admin/* pages render as a real admin session.
  await page.goto(APP + '/login')
  await page.evaluate((t) => localStorage.setItem('token', t), adminToken)
  await page.goto(APP + '/admin/dashboard', { waitUntil: 'networkidle' })

  const adminRoutes = ['/admin/dashboard', '/admin/orders', '/admin/products', '/admin/inventory',
    '/admin/customers', '/admin/payments', '/admin/refunds', '/admin/notifications',
    '/admin/analytics', '/admin/reports', '/admin/activity-logs', '/admin/settings']
  for (const r of adminRoutes) {
    const probs = await visit(r)
    const stayed = page.url().includes('/admin/')
    record(`Admin visit ${r} renders (no redirect)`, stayed && probs.length === 0,
      !stayed ? `redirected to ${page.url().replace(APP, '')}` : (probs.length ? `${probs.length} issue(s): ${probs[0].text}` : ''))
  }

  // Admin API endpoints with admin token
  const adminApis = [
    ['GET', '/admin/stats'], ['GET', '/admin/analytics'], ['GET', '/admin/orders'],
    ['GET', '/admin/products'], ['GET', '/admin/inventory'], ['GET', '/admin/customers'],
    ['GET', '/admin/payments'], ['GET', '/admin/refunds'], ['GET', '/admin/notifications'],
    ['GET', '/admin/activity-logs'], ['GET', '/admin/settings'],
  ]
  for (const [m, p] of adminApis) {
    const r = await api(m, p, undefined, adminToken)
    record(`Admin API ${p}`, r.status === 200, `status=${r.status} ${r.data?.message || ''}`)
  }

  // Normal user must NOT access admin APIs
  const denied = await api('GET', '/admin/stats', undefined, token)
  record('Normal user blocked from admin API (403)', denied.status === 403, `status=${denied.status}`)

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n════════ ISSUES FOUND ════════')
  for (const it of issues) {
    console.log(`\n▶ ${it.route}`)
    for (const i of it.issues) console.log(`   [${i.kind}] ${i.text}`)
  }

  const fails = results.filter((r) => !r.pass)
  console.log(`\n════ RESULT: ${results.length - fails.length}/${results.length} passed, ${fails.length} failed ════`)
  await browser.close()
  process.exit(fails.length ? 1 : 0)
}

main().catch((e) => {
  console.error('TEST RUNNER ERROR:', e)
  process.exit(1)
})
