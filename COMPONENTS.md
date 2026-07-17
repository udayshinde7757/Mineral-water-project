# 🧩 AquaPure — Component Documentation

> **Last Updated:** 2026-07-17
> Register every component here immediately after creation.

---

## 📋 Registry Format

Each component entry follows this format:

```
### ComponentName
| Field | Value |
|-------|-------|
| File | `src/components/<domain>/ComponentName.jsx` |
| Purpose | What this component renders and why |
| Props | List of props with types and defaults |
| Dependencies | Other components, hooks, or packages used |
| Reusable | Yes / No — can be used in other page contexts |
| Status | Planned / In Progress / Complete |
```

---

## 🏗️ Layout Components

> Components that form the persistent app shell.

### Layout
| Field | Value |
|-------|-------|
| File | `src/components/layout/Layout.jsx` |
| Purpose | Wraps all pages with Navbar and Footer; handles page structure |
| Props | `children: ReactNode` |
| Dependencies | `Navbar`, `Footer`, `ScrollToTop` |
| Reusable | Yes — used by all routes via React Router `<Outlet>` |
| Status | Planned |

---

### Navbar
| Field | Value |
|-------|-------|
| File | `src/components/layout/Navbar.jsx` |
| Purpose | Responsive top navigation bar with logo, nav links, mobile hamburger menu |
| Props | None (reads from `ROUTES` constants) |
| Dependencies | `react-router-dom`, `react-icons`, `framer-motion`, `ROUTES` constants |
| Reusable | No — app-level singleton |
| Status | Planned |

---

### Footer
| Field | Value |
|-------|-------|
| File | `src/components/layout/Footer.jsx` |
| Purpose | Site footer with logo, nav links, social icons, copyright |
| Props | None |
| Dependencies | `react-router-dom`, `react-icons`, `ROUTES` constants |
| Reusable | No — app-level singleton |
| Status | Planned |

---

## 🔧 Common / Reusable Components

> Domain-agnostic UI primitives used across multiple pages.

### Button
| Field | Value |
|-------|-------|
| File | `src/components/common/Button.jsx` |
| Purpose | Styled button with `primary`, `secondary`, and `outline` variants |
| Props | `children`, `variant: 'primary'\|'secondary'\|'outline'`, `onClick`, `disabled`, `type`, `className`, `to` (for link-as-button) |
| Dependencies | `framer-motion` (hover/tap animation), `react-router-dom` (optional `Link`) |
| Reusable | ✅ Yes |
| Status | Planned |

---

### SectionHeading
| Field | Value |
|-------|-------|
| File | `src/components/common/SectionHeading.jsx` |
| Purpose | Consistent section title + subtitle layout used across all pages |
| Props | `title: string`, `subtitle?: string`, `align?: 'left'\|'center'\|'right'` |
| Dependencies | None |
| Reusable | ✅ Yes |
| Status | Planned |

---

### Badge
| Field | Value |
|-------|-------|
| File | `src/components/common/Badge.jsx` |
| Purpose | Small label chip for product categories, status indicators, tags |
| Props | `label: string`, `color?: string`, `className?: string` |
| Dependencies | None |
| Reusable | ✅ Yes |
| Status | Planned |

---

### Card
| Field | Value |
|-------|-------|
| File | `src/components/common/Card.jsx` |
| Purpose | Generic card wrapper with hover shadow and border |
| Props | `children`, `className?: string`, `onClick?: fn` |
| Dependencies | `framer-motion` (hover scale) |
| Reusable | ✅ Yes |
| Status | Planned |

---

### Spinner
| Field | Value |
|-------|-------|
| File | `src/components/common/Spinner.jsx` |
| Purpose | Animated loading spinner for async states |
| Props | `size?: 'sm'\|'md'\|'lg'`, `color?: string` |
| Dependencies | None |
| Reusable | ✅ Yes |
| Status | Planned |

---

### Modal
| Field | Value |
|-------|-------|
| File | `src/components/common/Modal.jsx` |
| Purpose | Accessible modal dialog with overlay backdrop and close button |
| Props | `isOpen: boolean`, `onClose: fn`, `children`, `title?: string` |
| Dependencies | `framer-motion` (enter/exit animation), `react-icons` |
| Reusable | ✅ Yes |
| Status | Planned |

---

### Toast
| Field | Value |
|-------|-------|
| File | `src/components/common/Toast.jsx` |
| Purpose | Success/error notification with auto-dismiss |
| Props | `message: string`, `type: 'success'\|'error'\|'info'`, `onClose: fn` |
| Dependencies | `framer-motion`, `react-icons` |
| Reusable | ✅ Yes |
| Status | Planned |

---

### ScrollToTop
| Field | Value |
|-------|-------|
| File | `src/components/common/ScrollToTop.jsx` |
| Purpose | Scrolls window to top on every route change |
| Props | None |
| Dependencies | `react-router-dom` (`useLocation`) |
| Reusable | ✅ Yes |
| Status | Planned |

---

## 🏠 Home Page Components

### HeroSection
| Field | Value |
|-------|-------|
| File | `src/components/home/HeroSection.jsx` |
| Purpose | Full-viewport hero with headline, subheadline, CTA buttons, and background |
| Props | None (self-contained) |
| Dependencies | `Button`, `framer-motion` |
| Reusable | No |
| Status | Planned |

---

### FeaturesSection
| Field | Value |
|-------|-------|
| File | `src/components/home/FeaturesSection.jsx` |
| Purpose | Grid of feature cards highlighting water purity, certifications, etc. |
| Props | None |
| Dependencies | `SectionHeading`, `Card`, `react-icons`, `framer-motion` |
| Reusable | No |
| Status | Planned |

---

### WhyChooseUs
| Field | Value |
|-------|-------|
| File | `src/components/home/WhyChooseUs.jsx` |
| Purpose | Side-by-side content block with benefits list and supporting image |
| Props | None |
| Dependencies | `SectionHeading`, `react-icons` |
| Reusable | No |
| Status | Planned |

---

### TestimonialsSection
| Field | Value |
|-------|-------|
| File | `src/components/home/TestimonialsSection.jsx` |
| Purpose | Customer testimonial carousel/grid |
| Props | None |
| Dependencies | `SectionHeading`, `src/data/testimonials.js`, `framer-motion` |
| Reusable | No |
| Status | Planned |

---

### CTABanner
| Field | Value |
|-------|-------|
| File | `src/components/home/CTABanner.jsx` |
| Purpose | Full-width call-to-action section with gradient background |
| Props | None |
| Dependencies | `Button` |
| Reusable | No |
| Status | Planned |

---

### StatsSection
| Field | Value |
|-------|-------|
| File | `src/components/home/StatsSection.jsx` |
| Purpose | Animated count-up stat numbers (years, customers, products, etc.) |
| Props | None |
| Dependencies | `framer-motion`, static data |
| Reusable | No |
| Status | Planned |

---

## 🏢 About Page Components

> _(To be documented when Phase 4 begins)_

---

## 💧 Products Page Components

> _(To be documented when Phase 5 begins)_

---

## 🖼️ Gallery Page Components

> _(To be documented when Phase 6 begins)_

---

## 📬 Contact Page Components

> _(To be documented when Phase 7 begins)_

---

_Always update this file when a new component is created, modified, or removed._
