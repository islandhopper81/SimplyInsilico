# Implementation Breakdown

**Project**: Simply Insilico — Public Marketing Website
**Date**: 2026-03-25
**Build Strategy**: Foundation first, then deploy once the site is presentable. SIM-7 (Deploy to Vercel) moved to end of Milestone 2 so the real domain is only connected once all pages are complete.

---

## Milestone 1: Foundation — Scaffolded structure, global layout, and landing page

Delivers the scaffolded Next.js project, global layout, static data layer, and landing page. All content pages build on this.

| # | Unit | Requirements | Depends On | Jira Ticket |
|---|------|-------------|------------|-------------|
| 1 | Scaffold Next.js project with Tailwind, TypeScript, Framer Motion, Vitest | — | — | SIM-3 |
| 2 | Global layout: Navbar + Footer + route structure | REQ-5, REQ-7 | Unit 1 | SIM-4 |
| 3 | Static data layer: `products.ts`, `services.ts`, `contact.ts` type definitions | REQ-3, REQ-4, REQ-8 | Unit 1 | SIM-5 |
| 4 | Landing page with hero section and scroll animations | REQ-1, REQ-6, REQ-7 | Units 2, 3 | SIM-6 |

---

## Milestone 2: Core Pages — All pages live, then deploy

Delivers the Services page, Products page, Contact form, tests, and finally the production deployment. The site is feature-complete before going live.

| # | Unit | Requirements | Depends On | Jira Ticket |
|---|------|-------------|------------|-------------|
| 5 | Services page with service cards and CTA buttons | REQ-2, REQ-6, REQ-7 | M1 complete | SIM-8 |
| 6 | Products page with ProductCard component (FeedTheFamily card) | REQ-3, REQ-7, REQ-8 | M1 complete | SIM-9 |
| 7 | Contact page + Formspree-wired form with validation | REQ-4, REQ-7 | M1 complete | SIM-10 |
| 8 | Component tests: ProductCard, ContactForm, Navbar | — | Units 5–7 | SIM-11 |
| 9 | Deploy to Vercel + connect `simplyinsilico.com` domain | — | Unit 8 | SIM-7 |

---

## Backlog (Nice-to-Have)

- Blog listing page + individual post pages (NICE-1)
- `simplyinsilico.ai` domain alias evaluation (NICE-2)
- Analytics integration — Plausible or Google Analytics (NICE-3)
- Dark mode theme toggle (NICE-4)
