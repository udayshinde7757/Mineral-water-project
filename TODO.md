# 📝 AquaPure — TODO

> **Last Updated:** 2026-07-17
> Quick-reference action items organized by urgency.

---

## ⚡ Immediate (Do First)

These tasks must be completed before any UI development can begin:

- [ ] Initialize Vite + React 19 project in the project root
- [ ] Install all npm dependencies:
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `react-router-dom`
  - `framer-motion`
  - `react-icons`
  - `@emailjs/browser`
  - `eslint`, `prettier`, `eslint-config-prettier`
- [ ] Configure `tailwind.config.js` with custom color palette and font
- [ ] Configure `vite.config.js` with `@/` path alias
- [ ] Set up `.eslintrc.cjs` and `.prettierrc`
- [ ] Create `.env.example` with all `VITE_*` keys documented
- [ ] Create `.gitignore` (node_modules, .env.local, dist)
- [ ] Create `src/constants/routes.js`
- [ ] Create `src/constants/index.js`
- [ ] Create `src/routes/AppRouter.jsx`
- [ ] Create `src/styles/index.css` with Tailwind directives
- [ ] Create `src/main.jsx`
- [ ] Verify `npm run dev` starts without errors

---

## 📅 Short-Term (This Week)

Once the foundation is in place:

- [ ] Build `Navbar` component with mobile hamburger menu
- [ ] Build `Footer` component
- [ ] Build `Layout` wrapper component
- [ ] Build common primitives: `Button`, `Card`, `SectionHeading`, `Spinner`
- [ ] Build `ScrollToTop` utility component
- [ ] Set up all page files as empty placeholders:
  - `HomePage.jsx`
  - `AboutPage.jsx`
  - `ProductsPage.jsx`
  - `GalleryPage.jsx`
  - `ContactPage.jsx`
  - `NotFoundPage.jsx`
- [ ] Verify routing works end-to-end (navigate to each page)

---

## 🔮 Future (Upcoming Phases)

- [ ] Build all Home page sections (Hero, Features, Testimonials, CTA)
- [ ] Build About page sections
- [ ] Build Products page with filter
- [ ] Build Gallery page with lightbox
- [ ] Build Contact form with EmailJS
- [ ] Add Framer Motion animations to all sections
- [ ] Responsive QA on all breakpoints
- [ ] SEO meta tags on all pages
- [ ] Deploy to Vercel
- [ ] Add custom domain

---

## 🚫 Blocked / Waiting

- [ ] **EmailJS Setup** — Waiting for company Gmail account credentials to configure EmailJS service
- [ ] **Product Images** — Waiting for product photography assets from client
- [ ] **Custom Domain** — Domain purchase/transfer pending

---

_Clear completed items from Immediate and Short-Term regularly. Move to TASKS.md when completed._
