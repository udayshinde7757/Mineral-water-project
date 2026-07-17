# 🎨 AquaPure — Style Guide

> **Last Updated:** 2026-07-17
> **CSS Framework:** Tailwind CSS v3
> **Design System:** Custom tokens built on Tailwind's extended theme

---

## 🎨 Color Palette

### Brand Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Primary | `#0EA5E9` | `sky-500` | CTAs, active links, highlights |
| Primary Dark | `#0284C7` | `sky-600` | Hover state for primary |
| Primary Light | `#38BDF8` | `sky-400` | Accents, decorative elements |
| Secondary | `#0F172A` | `slate-900` | Headings, dark text |
| Background | `#F0F9FF` | `sky-50` | Page background (light sections) |
| Surface | `#FFFFFF` | `white` | Card backgrounds |
| Border | `#E0F2FE` | `sky-100` | Card borders, dividers |

### Semantic Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Success | `#22C55E` | `green-500` | Form success, positive states |
| Error | `#EF4444` | `red-500` | Form errors, warnings |
| Warning | `#F59E0B` | `amber-500` | Caution states |
| Info | `#3B82F6` | `blue-500` | Informational messages |

### Text Colors

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| Text Primary | `#0F172A` | `slate-900` | Headings, main body |
| Text Secondary | `#475569` | `slate-600` | Subtitles, descriptions |
| Text Muted | `#94A3B8` | `slate-400` | Placeholder, disabled |
| Text Inverse | `#FFFFFF` | `white` | Text on dark backgrounds |

### Gradient Definitions

```css
/* Hero Gradient */
background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 50%, #0F172A 100%);

/* Section Accent Gradient */
background: linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%);

/* CTA Banner Gradient */
background: linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%);
```

---

## 🔤 Typography

### Font Families

| Role | Font | Import |
|------|------|--------|
| Primary (Sans) | Inter | Google Fonts |
| Display (Headings) | Inter | Google Fonts |
| Monospace | JetBrains Mono | Google Fonts (code blocks only) |

**Google Fonts Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
```

### Type Scale

| Name | Size | Weight | Tailwind | Usage |
|------|------|--------|----------|-------|
| Display XL | 64px / 4rem | 800 | `text-6xl font-extrabold` | Hero headline |
| Display L | 48px / 3rem | 700 | `text-5xl font-bold` | Page titles |
| Heading 1 | 36px / 2.25rem | 700 | `text-4xl font-bold` | Section headings |
| Heading 2 | 30px / 1.875rem | 600 | `text-3xl font-semibold` | Sub-section titles |
| Heading 3 | 24px / 1.5rem | 600 | `text-2xl font-semibold` | Card titles |
| Body Large | 18px / 1.125rem | 400 | `text-lg` | Lead paragraphs |
| Body | 16px / 1rem | 400 | `text-base` | General body text |
| Body Small | 14px / 0.875rem | 400 | `text-sm` | Captions, metadata |
| Caption | 12px / 0.75rem | 400 | `text-xs` | Labels, badges |

---

## 📐 Spacing System

Tailwind's default 4px base unit. Common usage:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Micro-spacing (icon gap) |
| `space-2` | 8px | Tight spacing (badge padding) |
| `space-4` | 16px | Default element spacing |
| `space-6` | 24px | Component internal padding |
| `space-8` | 32px | Section gap |
| `space-12` | 48px | Large section padding |
| `space-16` | 64px | Section vertical padding |
| `space-24` | 96px | Hero padding |

**Section Padding Standard:** `py-16 md:py-24`
**Container Max-Width:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

---

## 🔘 Button Styles

### Primary Button
```
Background: sky-500 → sky-600 (hover)
Text: white
Padding: px-8 py-3
Border Radius: rounded-full
Font: font-semibold
Transition: 200ms ease
Shadow: shadow-lg shadow-sky-500/30
```

### Secondary Button
```
Background: transparent
Text: sky-500
Border: 2px solid sky-500 → sky-600 (hover)
Background (hover): sky-50
Padding: px-8 py-3
Border Radius: rounded-full
Font: font-semibold
```

### Outline Button (Inverse — on dark backgrounds)
```
Background: transparent
Text: white
Border: 2px solid white/60 → white (hover)
Padding: px-8 py-3
Border Radius: rounded-full
Font: font-semibold
```

---

## 🃏 Card Styles

### Standard Card
```
Background: white
Border: 1px solid sky-100
Border Radius: rounded-2xl
Shadow: shadow-sm → shadow-md (hover)
Padding: p-6
Transition: 200ms ease
```

### Feature Card
```
Background: white → sky-50 (hover)
Border: 1px solid sky-100
Border Radius: rounded-2xl
Shadow: shadow-sm
Icon: sky-500, size 40px
Padding: p-8
```

---

## 🏞️ Layout Grid

| Breakpoint | Prefix | Min Width | Container Width |
|------------|--------|-----------|----------------|
| Mobile | (none) | 0 | 100% |
| Small | `sm:` | 640px | 640px |
| Medium | `md:` | 768px | 768px |
| Large | `lg:` | 1024px | 1024px |
| Extra Large | `xl:` | 1280px | 1280px |
| 2X Large | `2xl:` | 1536px | 1536px |

**Feature Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
**Product Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
**Gallery Grid:** `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`

---

## ✨ Animation Standards

### Framer Motion Variants

```js
// Fade In (used for sections)
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Stagger Children (used for grids)
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// Scale In (used for cards)
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};
```

### Transition Durations
| Type | Duration | Usage |
|------|----------|-------|
| Micro | 150ms | Button hover color |
| Fast | 200ms | Card hover shadow/scale |
| Normal | 300ms | Modal open/close |
| Slow | 500ms | Section fade-in on scroll |
| Page | 400ms | Page transition |

---

## 🖼️ Icons

**Library:** React Icons

**Icon Sets Used:**
- `HiOutline*` — Heroicons Outline (primary icon set for UI)
- `FiFeather*` — Feather Icons (alternative for light strokes)
- `MdOutline*` — Material Design (for specific product icons)
- `FaDroplet` — FontAwesome (brand water drop icon)

**Standard Icon Size:**
| Context | Size (px) | Tailwind |
|---------|-----------|----------|
| Inline text icon | 18 | `text-lg` |
| Feature card icon | 32 | `text-3xl` |
| Hero decorative | 48 | `text-5xl` |
| Nav icon | 20 | `text-xl` |

---

## ♿ Accessibility Standards

- **Color Contrast:** Minimum 4.5:1 ratio for body text (WCAG 2.1 AA)
- **Focus Styles:** Visible outline on all interactive elements (`:focus-visible`)
- **Keyboard Navigation:** All interactive elements reachable by keyboard
- **ARIA Labels:** All icons without adjacent text must have `aria-label`
- **Semantic HTML:** Use `<main>`, `<nav>`, `<section>`, `<article>`, `<header>`, `<footer>`
- **Image Alt Text:** All images must have descriptive `alt` attributes
- **Reduced Motion:** Respect `prefers-reduced-motion` in Framer Motion animations

---

## 📝 Code Style

- **Quotes:** Single quotes in JavaScript; double quotes in JSX attributes
- **Semicolons:** Yes (enforced by Prettier)
- **Indentation:** 2 spaces
- **Line Length:** Max 100 characters
- **Component Structure Order:**
  1. Imports
  2. Constants / static data
  3. Type definitions (if any)
  4. Component function
  5. Styled subcomponents (if needed)
  6. Default export

---

_This guide is the source of truth for all visual and coding decisions._
