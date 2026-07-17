# 📐 AquaPure — Architecture Decision Records (ADR)

> **Last Updated:** 2026-07-17
> Document every significant technical or design decision made during development.
> Once recorded, decisions should not be deleted — only superseded.

---

## ADR Format

```
## ADR-XXX: Decision Title

| Field | Value |
|-------|-------|
| ID | ADR-XXX |
| Date | YYYY-MM-DD |
| Status | Proposed / Accepted / Deprecated / Superseded by ADR-YYY |
| Decider | Name / Team |

### Context
Why was this decision necessary? What problem were we solving?

### Decision
What was decided?

### Rationale
Why was this option chosen over alternatives?

### Alternatives Considered
What other options were evaluated?

### Consequences
What are the positive and negative outcomes of this decision?
```

---

## ADR-001: React 19 as UI Framework

| Field | Value |
|-------|-------|
| ID | ADR-001 |
| Date | 2026-07-17 |
| Status | ✅ Accepted |
| Decider | Project Lead |

### Context
Need a modern, component-based UI framework for building a responsive company website.

### Decision
Use **React 19** as the UI framework.

### Rationale
- Industry-standard framework with vast ecosystem
- React 19 brings improved performance with the new compiler and server component architecture
- Large talent pool and strong community support
- Compatible with all chosen dependencies (Router, Framer Motion, etc.)

### Alternatives Considered
| Alternative | Reason Not Chosen |
|------------|-------------------|
| Vue 3 | Smaller ecosystem, less familiar to wider dev community |
| Angular | Over-engineered for a marketing website |
| Next.js | Overkill; no SSR needed for a company brochure site |
| Svelte | Smaller ecosystem; less tooling maturity |

### Consequences
- ✅ Huge ecosystem and community support
- ✅ Excellent performance with Vite bundler
- ✅ All target packages support React 19
- ⚠️ SPA means no SSR; SEO must be handled via meta tags

---

## ADR-002: Vite as Build Tool

| Field | Value |
|-------|-------|
| ID | ADR-002 |
| Date | 2026-07-17 |
| Status | ✅ Accepted |
| Decider | Project Lead |

### Context
Need a modern, fast build tool that supports React and Tailwind out of the box.

### Decision
Use **Vite** as the build tool and dev server.

### Rationale
- Near-instant dev server startup (ESM-native)
- Blazing fast Hot Module Replacement (HMR)
- Built-in React plugin support
- Production builds are highly optimized via Rollup
- First-class Tailwind CSS support

### Alternatives Considered
| Alternative | Reason Not Chosen |
|------------|-------------------|
| Create React App | Deprecated; very slow build times |
| Webpack | Complex configuration; slower HMR |
| Parcel | Good but less ecosystem support than Vite |

### Consequences
- ✅ Extremely fast development experience
- ✅ Optimized production bundles
- ✅ Path alias support (`@/` → `src/`)

---

## ADR-003: Tailwind CSS as Styling Solution

| Field | Value |
|-------|-------|
| ID | ADR-003 |
| Date | 2026-07-17 |
| Status | ✅ Accepted |
| Decider | Project Lead |

### Context
Need a styling approach that enables rapid UI development with consistent design tokens.

### Decision
Use **Tailwind CSS v3** as the primary styling solution.

### Rationale
- Utility-first approach eliminates context-switching between JS and CSS
- Tailwind's design token system enforces consistency
- PurgeCSS integration means zero unused CSS in production
- Excellent responsive design utilities

### Alternatives Considered
| Alternative | Reason Not Chosen |
|------------|-------------------|
| CSS Modules | More boilerplate; no shared design tokens out of the box |
| Styled Components | Runtime overhead; CSS-in-JS hydration issues |
| Sass/SCSS | Manual token management; more verbose |
| Chakra UI | Too opinionated; heavier bundle size |

### Consequences
- ✅ Rapid UI development
- ✅ Consistent design system via `tailwind.config.js`
- ✅ Near-zero unused CSS in production
- ⚠️ JSX can become verbose with many utility classes; extract to components

---

## ADR-004: React Router v6 for Client-Side Routing

| Field | Value |
|-------|-------|
| ID | ADR-004 |
| Date | 2026-07-17 |
| Status | ✅ Accepted |
| Decider | Project Lead |

### Context
The app needs multi-page navigation without full page reloads.

### Decision
Use **React Router v6** with `BrowserRouter` and nested `<Outlet>` layout pattern.

### Rationale
- React Router is the de facto standard for React SPAs
- v6 API is simpler and more declarative than v5
- `<Outlet>` pattern cleanly separates layout from page components
- Code splitting with `React.lazy()` integrates seamlessly

### Consequences
- ✅ Clean, declarative routing
- ✅ Easy code splitting per route
- ✅ Layout wrapper pattern avoids repeating Navbar/Footer in every page

---

## ADR-005: Framer Motion for Animations

| Field | Value |
|-------|-------|
| ID | ADR-005 |
| Date | 2026-07-17 |
| Status | ✅ Accepted |
| Decider | Project Lead |

### Context
Need professional, smooth animations for page transitions, scroll reveals, and micro-interactions.

### Decision
Use **Framer Motion** for all declarative animations.

### Rationale
- Most powerful and expressive React animation library
- `AnimatePresence` enables smooth route transition animations
- `useInView` hook for scroll-triggered animations
- Respects `prefers-reduced-motion` accessibility preference
- Declarative API fits React's component model

### Consequences
- ✅ Professional-grade animations with minimal effort
- ✅ Accessibility-conscious (reduced motion support)
- ⚠️ Adds ~40KB to bundle; acceptable for this project

---

## ADR-006: EmailJS for Contact Form

| Field | Value |
|-------|-------|
| ID | ADR-006 |
| Date | 2026-07-17 |
| Status | ✅ Accepted |
| Decider | Project Lead |

### Context
Need to send contact form submissions to a company email without building a backend server.

### Decision
Use **EmailJS** to send emails directly from the browser.

### Rationale
- No backend required — works entirely from the frontend
- Free tier (200 emails/month) sufficient for a company contact form
- Simple integration with React
- Secure: public key is designed for browser use

### Alternatives Considered
| Alternative | Reason Not Chosen |
|------------|-------------------|
| Formspree | Less control over email template |
| Custom Node.js API | Over-engineering for current scope |
| Netlify Forms | Tied to Netlify deployment |

### Consequences
- ✅ Zero backend required
- ✅ Easy to set up and maintain
- ⚠️ Free plan limited to 200 emails/month
- ⚠️ Public key visible in browser (acceptable for EmailJS)

---

## ADR-007: Vercel for Deployment

| Field | Value |
|-------|-------|
| ID | ADR-007 |
| Date | 2026-07-17 |
| Status | ✅ Accepted |
| Decider | Project Lead |

### Context
Need a production hosting platform optimized for SPA deployments.

### Decision
Deploy on **Vercel**.

### Rationale
- Zero-config deployment for Vite/React projects
- Automatic HTTPS and CDN
- GitHub integration for automatic deployments on push
- Free tier is generous for a company website
- Built-in analytics available
- Excellent performance (Edge Network)

### Consequences
- ✅ Zero-config deployment
- ✅ Automatic CI/CD on every git push
- ✅ Global CDN for fast load times
- ✅ Environment variables management in dashboard

---

_Add a new ADR whenever a significant decision is made. Never delete existing ADRs._
