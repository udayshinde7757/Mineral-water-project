const { chromium } = require('playwright-core')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const APP = 'http://localhost:5173'
const EMAIL = `dbg.${Date.now().toString().slice(-8)}@gmail.com`
const PASS = 'testpass123'
;(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('console', (m) => console.log(`[console.${m.type()}]`, m.text().slice(0, 200)))
  page.on('pageerror', (e) => console.log('[pageerror]', e.message))
  await page.goto(APP + '/signup', { waitUntil: 'networkidle' })
  await page.fill('input[name="fullname"]', 'Debug User')
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="password"]', PASS)
  await page.fill('input[name="confirmPassword"]', PASS)
  await page.click('button[type="submit"]')
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(1000)
    const url = page.url()
    const body = await page.evaluate(() => document.body.innerText.slice(0, 200))
    console.log(`t+${i + 1}s url=${url.replace(APP, '')} body=${JSON.stringify(body.slice(0, 90))}`)
    if (url === APP + '/') break
  }
  await browser.close()
})().catch((e) => { console.error('ERR', e.message); process.exit(1) })
