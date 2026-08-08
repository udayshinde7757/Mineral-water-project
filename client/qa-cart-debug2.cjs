const { chromium } = require('playwright-core')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const APP = 'http://localhost:5173'
const API = 'http://localhost:5000/api'
const EMAIL = 'qa.user.0807@gmail.com'
const PASS = 'testpass123'
;(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const login = await fetch(API + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PASS }) })
  const token = (await login.json()).token
  // products[0] as the smoke test sees it
  const prod = await (await fetch(API + '/products')).json()
  const p0 = prod.products[0]
  console.log('products[0]:', p0.name, p0._id)
  // add to cart
  const add = await fetch(API + '/cart/add', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId: p0._id }) })
  console.log('add status:', add.status)
  // cart via API
  const cart = await (await fetch(API + '/cart', { headers: { Authorization: `Bearer ${token}` } })).json()
  console.log('cart items:', cart.cart?.map(i => i.productId?.name))
  // load /cart page
  await page.goto(APP + '/login')
  await page.evaluate((t) => localStorage.setItem('token', t), token)
  await page.goto(APP + '/cart', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  const body = await page.evaluate(() => document.body.innerText)
  console.log('PAGE contains p0 name:', body.includes(p0.name))
  // find elements matching via getByText
  const count = await page.getByText(p0.name, { exact: false }).count()
  console.log('getByText count:', count)
  const h3s = await page.locator('h3').allTextContents().catch(() => [])
  console.log('h3 texts:', JSON.stringify(h3s.slice(0, 10)))
  // dump a body snippet
  const idx = body.indexOf('Shopping Cart')
  console.log('BODY after Shopping Cart:', JSON.stringify(body.slice(idx, idx + 600)))
  await browser.close()
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })
