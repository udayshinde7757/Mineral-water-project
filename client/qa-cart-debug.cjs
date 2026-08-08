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
  const lt = await login.json()
  const token = lt.token
  const cartRes = await fetch(API + '/cart', { headers: { Authorization: `Bearer ${token}` } })
  const cart = await cartRes.json()
  console.log('CART API items:', cart.cart?.length, JSON.stringify(cart.cart?.map(i => ({ name: i.productId?.name, qty: i.quantity }))))
  const prod = await (await fetch(API + '/products')).json()
  const pid = prod.products[0]._id
  await fetch(API + '/cart/add', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId: pid }) })
  await page.goto(APP + '/login')
  await page.evaluate((t) => localStorage.setItem('token', t), token)
  await page.goto(APP + '/cart', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  const body = await page.evaluate(() => document.body.innerText)
  console.log('CART PAGE body snippet:', JSON.stringify(body.slice(0, 500)))
  console.log('contains product name:', body.includes(prod.products[0].name.slice(0, 15)))
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
