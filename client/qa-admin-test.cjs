/* Admin panel UI test: login → dashboard → create/edit/delete product (UI) →
 * order detail + status update (UI) → settings form loads. Run: node qa-admin-test.cjs */
const { chromium } = require('playwright-core')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const APP = 'http://localhost:5173'
const API = 'http://localhost:5000/api'
const ADMIN_EMAIL = 'admin@aquapure.com'
const ADMIN_PASS = 'Admin@123456'

const results = []
const record = (name, pass, extra = '') => {
  results.push({ name, pass })
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
}
const api = async (m, p, b, t) => {
  const r = await fetch(API + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: b ? JSON.stringify(b) : undefined })
  return { status: r.status, data: await r.json().catch(() => null) }
}

let browser, page
const TS = Date.now().toString().slice(-8)
const NAME = `QA UI Product ${TS}`

async function main() {
  browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const ctx = await browser.newContext()
  page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('dialog', (d) => d.accept().catch(() => {}))

  // ── 1. Admin login via UI ──
  console.log('═══ ADMIN LOGIN (UI) ═══')
  await page.goto(APP + '/admin/login', { waitUntil: 'networkidle' })
  await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[name="password"], input[type="password"]', ADMIN_PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/admin/dashboard', { timeout: 20000 }).catch((e) => console.log('  (nav wait):', e.message.split('\n')[0]))
  record('Admin login → dashboard', page.url().includes('/admin/dashboard'), `url=${page.url().replace(APP, '')}`)
  await page.waitForSelector('text=Dashboard', { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(2500)

  // ── 2. Dashboard renders stats ──
  const body = await page.evaluate(() => document.body.innerText)
  record('Dashboard shows revenue/order stats', /revenue|orders|products|customers/i.test(body), '')
  const adminToken = await page.evaluate(() => localStorage.getItem('token'))
  record('Admin token in localStorage', !!adminToken)

  // ── 3. Create product via UI ──
  console.log('═══ PRODUCT MANAGEMENT (UI) ═══')
  await page.goto(APP + '/admin/products', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Products', { timeout: 10000 }).catch(() => {})
  await page.click('button:has-text("Add New Product")')
  await page.waitForSelector('input[placeholder="e.g. AquaPure 1L Bottle"]', { timeout: 8000 })
  await page.fill('input[placeholder="e.g. AquaPure 1L Bottle"]', NAME)
  await page.fill('input[placeholder="e.g. 1 Litre, 20L Can"]', '1 Litre')
  await page.fill('input[placeholder="https://example.com/water.jpg"]', '/images/1ltr.png')
  await page.fill('input[type="number"] >> nth=0', '75') // price
  await page.fill('textarea', 'QA generated test product.')
  await page.click('button:has-text("Create Product")')
  await page.waitForTimeout(2500)
  const prodFound = await page.getByText(NAME, { exact: false }).count()
  record('Create product via UI', prodFound > 0, prodFound ? 'appears in list' : 'not in list')

  // verify via API
  const all = (await api('GET', '/admin/products?search=' + encodeURIComponent(NAME), undefined, adminToken)).data
  const created = all.products?.find((p) => p.name === NAME)
  record('Product persisted via API', !!created, created ? created._id : 'no match')
  const newId = created?._id

  // ── 4. Update product via UI (edit modal) ──
  if (newId) {
    const card = page.locator('div', { hasText: NAME }).first()
    await card.locator('button[title="Edit Product"], button:has-text("Edit")').first().click().catch(async () => {
      // fallback: click the edit icon on the row
      await card.locator('button').first().click()
    })
    await page.waitForTimeout(1500)
    await page.fill('input[placeholder="e.g. AquaPure 1L Bottle"]', NAME + ' EDITED')
    await page.click('button:has-text("Save Changes")')
    await page.waitForTimeout(2500)
    const upd = (await api('GET', '/admin/products?search=' + encodeURIComponent(NAME), undefined, adminToken)).data
    record('Update product via UI', upd.products?.some((p) => p.name === NAME + ' EDITED'), '')
  }

  // ── 5. Delete product via UI ──
  if (newId) {
    const delCard = page.locator('div', { hasText: NAME + ' EDITED' }).first()
    await delCard.locator('button[title="Delete Product"]').first().click()
    await page.waitForTimeout(2000)
    const del = (await api('GET', '/admin/products?search=' + encodeURIComponent(NAME), undefined, adminToken)).data
    record('Delete product via UI', !del.products?.some((p) => p.name.startsWith('QA UI Product')), del.products?.map(p => p.name).join(',') || 'gone')
  }

  // ── 6. Orders list + status update (UI) ──
  console.log('═══ ORDER MANAGEMENT (UI) ═══')
  // Create a fresh COD order so the status test is deterministic.
  const ts = Date.now().toString().slice(-8)
  const u = { fullname: 'Admin Test User', email: `adminui.${ts}@gmail.com`, password: 'testpass123' }
  const su = await api('POST', '/auth/signup', u)
  const uToken = su.data.token
  const prods = (await api('GET', '/products')).data.products
  await api('POST', '/cart/add', { productId: prods[0]._id }, uToken)
  const ord = await api('POST', '/orders', {
    products: [{ productId: prods[0]._id, quantity: 1 }],
    shippingAddress: { fullName: 'Admin Test User', email: u.email, phone: '9876543210', addressLine1: 'Flat 1', city: 'Nagpur', state: 'MH', pincode: '440001', country: 'India' },
    paymentMethod: 'COD',
  }, uToken)
  const freshOrderId = ord.data.order?._id
  record('Fresh order created for admin UI test', !!freshOrderId)

  await page.goto(APP + '/admin/orders', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Orders', { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(2000)
  const orderRows = await page.locator('a[href*="/admin/orders/"], tr, tbody tr').count()
  record('Admin orders list loads', orderRows > 0, `${orderRows} rows`)

  if (freshOrderId) {
    await page.goto(APP + '/admin/orders/' + freshOrderId, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2500)
    const odBody = await page.evaluate(() => document.body.innerText)
    record('Order detail page renders', odBody.includes('Order') && odBody.includes('Total'), '')
    const statusSelect = page.locator('select').first()
    if (await statusSelect.count()) {
      const current = await statusSelect.inputValue()
      const next = current === 'Delivered' ? 'Confirmed' : 'Delivered'
      await statusSelect.selectOption(next).catch(() => {})
      await page.waitForTimeout(1200)
      const saveBtn = page.locator('button:has-text("Update & Notify")')
      if (await saveBtn.count()) {
        await saveBtn.click()
        await page.waitForTimeout(3000)
        const od = await api('GET', `/admin/orders/${freshOrderId}`, undefined, adminToken)
        record('Admin updates order status via UI', od.data.order?.orderStatus === next, `→ persisted=${od.data.order?.orderStatus}`)
      } else {
        record('Admin updates order status via UI', false, 'save button not found')
      }
    } else {
      record('Admin updates order status via UI', false, 'no status select found')
    }
  }

  // ── 7. Settings form loads with DB values ──
  console.log('═══ SETTINGS (UI) ═══')
  const settings = (await api('GET', '/admin/settings', undefined, adminToken)).data
  await page.goto(APP + '/admin/settings', { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Settings', { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(2000)
  const setBody = await page.evaluate(() => document.body.innerText)
  record('Settings page renders', setBody.length > 300, '')
  const dc = await page.locator('input[value]').count()
  record('Settings form has editable fields', dc > 0, `${dc} inputs`)

  // ── console errors ──
  const real = errors.filter((e) => !/favicon/.test(e))
  record('No console/page errors during admin flow', real.length === 0, real.join(' | ').slice(0, 200))

  const fails = results.filter((r) => !r.pass)
  console.log(`\n════ RESULT: ${results.length - fails.length}/${results.length} passed, ${fails.length} failed ════`)
  await browser.close()
  process.exit(fails.length ? 1 : 0)
}
main().catch((e) => { console.error('RUNNER ERROR:', e); process.exit(1) })
