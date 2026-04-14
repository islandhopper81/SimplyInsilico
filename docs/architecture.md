# Architecture

**Project**: Simply Insilico — Public Marketing Website
**Date**: 2026-03-25
**Status**: Decided

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 (App Router) | React-based, file-based routing, static site generation, and MDX support for the future blog — all with minimal configuration |
| Language | TypeScript | Catches errors in component props and static data shapes early; already preferred by the developer |
| Styling | Tailwind CSS | Utility-first, responsive design is straightforward, no CSS file sprawl, integrates cleanly with shadcn/ui |
| Animations | Framer Motion | Best-in-class scroll animations for React; `whileInView` handles fade-in/slide-in with minimal code |
| Component Library | shadcn/ui | Accessible, unstyled components (Card, Button, Form, Nav) that are copied into the repo — fully owned, Tailwind-native |
| Contact Form | Formspree | Handles form submissions with no custom backend; routes submissions directly to the owner's email |
| Hosting | Vercel | Zero-config deployment for Next.js, free tier covers a marketing site, automatic preview deploys on PRs, custom domain support |
| Analytics | Vercel Analytics | Cookieless, privacy-friendly page view and web vitals tracking; no consent banner required; enabled via `@vercel/analytics` |
| Testing | Vitest + React Testing Library | Fast, Jest-compatible test runner; RTL for testing component behavior over implementation details |

## System Design

```
Browser
  └── Next.js App (statically generated)
        ├── /                  Landing page
        ├── /services          Services page
        ├── /products          Products page (card grid)
        └── /contact           Contact page + form
                                    │
                                    └── Formspree API ──→ Owner's email

Product cards
  ├── External products (e.g., FeedTheFamily) → external URL
  └── Internal products (future) → /products/{slug}
```

Content is stored as static TypeScript data files in `src/data/`. No database and
no API routes are needed at launch. All pages are statically generated at build time.

### Data Flow — Contact Form

1. User fills out the contact form on `/contact`
2. Form submits a POST to the Formspree endpoint (configured in `src/data/contact.ts`)
3. Formspree delivers the submission to the owner's email
4. User sees a success/error message rendered client-side via form state

### Data Flow — Products Page

1. `src/data/products.ts` defines the product list (name, tagline, image path, url, isExternal)
2. `/products/page.tsx` imports and maps over the list to render `ProductCard` components
3. Clicking a card navigates to `url` — external links open in a new tab, internal links use Next.js `<Link>`

## Directory Structure

```
SimplyInsilico/
├── public/                        # Static assets served at root
│   ├── images/
│   │   └── products/              # Product card images
│   └── favicon.ico
├── src/
│   ├── app/                       # Next.js App Router — one folder per route
│   │   ├── layout.tsx             # Root layout (Navbar, Footer, global styles)
│   │   ├── page.tsx               # Landing page (/)
│   │   ├── services/
│   │   │   └── page.tsx           # Services page (/services)
│   │   ├── products/
│   │   │   └── page.tsx           # Products page (/products)
│   │   └── contact/
│   │       └── page.tsx           # Contact page (/contact)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/                    # shadcn/ui copied components (Button, Card, etc.)
│   │   └── sections/              # Page-specific sections
│   │       ├── HeroSection.tsx
│   │       ├── ProductCard.tsx
│   │       ├── ServiceCard.tsx
│   │       └── ContactForm.tsx
│   ├── data/                      # Static content as TypeScript objects
│   │   ├── products.ts            # Product list
│   │   ├── services.ts            # Services list
│   │   └── contact.ts             # Formspree endpoint and contact config
│   └── lib/                       # Utility functions (e.g., cn() for Tailwind class merging)
├── docs/
│   ├── requirements.md
│   └── architecture.md
├── CLAUDE.md
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Testing Approach

- **Unit tests**: Pure utility functions in `src/lib/`
- **Component tests**: Key components — `ProductCard`, `ContactForm` (validation logic), `Navbar` — using React Testing Library
- **What is NOT tested at launch**: Full page render E2E flows (Playwright deferred until site has more complexity)
- **Test location**: Colocated as `*.test.tsx` files next to the component, or in `__tests__/` subdirectories for larger suites
- **Test runner**: Vitest with `@testing-library/react` and `@testing-library/jest-dom`

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` | Framework (v14+) |
| `react` / `react-dom` | UI runtime |
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `framer-motion` | Scroll animations |
| `@testing-library/react` | Component testing |
| `@testing-library/jest-dom` | DOM matchers for tests |
| `vitest` | Test runner |
| `@vercel/analytics` | Vercel Analytics script injector for page view and web vitals tracking |
| `clsx` + `tailwind-merge` | Tailwind class merging utility (used by shadcn/ui) |

## Environment Variables

These must be set in the Vercel project dashboard before deploying. `NEXT_PUBLIC_` variables are baked into the build at compile time — changing them in Vercel requires a redeploy to take effect.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Yes | The Formspree form endpoint URL (e.g., `https://formspree.io/f/xxxxxxxx`). Found in the Formspree dashboard under your form's integration settings. If this is missing or incorrect, the contact form will silently fail — submissions will POST to a relative URL instead of Formspree. |

## Architecture Decisions Log

### Next.js over plain Vite + React
Next.js was chosen over a plain Vite+React SPA because the PRD includes a future blog
requirement. Next.js MDX support makes adding blog pages a natural extension of the
existing routing structure, requiring no architectural changes. A plain SPA would require
retrofitting a routing and rendering approach for blog content later.

### Vercel over AWS for hosting
AWS was available but Vercel was chosen for its zero-configuration Next.js deployment,
free tier generosity for a low-traffic marketing site, and automatic preview deploys on
pull requests. AWS remains available for future products (e.g., FeedTheFamily) that need
more infrastructure. This keeps operational complexity low for a simple static site.

### Formspree over a custom backend for contact form
The PRD explicitly ruled out a custom backend. Formspree handles spam filtering, email
delivery, and submission storage on its free tier. This is revisable if submission volume
or data requirements grow.

### shadcn/ui over a traditional component library (e.g., MUI, Chakra)
shadcn/ui components are copied into the repo rather than imported as a package
dependency. This means the code is fully owned and customizable without fighting library
theming systems. It is Tailwind-native, avoiding a two-styling-system problem.
