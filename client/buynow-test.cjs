/* Buy Now flow manual test suite (STEP 12). Run:  node buynow-test.cjs */
const { chromium } = require('playwright-core')

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const APP = 'http://localhost:5173'
const API = 'http://localhost:5000/api'
const EMAIL = 'buynow.test.0801@gmail.com'
const PASS = 'testpass123'

// Real product IDs from the running backend
const P = {
  A: { id: '6a6394c9043c31017d0e444c', name: 'AquaPure Personal Bottle' },
  B: { id: '6a6394c9043c31017d0e444d', name: 'AquaPure Pani pouch' },
  C: { id: '6a6394c9043c31017d0e444e', name: 'AquaPure Premium Everyday Bottle' },
  D: { id: '6a6394c9043c31017d0e444f', name: 'AquaPure Family Pack Bottle' },
  E: { id: '6a6394c9043c31017d0e4450', name: 'AquaPure Eco Handle Water Can' },
  F: { id: '6a6394c9043c31017d0e4451', name: 'AquaPure Heavy-Duty Dispenser Jar' },
  G: { id: '6a6394c9043c31017d0e4452', name: 'AquaPure Mini Event Party Pack (Box of 24)' },
  H: { id: '6a6394c9043c31017d0e4454', name: 'AquaPure Smart Dispenser Cooler Stand + 20L Jar' },
}

let token = null
const results = []

const api = async (method, path, body) => {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}
const getCart = () => api('GET', '/cart')
const setCart = async (ids) => {
  await api('DELETE', '/cart/clear')
  for (const id of ids) await api('POST', '/cart/add', { productId: id })
}

const record = (name, pass, extra = '') => {
  results.push({ name, pass, extra })
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
}

async function checkoutText(page) {
  await page.waitForURL('**/checkout')
  await page.waitForSelector('text=Checkout & Delivery', { timeout: 10000 })
  return page.evaluate(() => document.body.innerText)
}

// Place a COD order on the current checkout page
async function placeOrder(page) {
  await page.fill('input[name="fullName"]', 'BuyNow Tester')
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="phone"]', '9876543210')
  await page.fill('input[name="addressLine1"]', 'Flat 12, Water Street')
  await page.fill('input[name="city"]', 'Pune')
  await page.fill('input[name="state"]', 'Maharashtra')
  await page.fill('input[name="pincode"]', '411001')
  // COD is default payment method
  await page.click('button[type="submit"]')
  await page.waitForURL('**/order-success', { timeout: 15000 })
  await page.waitForSelector('text=Thank You for Your Order!', { timeout: 10000 })
}

async function clickBuyNow(page, name) {
  const card = page.locator('div.group', { hasText: name }).first()
  await card.locator('button:has-text("Buy Now")').click()
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  const logs = []
  page.on('console', (m) => {
    const t = m.text()
    if (t.includes('⚡') || t.includes('🛒') || t.includes('📤') || t.includes('🧹')) logs.push(t)
  })
  page.on('pageerror', (e) => console.log('  ⚠ PAGE ERROR:', e.message))

  // ── Login ──
  await page.goto(APP + '/login')
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="password"]', PASS)
  await page.click('button[type="submit"]')
  // Wait for login to fully complete (redirect to home) BEFORE navigating,
  // otherwise the token isn't set yet and /products bounces back to /login.
  await page.waitForURL(APP + '/', { timeout: 10000 })
  await page.goto(APP + '/products')
  await page.waitForSelector(`text=${P.A.name}`, { timeout: 15000 })
  token = await page.evaluate(() => localStorage.getItem('token'))
  console.log('Login OK, token:', token ? 'yes' : 'NO')

  // ================= TEST 1 =================
  // Cart: A + B.  Buy Now C → checkout shows ONLY C.
  await setCart([P.A.id, P.B.id])
  await page.goto(APP + '/products')
  await page.waitForSelector(`text=${P.C.name}`, { timeout: 10000 })
  await clickBuyNow(page, P.C.name)
  const t1 = await checkoutText(page)
  const t1ok =
    t1.includes(P.C.name) &&
    !t1.includes(P.A.name) &&
    !t1.includes(P.B.name)
  record('TEST 1 — cart A+B, Buy Now C → shows ONLY C', t1ok,
    t1ok ? 'C present, A/B absent' : `C=${t1.includes(P.C.name)} A=${t1.includes(P.A.name)} B=${t1.includes(P.B.name)}`)

  // ================= TEST 2 =================
  // Empty cart.  Buy Now D → checkout shows ONLY D.
  await api('DELETE', '/cart/clear')
  await page.goto(APP + '/products')
  await page.waitForSelector(`text=${P.D.name}`, { timeout: 10000 })
  await clickBuyNow(page, P.D.name)
  const t2 = await checkoutText(page)
  const t2ok = t2.includes(P.D.name) && !t2.includes(P.A.name) && !t2.includes(P.B.name) && !t2.includes(P.C.name)
  record('TEST 2 — empty cart, Buy Now D → shows ONLY D', t2ok,
    t2ok ? 'D present, no cart leakage' : `D=${t2.includes(P.D.name)}`)

  // ================= TEST 3 =================
  // Buy Now A, go back, Buy Now E → shows ONLY E (A must not appear).
  await page.goto(APP + '/products')
  await page.waitForSelector(`text=${P.A.name}`, { timeout: 10000 })
  await clickBuyNow(page, P.A.name)
  await checkoutText(page)
  await page.goBack() // back to products
  await page.waitForSelector(`text=${P.E.name}`, { timeout: 10000 })
  await clickBuyNow(page, P.E.name)
  const t3 = await checkoutText(page)
  const t3ok = t3.includes(P.E.name) && !t3.includes(P.A.name)
  record('TEST 3 — Buy Now A, back, Buy Now E → shows ONLY E', t3ok,
    t3ok ? 'E present, A absent' : `E=${t3.includes(P.E.name)} A=${t3.includes(P.A.name)}`)

  // ================= TEST 4 =================
  // Buy Now F → refresh checkout → safe redirect, never random products.
  await page.goto(APP + '/products')
  await page.waitForSelector(`text=${P.F.name}`, { timeout: 10000 })
  await clickBuyNow(page, P.F.name)
  const t4a = await checkoutText(page)
  const t4aok = t4a.includes(P.F.name)
  record('TEST 4a — Buy Now F shown before refresh', t4aok, t4aok ? 'F present' : 'F NOT present')
  await page.reload()
  // After refresh the in-memory Buy Now session is gone → checkout safely shows
  // the "Product Unavailable" empty state (NOT the checkout form, NOT any product).
  await page.waitForTimeout(1500)
  const t4 = await page.evaluate(() => document.body.innerText)
  const t4b =
    !t4.includes(P.F.name) &&
    !t4.includes(P.A.name) &&
    !t4.includes(P.B.name) &&
    !t4.includes(P.C.name) &&
    !t4.includes(P.D.name) &&
    (t4.includes('Product Unavailable') || t4.includes('no longer available'))
  record('TEST 4b — refresh → safe redirect (no wrong products)', t4b,
    t4b ? 'shows Product Unavailable, no products leaked' : `F=${t4.includes(P.F.name)}`)

  // ================= TEST 5 =================
  // Cart A+B.  Buy Now G → checkout ONLY G; cart unchanged in background.
  await setCart([P.A.id, P.B.id])
  await page.goto(APP + '/products')
  await page.waitForSelector(`text=${P.G.name}`, { timeout: 10000 })
  await clickBuyNow(page, P.G.name)
  const t5 = await checkoutText(page)
  const t5ok = t5.includes(P.G.name) && !t5.includes(P.A.name) && !t5.includes(P.B.name)
  record('TEST 5a — cart A+B, Buy Now G → checkout shows ONLY G', t5ok,
    t5ok ? 'G present, A/B absent' : `G=${t5.includes(P.G.name)} A=${t5.includes(P.A.name)} B=${t5.includes(P.B.name)}`)
  // Complete the Buy Now order, then verify cart still has A+B
  await placeOrder(page)
  const cartAfter = await getCart()
  const cartNames = (cartAfter.cart || []).map((i) => i.productId?.name)
  const t5b = cartAfter.cart?.length === 2 && cartNames.includes(P.A.name) && cartNames.includes(P.B.name)
  record('TEST 5b — cart unchanged after Buy Now order (A+B remain)', t5b,
    t5b ? `cart=[${cartNames.join(', ')}]` : `cart length=${cartAfter.cart?.length} names=${JSON.stringify(cartNames)}`)

  // ================= TEST 6 =================
  // (Already on order-success.) Return home → Buy Now another → old data cleared.
  await page.goto(APP + '/')
  await page.waitForSelector('text=Products', { timeout: 10000 })
  await page.goto(APP + '/products')
  await page.waitForSelector(`text=${P.B.name}`, { timeout: 10000 })
  await clickBuyNow(page, P.B.name)
  const t6 = await checkoutText(page)
  const t6ok = t6.includes(P.B.name) && !t6.includes(P.G.name) && !t6.includes(P.A.name)
  record('TEST 6 — after completed order → home → Buy Now B shows ONLY B', t6ok,
    t6ok ? 'B present, G/A absent (old data cleared)' : `B=${t6.includes(P.B.name)} G=${t6.includes(P.G.name)} A=${t6.includes(P.A.name)}`)

  // ================= TEST 7 =================
  // Repeat Buy Now on every product; verify clicked→checkout→order→DB IDs match.
  await page.goto(APP + '/products')
  await page.waitForSelector('text=AquaPure', { timeout: 10000 })
  let allMatch = true
  for (const key of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
    const prod = P[key]
    // fresh to a clean card each iteration
    await page.goto(APP + '/products')
    await page.waitForSelector(`text=${prod.name}`, { timeout: 10000 })
    await clickBuyNow(page, prod.name)
    const t = await checkoutText(page)
    const shown = t.includes(prod.name)
    // quantity should be 1 for card Buy Now
    const qtyOk = t.includes('× 1') || t.includes('x1') || /1 Item/.test(t)
    await placeOrder(page)
    // verify DB order
    const orders = await api('GET', '/orders')
    const last = orders.orders?.[0]
    const dbId = last?.products?.[0]?.productId
    const idMatch = String(dbId) === prod.id
    const thisOk = shown && idMatch
    if (!thisOk) allMatch = false
    console.log(`   🔎 ${prod.name}: shown=${shown} dbId=${dbId} expected=${prod.id} match=${idMatch}`)
    record(`TEST 7 — ${prod.name}`, thisOk, thisOk ? 'IDs match' : `shown=${shown} match=${idMatch}`)
    await page.goto(APP + '/products') // clear route state for next iteration
  }
  record('TEST 7 (aggregate) — clicked ID == checkout ID == order ID == DB ID for all products', allMatch)

  // ── Console check: no Buy Now errors ──
  const errors = logs.filter((l) => l.includes('error') || l.includes('Error'))
  record('Console — no Buy Now errors', errors.length === 0, errors.join(' | ') || 'clean')
  console.log('\n── Buy Now flow console logs captured ──')
  logs.forEach((l) => console.log('  ' + l))

  await browser.close()
  const fails = results.filter((r) => !r.pass)
  console.log(`\n════ RESULT: ${results.length - fails.length}/${results.length} passed ════`)
  process.exit(fails.length ? 1 : 0)
}

main().catch((e) => {
  console.error('TEST RUNNER ERROR:', e)
  process.exit(1)
})
