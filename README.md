# 💧 AquaPure — Mineral Water Company Website

> A modern, responsive company website for AquaPure Mineral Water, built with React 19 + Vite + Tailwind CSS.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Commands](#development-commands)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Documentation Index](#documentation-index)

---

## 🌊 Project Overview

**AquaPure** is a full-featured, production-ready company website for a mineral water brand. It showcases the company's products, values, and story while providing a seamless contact experience powered by EmailJS.

### Key Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, features, CTA, testimonials |
| About | `/about` | Company story, mission, team |
| Products | `/products` | Product catalogue with details |
| Gallery | `/gallery` | Photo gallery with lightbox |
| Contact | `/contact` | Contact form via EmailJS |

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| UI Framework | React | 19.x |
| Build Tool | Vite | Latest |
| Styling | Tailwind CSS | 3.x |
| Routing | React Router | 6.x |
| Animations | Framer Motion | Latest |
| Icons | React Icons | Latest |
| Email | EmailJS | Latest |
| Linting | ESLint | Latest |
| Formatting | Prettier | Latest |
| Deployment | Vercel | — |

---

## 📁 Project Structure

```
SRS_MINERAL WATER/
├── .github/
│   └── workflows/          # CI/CD GitHub Actions
├── docs/
│   ├── architecture/       # Architecture decision records
│   ├── design/             # Design specs and mockups
│   ├── planning/           # Sprint and project planning
│   ├── meeting-notes/      # Team meeting notes
│   └── assets/
│       └── wireframes/     # UI wireframes
├── public/                 # Static public assets (favicon, robots.txt)
├── src/
│   ├── assets/             # Images, fonts, SVGs
│   ├── components/
│   │   ├── common/         # Reusable UI primitives (Button, Card, Badge)
│   │   ├── layout/         # Navbar, Footer, Layout wrapper
│   │   ├── home/           # Home-page-specific sections
│   │   ├── about/          # About-page-specific sections
│   │   ├── products/       # Product cards, filters, details
│   │   ├── gallery/        # Gallery grid, lightbox
│   │   └── contact/        # Contact form, map
│   ├── pages/              # Top-level route page components
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React context providers
│   ├── services/
│   │   └── api/            # API service modules (EmailJS, etc.)
│   ├── utils/              # Helper/utility functions
│   ├── constants/          # App-wide constants and enums
│   ├── routes/             # Route configuration
│   ├── styles/             # Global CSS, Tailwind config overrides
│   └── data/               # Static JSON/JS data files
├── ARCHITECTURE.md
├── API.md
├── BUGS.md
├── CHANGELOG.md
├── COMPONENTS.md
├── DECISIONS.md
├── DEPLOYMENT.md
├── PROGRESS.md
├── PROJECT_PLAN.md
├── PROMPTS.md
├── README.md
├── ROUTES.md
├── STYLE_GUIDE.md
├── TASKS.md
└── TODO.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18.x`
- npm `>= 9.x` or yarn `>= 1.22.x`
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/aquapure-website.git
cd aquapure-website

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Fill in your EmailJS credentials in .env.local

# 5. Start the development server
npm run dev
```

---

## 💻 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server (http://localhost:5173) |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on all source files |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without fixing |

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root (never commit this file):

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# App Config
VITE_APP_NAME=AquaPure
VITE_APP_URL=https://aquapure.vercel.app
```

> See [API.md](./API.md) for full API and environment variable documentation.

---

## 🤝 Contributing

This project follows a structured development workflow. Before contributing:

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design.
2. Read [STYLE_GUIDE.md](./STYLE_GUIDE.md) for coding and design standards.
3. Check [TASKS.md](./TASKS.md) for available tasks.
4. Follow the branching strategy: `feature/`, `fix/`, `chore/`, `docs/`.
5. Update all relevant markdown docs after your changes.

### Branching Convention
```
main          → Production-ready code
develop       → Active development branch
feature/xxx   → New features
fix/xxx       → Bug fixes
chore/xxx     → Tooling, deps, config changes
docs/xxx      → Documentation updates
```

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture & folder responsibilities |
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | Roadmap, milestones & timeline |
| [TASKS.md](./TASKS.md) | Master task checklist |
| [PROGRESS.md](./PROGRESS.md) | Completion tracking |
| [CHANGELOG.md](./CHANGELOG.md) | Change history |
| [COMPONENTS.md](./COMPONENTS.md) | Component documentation |
| [ROUTES.md](./ROUTES.md) | Route & page mapping |
| [STYLE_GUIDE.md](./STYLE_GUIDE.md) | Design tokens & coding standards |
| [API.md](./API.md) | API & EmailJS integration |
| [BUGS.md](./BUGS.md) | Bug tracker |
| [DECISIONS.md](./DECISIONS.md) | Architecture decision records |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment guide & checklist |
| [PROMPTS.md](./PROMPTS.md) | AI prompt history |
| [TODO.md](./TODO.md) | Immediate action items |

---

## 📄 License

MIT © 2026 AquaPure. All rights reserved.
