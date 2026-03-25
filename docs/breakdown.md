# Implementation Breakdown

**Project**: Simply Insilico — Public Marketing Website
**Date**: 2026-03-25
**Build Strategy**: Walking Skeleton — get a real, deployed site end-to-end first, then fill in remaining pages. Validates the full deployment pipeline and visual decisions before building out content pages.

---

## Milestone 1: Foundation — Working skeleton deployed to production

Delivers a live site at simplyinsilico.com with scaffolded structure, global layout, and the landing page. All downstream work builds on this.

| # | Unit | Requirements | Depends On | Jira Ticket |
|---|------|-------------|------------|-------------|
| 1 | Scaffold Next.js project with Tailwind, TypeScript, Framer Motion, Vitest | — | — | SIM-3 |
| 2 | Global layout: Navbar + Footer + route structure | REQ-5, REQ-7 | Unit 1 | SIM-4 |
| 3 | Static data layer: `products.ts`, `services.ts`, `contact.ts` type definitions | REQ-3, REQ-4, REQ-8 | Unit 1 | SIM-5 |
| 4 | Landing page with hero section and scroll animations | REQ-1, REQ-6, REQ-7 | Units 2, 3 | SIM-6 |
| 5 | Deploy to Vercel + connect `simplyinsilico.com` domain | — | Unit 4 | SIM-7 |

---

## Milestone 2: Core Pages — All pages live and navigable

Delivers the Services page, Products page, and Contact form. The site is feature-complete for launch.

| # | Unit | Requirements | Depends On | Jira Ticket |
|---|------|-------------|------------|-------------|
| 6 | Services page with service cards and CTA buttons | REQ-2, REQ-6, REQ-7 | M1 complete | SIM-8 |
| 7 | Products page with ProductCard component (FeedTheFamily card) | REQ-3, REQ-7, REQ-8 | M1 complete | SIM-9 |
| 8 | Contact page + Formspree-wired form with validation | REQ-4, REQ-7 | M1 complete | SIM-10 |
| 9 | Component tests: ProductCard, ContactForm, Navbar | — | Units 6–8 | SIM-11 |

---

## Backlog (Nice-to-Have)

- Blog listing page + individual post pages (NICE-1)
- `simplyinsilico.ai` domain alias evaluation (NICE-2)
- Analytics integration — Plausible or Google Analytics (NICE-3)
- Dark mode theme toggle (NICE-4)
