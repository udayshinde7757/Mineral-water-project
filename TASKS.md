# ✅ AquaPure — Master Task Checklist

> **Last Updated:** 2026-07-17
> Track every task here. Mark `[x]` when complete.

---

## 🏗️ Phase 1 — Project Foundation

### Project Initialization
- [x] Define tech stack and project requirements
- [x] Create complete folder structure
- [x] Create all documentation markdown files
- [ ] Initialize Vite + React 19 project (`npm create vite@latest`)
- [ ] Install all dependencies (Tailwind, Router, Framer Motion, Icons, EmailJS)
- [ ] Configure `tailwind.config.js`
- [ ] Configure `postcss.config.js`
- [ ] Configure `vite.config.js` with path aliases (`@/`)
- [ ] Configure `.eslintrc.cjs`
- [ ] Configure `.prettierrc`
- [ ] Create `.env.example`
- [ ] Create `.gitignore`

### Base Configuration
- [ ] Create `src/constants/theme.js` — colors, fonts, breakpoints
- [ ] Create `src/constants/routes.js` — route path constants
- [ ] Create `src/constants/index.js` — app-wide constants
- [ ] Create `src/styles/index.css` — Tailwind directives + global styles
- [ ] Create `src/routes/AppRouter.jsx` — main router configuration
- [ ] Create `src/main.jsx` — app entry point

### CI/CD
- [ ] Create `.github/workflows/ci.yml` — lint + build on push
- [ ] Create `.github/workflows/deploy.yml` — auto-deploy to Vercel

---

## 🧱 Phase 2 — Layout Components

### Layout
- [ ] `src/components/layout/Navbar.jsx` — responsive top navigation
- [ ] `src/components/layout/Footer.jsx` — site footer with links
- [ ] `src/components/layout/Layout.jsx` — wrapper with Navbar + Footer

### Common / Reusable
- [ ] `src/components/common/Button.jsx` — primary, secondary, outline variants
- [ ] `src/components/common/SectionHeading.jsx` — consistent section titles
- [ ] `src/components/common/Badge.jsx` — label/tag component
- [ ] `src/components/common/Card.jsx` — generic card wrapper
- [ ] `src/components/common/Spinner.jsx` — loading spinner
- [ ] `src/components/common/Modal.jsx` — reusable modal dialog
- [ ] `src/components/common/Toast.jsx` — success/error notifications
- [ ] `src/components/common/ScrollToTop.jsx` — scroll-to-top on route change

---

## 🏠 Phase 3 — Home Page

- [ ] `src/pages/HomePage.jsx`
- [ ] `src/components/home/HeroSection.jsx`
- [ ] `src/components/home/FeaturesSection.jsx`
- [ ] `src/components/home/WhyChooseUs.jsx`
- [ ] `src/components/home/TestimonialsSection.jsx`
- [ ] `src/components/home/CTABanner.jsx`
- [ ] `src/components/home/StatsSection.jsx`
- [ ] `src/data/testimonials.js`

---

## 🏢 Phase 4 — About Page

- [ ] `src/pages/AboutPage.jsx`
- [ ] `src/components/about/CompanyStory.jsx`
- [ ] `src/components/about/MissionVision.jsx`
- [ ] `src/components/about/TeamSection.jsx`
- [ ] `src/components/about/StatsCounter.jsx`
- [ ] `src/components/about/CertificatesSection.jsx`
- [ ] `src/data/team.js`

---

## 💧 Phase 5 — Products Page

- [ ] `src/pages/ProductsPage.jsx`
- [ ] `src/components/products/ProductGrid.jsx`
- [ ] `src/components/products/ProductCard.jsx`
- [ ] `src/components/products/ProductDetail.jsx`
- [ ] `src/components/products/ProductFilter.jsx`
- [ ] `src/data/products.js`

---

## 🖼️ Phase 6 — Gallery Page

- [ ] `src/pages/GalleryPage.jsx`
- [ ] `src/components/gallery/GalleryGrid.jsx`
- [ ] `src/components/gallery/GalleryCard.jsx`
- [ ] `src/components/gallery/LightboxModal.jsx`
- [ ] `src/components/gallery/GalleryFilter.jsx`
- [ ] `src/data/gallery.js`

---

## 📬 Phase 7 — Contact Page

- [ ] `src/pages/ContactPage.jsx`
- [ ] `src/components/contact/ContactForm.jsx`
- [ ] `src/components/contact/ContactInfo.jsx`
- [ ] `src/components/contact/MapEmbed.jsx`
- [ ] `src/services/api/emailService.js` — EmailJS integration
- [ ] `src/hooks/useContactForm.js` — form state & submission logic
- [ ] Form validation (required fields, email format)
- [ ] Success & error toast feedback

---

## 🎨 Phase 8 — Animations & Polish

- [ ] Page transition animations (Framer Motion `AnimatePresence`)
- [ ] Scroll-triggered section animations
- [ ] Navbar scroll behavior (shrink on scroll)
- [ ] Smooth scrolling between sections
- [ ] Image lazy loading
- [ ] Loading skeleton screens
- [ ] Hover micro-interactions on cards and buttons

---

## 📱 Phase 9 — Responsive & Accessibility

- [ ] Mobile layout QA (320px – 768px)
- [ ] Tablet layout QA (768px – 1024px)
- [ ] Desktop layout QA (1024px+)
- [ ] Keyboard navigation support
- [ ] ARIA labels on interactive elements
- [ ] Color contrast check (WCAG 2.1 AA)
- [ ] Focus indicators visible

---

## 🔍 Phase 10 — SEO & Performance

- [ ] `<title>` and `<meta description>` on every page
- [ ] Open Graph meta tags
- [ ] Twitter Card meta tags
- [ ] Canonical URLs
- [ ] `robots.txt`
- [ ] `sitemap.xml`
- [ ] Favicon set (16x16, 32x32, 180x180, SVG)
- [ ] Web App Manifest (`manifest.json`)
- [ ] Optimize all images (WebP format)
- [ ] Lighthouse audit — target score ≥ 90 all categories
- [ ] Bundle size analysis

---

## 🚀 Phase 11 — Deployment

- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables on Vercel dashboard
- [ ] Set up production domain
- [ ] Run `npm run build` — verify zero errors
- [ ] Deploy to Vercel
- [ ] Verify live site functionality
- [ ] Check contact form on production
- [ ] Final cross-device QA on production URL

---

## 📝 Post-Launch

- [ ] Monitor for console errors
- [ ] Set up Vercel Analytics
- [ ] Check Google Search Console indexing
- [ ] Write post-launch documentation

---

_Always update this file when a task is completed. Mark with `[x]`._
