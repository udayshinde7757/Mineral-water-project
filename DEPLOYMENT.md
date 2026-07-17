# 🚀 AquaPure — Deployment Guide

> **Last Updated:** 2026-07-17
> **Platform:** Vercel
> **Target URL:** https://aquapure.vercel.app (or custom domain)

---

## 📋 Pre-Deployment Checklist

Complete every item before deploying to production.

### ✅ Code Quality
- [ ] `npm run lint` — zero ESLint errors
- [ ] `npm run format:check` — all files are properly formatted
- [ ] No `console.log` statements in production code
- [ ] No hardcoded secrets or API keys in source code
- [ ] All `TODO` code comments resolved or documented in `TODO.md`

### ✅ Build Verification
- [ ] `npm run build` — completes without errors or warnings
- [ ] `npm run preview` — production preview works correctly
- [ ] All routes navigate correctly in the preview build
- [ ] Contact form works in the preview build (uses production EmailJS keys)
- [ ] No broken images or 404 asset errors in the console

### ✅ Functionality
- [ ] Home page loads and all sections are visible
- [ ] About page loads correctly
- [ ] Products page loads, filter works
- [ ] Gallery page loads, lightbox opens
- [ ] Contact form submits successfully (real email received)
- [ ] 404 page shows for unknown routes
- [ ] All navigation links work
- [ ] Mobile navigation (hamburger menu) works

### ✅ Performance (Run Lighthouse)
- [ ] Performance score ≥ 90
- [ ] Accessibility score ≥ 90
- [ ] Best Practices score ≥ 90
- [ ] SEO score ≥ 90

### ✅ SEO
- [ ] Unique `<title>` on every page
- [ ] Unique `<meta name="description">` on every page
- [ ] Open Graph tags on every page (`og:title`, `og:description`, `og:image`, `og:url`)
- [ ] Twitter Card meta tags
- [ ] `robots.txt` present in `public/`
- [ ] `sitemap.xml` present in `public/`
- [ ] Favicon configured (multiple sizes + SVG)
- [ ] `manifest.json` configured

### ✅ Accessibility
- [ ] All images have `alt` text
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] All interactive elements keyboard-accessible
- [ ] ARIA labels on icon-only buttons

### ✅ Responsive
- [ ] Tested at 320px (mobile minimum)
- [ ] Tested at 768px (tablet)
- [ ] Tested at 1024px (laptop)
- [ ] Tested at 1440px (desktop)
- [ ] Tested at 1920px (large desktop)

---

## 🔑 Environment Variables

**On Vercel Dashboard → Project → Settings → Environment Variables:**

| Variable | Environment | Value |
|----------|-------------|-------|
| `VITE_EMAILJS_SERVICE_ID` | Production, Preview | Your EmailJS Service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | Production, Preview | Your EmailJS Template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | Production, Preview | Your EmailJS Public Key |
| `VITE_APP_NAME` | All | `AquaPure` |
| `VITE_APP_URL` | Production | `https://your-domain.com` |

> ⚠️ **Never commit `.env.local` to version control.**
> Vite's `VITE_` prefix makes variables available in the browser bundle — this is intentional for EmailJS public keys.

---

## 🚀 Vercel Deployment Steps

### First-Time Deployment

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "feat: initial production-ready build"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the project root as the source directory

3. **Configure Build Settings** (Vercel auto-detects Vite)
   | Setting | Value |
   |---------|-------|
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |

4. **Add Environment Variables**
   - In Vercel dashboard → Project → Settings → Environment Variables
   - Add all `VITE_*` variables listed above

5. **Deploy**
   - Click **Deploy**
   - Wait for build to complete
   - Verify the generated Vercel URL

### Subsequent Deployments
Push to `main` → Vercel automatically deploys.

Push to any other branch → Vercel creates a preview deployment.

---

## 🌐 Custom Domain Setup

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `aquapure.in`)
3. Update DNS records with your domain registrar:
   - **Type:** CNAME
   - **Name:** `www`
   - **Value:** `cname.vercel-dns.com`
4. Add an A record for the apex domain:
   - **Type:** A
   - **Name:** `@`
   - **Value:** `76.76.19.19`
5. Wait for DNS propagation (up to 48 hours)
6. Vercel automatically issues an SSL certificate

---

## 🔁 CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

```yaml
# Planned GitHub Actions CI
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run build
```

---

## 🔄 Rollback Procedure

If a bad deployment reaches production:

1. Go to Vercel Dashboard → Project → Deployments
2. Find the last known good deployment
3. Click **...** → **Promote to Production**
4. Investigate the bad deployment in a branch environment
5. Fix the issue, open a PR, and redeploy

---

## 📊 Post-Deployment Monitoring

- [ ] Check Vercel Analytics dashboard for Core Web Vitals
- [ ] Check Vercel Function logs (if any serverless functions are added)
- [ ] Submit sitemap to Google Search Console
- [ ] Verify site is indexable (`site:yourdomain.com` in Google)
- [ ] Set up uptime monitoring (e.g., UptimeRobot — free tier)

---

_Update this file whenever deployment configuration or procedures change._
