# 🔌 AquaPure — API Documentation

> **Last Updated:** 2026-07-17
> **Backend Status:** None (Static SPA)
> **External Integrations:** EmailJS

---

## 📋 Overview

AquaPure is a purely **client-side** application. There is no custom backend. All external communication is handled through **EmailJS** for the contact form.

---

## 📧 EmailJS Integration

**Service:** [EmailJS](https://www.emailjs.com/)
**SDK:** `@emailjs/browser`
**File:** `src/services/api/emailService.js`

### How It Works

1. User fills out the contact form on `/contact`
2. On submit, `emailService.sendContactEmail()` is called
3. EmailJS sends the email directly from the browser using the configured template
4. User receives success/error feedback via Toast notification

### Configuration

EmailJS requires three identifiers, all stored as environment variables:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_EMAILJS_SERVICE_ID` | Your email service ID | EmailJS Dashboard → Email Services |
| `VITE_EMAILJS_TEMPLATE_ID` | Your email template ID | EmailJS Dashboard → Email Templates |
| `VITE_EMAILJS_PUBLIC_KEY` | Your public/user key | EmailJS Dashboard → Account → API Keys |

### Environment Variables

```env
# .env.local (never commit this file)
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

### Email Service Module (Planned)

**File:** `src/services/api/emailService.js`

```js
// Planned implementation
import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Sends a contact form email via EmailJS.
 * @param {Object} formData
 * @param {string} formData.name - Sender's name
 * @param {string} formData.email - Sender's email address
 * @param {string} formData.phone - Sender's phone number
 * @param {string} formData.subject - Email subject
 * @param {string} formData.message - Message body
 * @returns {Promise} EmailJS response
 */
export async function sendContactEmail(formData) {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, formData, PUBLIC_KEY);
}
```

### EmailJS Template Parameters

The following template variables should be configured in your EmailJS template:

| Template Variable | Form Field | Description |
|-------------------|------------|-------------|
| `{{from_name}}` | Name | Sender's full name |
| `{{from_email}}` | Email | Sender's email |
| `{{phone}}` | Phone | Sender's phone number |
| `{{subject}}` | Subject | Enquiry subject |
| `{{message}}` | Message | Message content |
| `{{to_name}}` | — | Hardcoded: "AquaPure Team" |

### Setup Steps

1. Create a free account at [emailjs.com](https://www.emailjs.com)
2. Create a new **Email Service** (connect your Gmail/SMTP)
3. Create a new **Email Template** using the variables above
4. Copy your Service ID, Template ID, and Public Key
5. Add them to `.env.local`
6. Test using the contact form at `/contact`

### Rate Limits (Free Plan)

| Limit | Value |
|-------|-------|
| Monthly emails | 200 |
| Emails per second | 1 |
| Storage | — |

> Upgrade to a paid plan for higher volume. Document in DECISIONS.md if plan changes.

---

## 📦 Third-Party APIs / Services

| Service | Purpose | Docs |
|---------|---------|------|
| EmailJS | Contact form email delivery | https://www.emailjs.com/docs/ |
| Google Fonts | Inter font loading | https://fonts.google.com |
| Vercel | Hosting & deployment | https://vercel.com/docs |

---

## 🗄️ Static Data Layer

No database is used. All content is defined as JavaScript files in `src/data/`.

| File | Data Type | Used By |
|------|-----------|---------|
| `src/data/products.js` | Array of product objects | ProductsPage, ProductGrid |
| `src/data/testimonials.js` | Array of testimonial objects | TestimonialsSection |
| `src/data/team.js` | Array of team member objects | TeamSection |
| `src/data/gallery.js` | Array of gallery image objects | GalleryGrid |

### Data Schema Examples (Planned)

```js
// src/data/products.js
export const products = [
  {
    id: 'still-500ml',
    name: 'AquaPure Still Water',
    category: 'still',
    volume: '500ml',
    price: null, // contact for pricing
    description: 'Pure natural mineral water...',
    image: '/images/products/still-500ml.webp',
    features: ['BIS Certified', 'No added minerals', 'pH balanced'],
    badge: 'Bestseller',
  },
];

// src/data/testimonials.js
export const testimonials = [
  {
    id: 1,
    name: 'Ramesh Kumar',
    role: 'Restaurant Owner',
    avatar: '/images/avatars/ramesh.webp',
    rating: 5,
    text: 'The water quality is consistently excellent...',
  },
];
```

---

## 🔮 Future Backend Roadmap

> These are potential future additions if the project evolves beyond a static site.

| Feature | Technology | Priority | Notes |
|---------|-----------|----------|-------|
| Product enquiry API | Node.js + Express | Low | For bulk order quotes |
| CMS Integration | Contentful / Sanity | Medium | For content management |
| Analytics | Vercel Analytics | High | Zero-config, privacy-friendly |
| Blog/News | Contentful | Low | Future phase |

---

_Update this file whenever an API, integration, or data schema is added or changed._
