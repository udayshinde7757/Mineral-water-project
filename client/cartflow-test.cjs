/* Cart-flow + alternate Buy Now entry-point tests. Run:  node cartflow-test.cjs */
const { chromium } = require('playwright-core')

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const APP = 'http://localhost:5173'
const API = 'http://localhost:5000/api'
const EMAIL = 'buynow.test.0801@gmail.com'
const PASS = 'testpass123'

const P = {
  A: { id: '6a6394c9043c31017d0e444c', name: 'AquaPure Personal Bottle' },
  B: { id: '6a6394c9043c31017d0e444d', name: 'AquaPure Pani pouch' },
  C: { id: '6a6394c9043c31017d0e444e', name: 'AquaPure Premium Everyday Bottle' },
  D: { id: '6a6394c9043c31017d0e444f', name: 'AquaPure Family Pack Bottle' },
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
const setCart = async (ids) => {
  await api('DELETE', '/cart/clear')
  for (const id of ids) await api('POST', '/cart/add', { productId: id })
}
const record = (name, pass, extra = '') => {
  results.push({ name, pass })
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'}  ${name}${extra ? '  — ' + extra : ''}`)
}
const bodyText = () => page.evaluate(() => document.body.innerText)

async function clickBuyNow(page, name) {
  const card = page.locator('div.group', { hasText: name }).first()
  await card.locator('button:has-text("Buy Now")').click()
}
async function placeOrder(page) {
  await page.fill('input[name="fullName"]', 'BuyNow Tester')
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="phone"]', '9876543210')
  await page.fill('input[name="addressLine1"]', 'Flat 12, Water Street')
  await page.fill('input[name="city"]', 'Pune')
  await page.fill('input[name="state"]', 'Maharashtra')
  await page.fill('input[name="pincode"]', '411001')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/order-success', { timeout: 15000 })
  await page.waitForSelector('text=Thank You for Your Order!', { timeout: 10000 })
}

let page
async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const context = await browser.newContext()
  page = await context.newPage()

  await page.goto(APP + '/login')
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="password"]', PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL(APP + '/')
  token = await page.evaluate(() => localStorage.getItem('token'))
  console.log('Login OK, token:', token ? 'yes' : 'NO')

  // ═══ CART CHECKOUT FLOW (regression — must still work) ═══
  // 1. Cart A+B. 2. Do a Buy Now C first (leaves buyNow state). 3. Then cart
  // checkout → must show A+B, never C (old bug: stale buyNow hijacked it).
  await setCart([P.A.id, P.B.id])
  await page.goto(APP + '/products')
  await page.waitForSelector(`text=${P.C.name}`, { timeout: 10000 })
  await clickBuyNow(page, P.C.name)
  await page.waitForURL('**/checkout')
  await page.waitForSelector('text=Checkout & Delivery')
  const buynowShown = (await bodyText()).includes(P.C.name)
  record('Pre — Buy Now C shown in its own checkout', buynowShown, buynowShown ? 'C present' : 'C absent')

  // Leave checkout via browser back → cart checkout
  await page.goBack()
  await page.waitForSelector(`text=${P.C.name}`, { timeout: 10000 })
  await page.goto(APP + '/cart')
  await page.waitForSelector('text=Shopping Cart', { timeout: 10000 })
  await page.click('button:has-text("Proceed to Checkout")')
  await page.waitForURL('**/checkout')
  await page.waitForSelector('text=Checkout & Delivery')
  const tCart = await bodyText()
  const cartOk = tCart.includes(P.A.name) && tCart.includes(P.B.name) && !tCart.includes(P.C.name)
  record('Cart checkout — cart A+B shows A+B, NOT stale Buy Now C', cartOk,
    cartOk ? 'A+B present, C absent' : `A=${tCart.includes(P.A.name)} B=${tCart.includes(P.B.name)} C=${tCart.includes(P.C.name)}`)

  // Complete the CART order → cart must be CLEARED (orderType=CART)
  await placeOrder(page)
  const cartAfter = await api('GET', '/cart')
  const cleared = (cartAfter.cart || []).length === 0
  record('Cart checkout — cart cleared after CART order', cleared,
    cleared ? 'cart empty' : `cart length=${cartAfter.cart?.length}`)

  // ═══ ProductDetailsPage main Buy Now button with quantity ═══
  await page.goto(APP + '/products/' + P.A.id)
  await page.waitForSelector('text=Buy Now', { timeout: 10000 })
  // increment quantity twice → qty 3
  await page.locator('button:has-text("+")').first().click()
  await page.locator('button:has-text("+")').first().click()
  await page.locator('button:has-text("Buy Now")').first().click()
  await page.waitForURL('**/checkout')
  await page.waitForSelector('text=Checkout & Delivery')
  const tDtl = await bodyText()
  const dtlOk = tDtl.includes(P.A.name) && tDtl.includes('× 3')
  record('Details page Buy Now (qty 3) → checkout shows A × 3', dtlOk,
    dtlOk ? 'A present × 3' : `A=${tDtl.includes(P.A.name)} qty3=${tDtl.includes('× 3')}`)

  // ═══ Related products Buy Now (previously set state but never navigated) ═══
  await page.goBack() // leave checkout
  await page.waitForSelector('text=Buy Now', { timeout: 10000 })
  // click Buy Now on the related "Family Pack Bottle" card (only exists in related section on A's page)
  const relCard = page.locator('div.group', { hasText: P.D.name }).first()
  await relCard.locator('button:has-text("Buy Now")').click()
  await page.waitForURL('**/checkout')
  await page.waitForSelector('text=Checkout & Delivery')
  const tRel = await bodyText()
  const relOk = tRel.includes(P.D.name) && !tRel.includes(P.A.name)
  record('Related products Buy Now D → navigates & shows D only', relOk,
    relOk ? 'D present, A absent' : `D=${tRel.includes(P.D.name)} A=${tRel.includes(P.A.name)}`)

  // ═══ HomePage Buy Now (was a crash — no onBuyNow prop passed) ═══
  await page.goto(APP + '/')
  await page.waitForSelector('text=Shop Now', { timeout: 10000 })
  // HomePage shows the first 4 featured products; click Buy Now on the first
  // card shown (proves the HomePage card no longer crashes — it used to get no
  // onBuyNow prop).
  const homeCard = page.locator('div.group').first()
  const homeName = (await homeCard.locator('h3').first().innerText()).trim()
  await homeCard.locator('button:has-text("Buy Now")').click()
  await page.waitForURL('**/checkout')
  await page.waitForSelector('text=Checkout & Delivery')
  const tHome = await bodyText()
  const homeOk = tHome.includes(homeName)
  record(`HomePage Buy Now "${homeName}" → checkout shows it (no crash)`, homeOk, homeOk ? 'present' : `absent: ${homeName}`)

  // ═══ Direct /checkout URL with empty cart & no buy now → safe empty state ═══
  await setCart([])
  await page.goto(APP + '/checkout')
  await page.waitForTimeout(1500)
  const tDirect = await bodyText()
  // Either empty-state variant is SAFE — "cart empty" or "product unavailable".
  // The critical invariant: NO product names may ever leak onto the page.
  const directOk =
    (tDirect.includes('Your cart is empty') || tDirect.includes('Product Unavailable')) &&
    !tDirect.includes(P.A.name) &&
    !tDirect.includes(P.B.name) &&
    !tDirect.includes(P.C.name) &&
    !tDirect.includes(P.D.name)
  record('Direct /checkout (no cart, no buy now) → safe empty state', directOk,
    directOk ? 'safe empty state, no products leaked' : `cartEmpty=${tDirect.includes('Your cart is empty')} prodUnavail=${tDirect.includes('Product Unavailable')}`)

  await browser.close()
  const fails = results.filter((r) => !r.pass)
  console.log(`\n════ RESULT: ${results.length - fails.length}/${results.length} passed ════`)
  process.exit(fails.length ? 1 : 0)
}

main().catch((e) => {
  console.error('TEST RUNNER ERROR:', e)
  process.exit(1)
})
