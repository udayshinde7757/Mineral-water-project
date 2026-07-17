# 🏛️ AquaPure — Architecture Document

> **Last Updated:** 2026-07-17
> **Version:** 1.0.0
> **Status:** Approved

---

## 📖 Overview

AquaPure is a **client-side Single Page Application (SPA)** built with React 19 and Vite. It uses React Router 6 for client-side routing, Tailwind CSS for styling, Framer Motion for animations, and EmailJS for contact form delivery.

There is no backend server. All data is either:
- **Static** — defined as JavaScript data files in `src/data/`
- **Third-party** — EmailJS for form submissions

---

## 🗂️ Folder Responsibilities

```
src/
├── assets/             Static files bundled by Vite (images, SVGs, fonts)
├── components/         UI components organized by feature domain
│   ├── common/         Domain-agnostic, reusable primitives (Button, Card, Modal)
│   ├── layout/         App shell components (Navbar, Footer, Layout)
│   ├── home/           Components used exclusively on the Home page
│   ├── about/          Components used exclusively on the About page
│   ├── products/       Components used exclusively on the Products page
│   ├── gallery/        Components used exclusively on the Gallery page
│   └── contact/        Components used exclusively on the Contact page
├── pages/              Top-level page components rendered by the router
├── hooks/              Custom React hooks (business logic extraction)
├── context/            React Context providers (global state)
├── services/
│   └── api/            Service modules abstracting external API calls (EmailJS)
├── utils/              Pure helper functions (formatters, validators, etc.)
├── constants/          App-wide constants, enums, theme tokens, route paths
├── routes/             Router configuration (AppRouter.jsx)
├── styles/             Global CSS, Tailwind directives, CSS custom properties
└── data/               Static data files (products, team, testimonials, gallery)
```

---

## 🔌 Routing Architecture

React Router 6 with a **centralized router** approach.

```
AppRouter.jsx (routes/AppRouter.jsx)
└── <BrowserRouter>
    └── <Layout> (Navbar + Footer wrapper)
        ├── / → HomePage
        ├── /about → AboutPage
        ├── /products → ProductsPage
        ├── /gallery → GalleryPage
        ├── /contact → ContactPage
        └── * → NotFoundPage
```

All route paths are defined as constants in `src/constants/routes.js` to prevent magic strings.

```js
// src/constants/routes.js
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PRODUCTS: '/products',
  GALLERY: '/gallery',
  CONTACT: '/contact',
};
```

---

## 🧩 Component Architecture

### Hierarchy Model
```
Page (pages/)
  └── Section (components/<domain>/)
        └── Common UI (components/common/)
```

### Design Principles
1. **Single Responsibility** — Each component does one thing well.
2. **Composition over Inheritance** — Compose complex UIs from simple primitives.
3. **Co-location** — Keep styles, logic, and markup together in the component file.
4. **Props over Global State** — Use props for component-local data; use Context only for truly global state.
5. **Custom Hooks** — Extract complex logic (form handling, API calls) into `src/hooks/`.

---

## 🔄 Data Flow

```
Static Data Files (src/data/)
        │
        ▼
   Page Component (src/pages/)
        │
        ├─► Section Component (src/components/<domain>/)
        │         │
        │         └─► Common Component (src/components/common/)
        │
        └─► Custom Hook (src/hooks/)  ◄──► EmailJS Service (src/services/api/)
```

### State Management Strategy

| State Type | Solution |
|------------|----------|
| UI state (open/closed, active tab) | `useState` in component |
| Form state | `useState` + custom hook (`useContactForm`) |
| Shared UI preferences (theme) | React Context |
| Server/external data | N/A — all static |

---

## 📏 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component files | PascalCase | `HeroSection.jsx` |
| Hook files | camelCase, `use` prefix | `useContactForm.js` |
| Context files | PascalCase + `Context` | `ThemeContext.jsx` |
| Service files | camelCase + `Service` | `emailService.js` |
| Data files | camelCase | `products.js` |
| Constant files | camelCase | `routes.js` |
| Utility files | camelCase | `validators.js` |
| CSS classes | Tailwind utility + BEM for custom | `hero__title` |
| Environment vars | `VITE_` prefix, SCREAMING_SNAKE | `VITE_EMAILJS_SERVICE_ID` |

---

## 🎨 Styling Architecture

- **Framework:** Tailwind CSS v3
- **Global Styles:** `src/styles/index.css` — Tailwind directives + CSS custom properties
- **Component Styles:** Inline Tailwind utility classes (no separate `.module.css` files)
- **Custom Tokens:** Defined in `tailwind.config.js` extending the default theme
- **Animations:** Framer Motion `motion` components for layout animations; Tailwind `transition` utilities for simple hover effects

### CSS Custom Properties (Design Tokens)
```css
:root {
  --color-primary: #0ea5e9;    /* Sky Blue — brand primary */
  --color-secondary: #0284c7;  /* Deeper Blue — brand secondary */
  --color-accent: #38bdf8;     /* Light Blue — accents */
  --font-sans: 'Inter', sans-serif;
}
```

---

## 📦 Third-Party Dependencies

| Package | Purpose | Impact |
|---------|---------|--------|
| `react@19` | UI framework | Core |
| `react-dom@19` | DOM rendering | Core |
| `react-router-dom@6` | Client-side routing | Core |
| `tailwindcss@3` | Utility-first CSS | Core |
| `framer-motion` | Animation library | UI |
| `react-icons` | SVG icon sets | UI |
| `@emailjs/browser` | Contact form email delivery | Service |

---

## 🔒 Security Considerations

1. **EmailJS keys** — Always stored in `.env.local`, never committed. Exposed only as `VITE_` prefix in the browser (acceptable for EmailJS public key).
2. **Form validation** — Client-side validation on all form inputs before submission.
3. **No backend** — No server-side vulnerabilities; XSS risks are minimal in a static SPA.

---

## ⚡ Performance Strategy

1. **Code splitting** — Vite automatically splits bundles per route.
2. **Lazy loading** — `React.lazy()` + `Suspense` for page components.
3. **Image optimization** — WebP format, proper `width`/`height` attributes, lazy loading.
4. **Font loading** — Use `font-display: swap` and preload critical fonts.
5. **Bundle analysis** — `vite-bundle-visualizer` for identifying large dependencies.

---

_Update this document whenever significant architectural decisions are made._
