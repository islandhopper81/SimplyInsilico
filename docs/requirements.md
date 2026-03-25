# Product Requirements Document

**Project**: Simply Insilico — Public Marketing Website
**Date**: 2026-03-25
**Status**: Draft

---

## Problem Statement

Simply Insilico LLC needs a public-facing website that serves two distinct purposes: generating consulting leads from small business owners interested in AI adoption or bioinformatics services, and driving traffic to its products (FeedTheFamily and future products). Currently there is no web presence to support either goal.

The site must convey the brand clearly — we build software products for small businesses and individuals, and we help small businesses adopt AI — and make it easy for visitors to take action, whether that means reaching out for consulting or exploring a product.

## Users

- **Potential consulting clients**: Small business owners looking to adopt AI or access bioinformatics expertise. They need to quickly understand what services are offered and how to get in touch.
- **Potential product users**: Individuals and small businesses looking for software tools. They need to discover available products and navigate to them.

## Goals

- Visitors understand Simply Insilico's dual offering (products + services) within seconds of landing on the site
- Consulting leads can find and submit the contact form with minimal friction
- Product visitors can discover products and click through to the product's own site or page
- The site feels modern and credible — appropriate for an AI consulting firm

## Must-Have Requirements

1. **Landing page** with a clear headline and subheadline describing both the products and services arms of the business, and navigation links to the Services and Products pages
2. **Services page** describing AI transformation consulting for small businesses and bioinformatics consulting, each with a call-to-action that directs the user to the contact form
3. **Products page** with a card-based layout — one card per product — each card displaying a product image, name, and tagline; clicking a card navigates to the product's landing page (external URL or internal page)
4. **Contact form** accessible from the Services page and the site navigation; submissions are delivered to the owner's email via a form service (e.g., Formspree) — no custom backend required
5. **Site-wide navigation** linking to Landing, Services, Products, and Contact
6. **Scroll-triggered animations** (fade-in or slide-in) to give the site a modern, polished feel
7. **Responsive design** — fully functional on desktop and mobile
8. **FeedTheFamily product card** linking out to FeedTheFamily's own URL

## Nice-to-Have Requirements

1. **Blog** — listing page and individual post pages for articles to drive organic traffic; deferred to a future release
2. **`simplyinsilico.ai` domain** — evaluate whether to use this domain as an alias or primary domain once the site is live
3. **Analytics** — basic page view tracking (e.g., Plausible or Google Analytics) to measure traffic and lead sources
4. **Dark mode** — optional theme toggle

## Out of Scope

- A CMS or admin UI for editing content — content is managed directly in code
- A custom backend or database for contact form submissions
- Blog at launch
- Authentication or user accounts
- E-commerce or billing

## Constraints

- **Tech stack**: React + TypeScript; scroll animations via Framer Motion or equivalent
- **Hosting**: AWS (existing account) or Vercel — decision to be made during architecture phase
- **Domain**: `simplyinsilico.com` (primary); `simplyinsilico.ai` available as a future alias
- **No CMS**: content is hardcoded or stored in static data files, updated by the developer
- **Contact form delivery**: must not require a custom backend — use a third-party form service

## Open Questions

1. **Hosting decision**: AWS (S3 + CloudFront, or Amplify) vs. Vercel — which fits better given existing AWS familiarity and cost expectations?
2. **Internal product pages**: for future products that live within this site (not at their own URL), what is the expected content structure — full landing page, or a detail page linked from the Products card?
3. **Contact form destination**: what email address should form submissions be sent to?
4. **Brand assets**: are there existing logos, color palettes, or brand guidelines to apply, or does visual design need to be established from scratch?
5. **FeedTheFamily URL**: what is the URL the FeedTheFamily product card should link to?
