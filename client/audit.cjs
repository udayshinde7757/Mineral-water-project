/* Production-readiness audit: loads every route, captures console/page errors,
   failed requests, broken images, a11y holes, horizontal overflow at multiple
   viewports, and screenshots.  Run: node audit.cjs */
const { chromium } = require('playwright-core')
const fs = require('fs')

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const APP = 'http://localhost:5173'
const EMAIL = 'buynow.test.0801@gmail.com'
const PASS = 'testpass123'
const SHOT_DIR = 'audit-shots'

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/products', name: 'products' },
  { path: '/products/6a6394c9043c31017d0e444c', name: 'product-detail' },
  { path: '/gallery', name: 'gallery' },
  { path: '/contact', name: 'contact' },
  { path: '/enquiry', name: 'enquiry' },
  { path: '/login', name: 'login' },
  { path: '/signup', name: 'signup' },
  { path: '/cart', name: 'cart' },
  { path: '/checkout', name: 'checkout' },
  { path: '/my-orders', name: 'my-orders' },
  { path: '/does-not-exist', name: '404' },
]

if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR)

const report = {}

async function auditRoute(page, route, width) {
  const errors = []
  const badResponses = []
  const brokenImgs = []
  const consoleMsgs = []

  const onConsole = (m) => {
    const t = m.text()
    if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(`[${m.type()}] ${t.slice(0, 220)}`)
  }
  const onPageError = (e) => errors.push(`pageerror: ${e.message.slice(0, 300)}`)
  const onRequestFailed = (r) => {
    // ignore favicon/optional
    const url = r.url()
    if (url.includes('favicon')) return
    badResponses.push(`reqfail: ${r.failure()?.errorText || '?'} ${url.slice(0, 160)}`)
  }
  const onResponse = (res) => {
    if (res.status() >= 400 && !res.url().includes('localhost:5000/api')) {
      badResponses.push(`HTTP ${res.status()}: ${res.url().slice(0, 160)}`)
    }
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)
  page.on('requestfailed', onRequestFailed)
  page.on('response', onResponse)

  try {
    await page.goto(APP + route.path, { waitUntil: 'networkidle', timeout: 30000 })
  } catch (e) {
    errors.push(`goto: ${e.message.slice(0, 200)}`)
  }
  // allow framer-motion animations to settle
  await page.waitForTimeout(1500)

  // broken images
  const broken = await page.evaluate(() => {
    const out = []
    document.querySelectorAll('img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        out.push(img.getAttribute('src')?.slice(0, 140))
      }
    })
    return out
  })
  brokenImgs.push(...broken)

  // horizontal overflow
  const overflow = await page.evaluate(() => {
    const de = document.documentElement
    const sw = de.scrollWidth
    const cw = de.clientWidth
    if (sw > cw) {
      // find widest offender
      let offender = null
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.right > cw + 1 && r.width > 0) {
          if (!offender || r.width < offender.width) {
            offender = { cls: (el.className?.baseVal || el.className || '').toString().slice(0, 70), tag: el.tagName, right: Math.round(r.right), w: Math.round(r.width) }
          }
        }
      })
      return { scrollW: sw, clientW: cw, offender }
    }
    return null
  })

  // a11y snapshot
  const a11y = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')]
    const noAlt = imgs.filter((i) => !i.hasAttribute('alt')).length
    const links = [...document.querySelectorAll('a[href]')]
    const emptyLinks = links.filter((a) => (a.textContent || '').trim() === '' && !a.querySelector('img,svg')).length
    const buttons = [...document.querySelectorAll('button')]
    const emptyButtons = buttons.filter((b) => (b.textContent || '').trim() === '' && !b.querySelector('svg')).length
    const inputs = [...document.querySelectorAll('input,select,textarea')]
    const unlabeled = inputs.filter((i) => {
      if (i.type === 'hidden' || i.type === 'submit' || i.type === 'button') return false
      const id = i.id
      return !(document.querySelector(`label[for="${id}"]`) || i.closest('label') || i.getAttribute('aria-label') || i.getAttribute('placeholder'))
    }).length
    const h1s = document.querySelectorAll('h1').length
    const aBrokenHrefs = links.filter((a) => /^#|javascript:/.test(a.getAttribute('href')) && (a.textContent || '').trim() === '').length
    return { noAlt, emptyLinks, emptyButtons, unlabeled, h1s, totalImgs: imgs.length }
  })

  await page.screenshot({ path: `${SHOT_DIR}/${width}-${route.name}.png`, fullPage: true })

  page.removeListener('console', onConsole)
  page.removeListener('pageerror', onPageError)
  page.removeListener('requestfailed', onRequestFailed)
  page.removeListener('response', onResponse)

  return {
    route: route.path,
    width,
    errors: errors.slice(0, 10),
    consoleMsgs: consoleMsgs.slice(0, 12),
    badResponses: badResponses.slice(0, 10),
    brokenImgs,
    overflow,
    a11y,
  }
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const context = await browser.newContext()

  // login once
  const loginPage = await context.newPage()
  await loginPage.goto(APP + '/login')
  await loginPage.fill('input[name="email"]', EMAIL)
  await loginPage.fill('input[name="password"]', PASS)
  await loginPage.click('button[type="submit"]')
  await loginPage.waitForURL(APP + '/')
  await loginPage.close()

  // desktop audit of every route
  const page = await context.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })
  report.desktop = []
  for (const route of ROUTES) {
    const r = await auditRoute(page, route, '1440')
    report.desktop.push(r)
    const flag = r.errors.length || r.badResponses.length || r.brokenImgs.length || r.overflow ? '⚠' : 'ok'
    console.log(`${flag} ${route.name.padEnd(16)} errors=${r.errors.length} badReq=${r.badResponses.length} brokenImg=${r.brokenImgs.length} overflow=${r.overflow ? 'YES' : 'no'} h1=${r.a11y.h1s} noAlt=${r.a11y.noAlt} unlabeled=${r.a11y.unlabeled} emptyBtn=${r.a11y.emptyButtons}`)
    await page.goto(APP + '/')
  }
  await page.close()

  // mobile + tablet audit of key routes (home, products, product detail, gallery, contact, checkout)
  for (const vp of VIEWPORTS.filter((v) => v.name !== 'desktop')) {
    const p = await context.newPage()
    await p.setViewportSize({ width: vp.width, height: vp.height })
    report[vp.name] = []
    for (const route of ROUTES.slice(0, 6)) {
      const r = await auditRoute(p, route, vp.name)
      report[vp.name].push(r)
      if (r.overflow) console.log(`  ⚠ overflow @${vp.name} ${route.path}: scrollW=${r.overflow.scrollW} clientW=${r.overflow.clientW} offender=${r.overflow.offender?.tag}.${r.overflow.offender?.cls} right=${r.overflow.offender?.right}`)
      await p.goto(APP + '/')
    }
    await p.close()
  }

  await browser.close()
  fs.writeFileSync('audit-report.json', JSON.stringify(report, null, 2))
  console.log('\nReport saved to audit-report.json, screenshots in audit-shots/')
}

main().catch((e) => { console.error('AUDIT ERROR:', e); process.exit(1) })
