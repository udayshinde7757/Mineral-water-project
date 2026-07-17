# 🗺️ AquaPure — Routes Documentation

> **Last Updated:** 2026-07-17
> **Router:** React Router v6
> **Routing Mode:** Browser History (`BrowserRouter`)

---

## 📋 Current Routes

| Route | Page Component | File | Status | Notes |
|-------|---------------|------|--------|-------|
| `/` | `HomePage` | `src/pages/HomePage.jsx` | ⬜ Planned | Main landing page |
| `/about` | `AboutPage` | `src/pages/AboutPage.jsx` | ⬜ Planned | Company story & team |
| `/products` | `ProductsPage` | `src/pages/ProductsPage.jsx` | ⬜ Planned | Product catalogue |
| `/gallery` | `GalleryPage` | `src/pages/GalleryPage.jsx` | ⬜ Planned | Photo gallery |
| `/contact` | `ContactPage` | `src/pages/ContactPage.jsx` | ⬜ Planned | Contact form |
| `*` | `NotFoundPage` | `src/pages/NotFoundPage.jsx` | ⬜ Planned | 404 catch-all |

---

## 🔀 Router Configuration

**File:** `src/routes/AppRouter.jsx`

```jsx
// Planned structure
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from '@/components/layout/Layout';
import Spinner from '@/components/common/Spinner';
import { ROUTES } from '@/constants/routes';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.ABOUT} element={<AboutPage />} />
            <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
            <Route path={ROUTES.GALLERY} element={<GalleryPage />} />
            <Route path={ROUTES.CONTACT} element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

---

## 🔑 Route Constants

**File:** `src/constants/routes.js`

```js
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PRODUCTS: '/products',
  GALLERY: '/gallery',
  CONTACT: '/contact',
};
```

> Always use `ROUTES.X` constants instead of hardcoded strings to prevent typos and simplify future refactoring.

---

## 📄 Page Descriptions

### `/` — Home Page
- **Sections:** Hero, Features, Why Choose Us, Testimonials, Stats, CTA
- **SEO Title:** `AquaPure — Pure Natural Mineral Water`
- **Meta Description:** `Discover AquaPure's premium natural mineral water. Pure from source to bottle.`

### `/about` — About Page
- **Sections:** Company Story, Mission & Vision, Team, Stats Counter, Certificates
- **SEO Title:** `About AquaPure — Our Story & Mission`
- **Meta Description:** `Learn about AquaPure's journey, our commitment to purity, and the team behind the brand.`

### `/products` — Products Page
- **Sections:** Product Filter, Product Grid, Product Details
- **SEO Title:** `Products — AquaPure Mineral Water`
- **Meta Description:** `Explore AquaPure's full range of mineral water products — from personal bottles to bulk supplies.`

### `/gallery` — Gallery Page
- **Sections:** Gallery Filter, Gallery Grid, Lightbox
- **SEO Title:** `Gallery — AquaPure`
- **Meta Description:** `See AquaPure in action — our source, bottling process, and distribution.`

### `/contact` — Contact Page
- **Sections:** Contact Form, Business Info, Map
- **SEO Title:** `Contact AquaPure — Get in Touch`
- **Meta Description:** `Contact the AquaPure team for bulk orders, partnerships, or any enquiries.`

### `*` — 404 Not Found
- **SEO Title:** `Page Not Found — AquaPure`
- **Behavior:** Shows friendly 404 page with navigation back to Home

---

## 🔮 Future Routes (Planned)

| Route | Description | Priority |
|-------|-------------|----------|
| `/products/:id` | Individual product detail page | Medium |
| `/blog` | Company news and articles | Low |
| `/careers` | Job listings page | Low |
| `/privacy-policy` | Privacy policy page | Medium |
| `/terms` | Terms and conditions | Medium |

---

## 🔗 Navigation Links

Defined in `src/constants/index.js` for Navbar and Footer use:

```js
export const NAV_LINKS = [
  { label: 'Home', to: ROUTES.HOME },
  { label: 'About', to: ROUTES.ABOUT },
  { label: 'Products', to: ROUTES.PRODUCTS },
  { label: 'Gallery', to: ROUTES.GALLERY },
  { label: 'Contact', to: ROUTES.CONTACT },
];
```

---

_Update this file whenever a route is added, changed, or removed._
