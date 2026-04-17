# Architecture

**Project**: Simply Insilico — Public Marketing Website
**Date**: 2026-03-25
**Status**: Decided

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 16 (App Router) | React-based, file-based routing, static site generation, and MDX support for the blog — all with minimal configuration |
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
        ├── /contact           Contact page + form
        │                           │
        │                           └── Formspree API ──→ Owner's email
        ├── /blog              Blog index (tag filter + Fuse.js search)
        ├── /blog/[slug]       Individual post pages (statically generated)
        └── /feed.xml          RSS feed (server-rendered on demand)

Product cards
  ├── External products (e.g., FeedTheFamily) → external URL
  └── Internal products (future) → /products/{slug}

Blog content layer
  content/blog/*.mdx
        │
        └── Velite (build time)
              ├── Validates frontmatter via Zod schema
              ├── Compiles MDX → React component strings
              ├── Computes reading time
              └── Emits type-safe data to .velite/ (gitignored)
```

Non-blog content is stored as static TypeScript data files in `src/data/`. Blog
content lives in `content/blog/` as MDX files. No database and no API routes are
needed. All pages except `/feed.xml` are statically generated at build time.

### Data Flow — Contact Form

1. User fills out the contact form on `/contact`
2. Form submits a POST to the Formspree endpoint (configured in `src/data/contact.ts`)
3. Formspree delivers the submission to the owner's email
4. User sees a success/error message rendered client-side via form state

### Data Flow — Products Page

1. `src/data/products.ts` defines the product list (name, tagline, image path, url, isExternal)
2. `/products/page.tsx` imports and maps over the list to render `ProductCard` components
3. Clicking a card navigates to `url` — external links open in a new tab, internal links use Next.js `<Link>`

### Data Flow — Blog

1. MDX files in `content/blog/` are the source of truth for all posts
2. At build time, Velite reads each file, validates frontmatter via Zod, compiles MDX, and computes reading time
3. Velite writes type-safe output to `.velite/` (gitignored)
4. `src/lib/blog.ts` imports from `#content` (alias for `.velite/`) and exports helpers: `getAllPosts()`, `getAllTags()`, `getPostBySlug()`
5. `/blog/page.tsx` uses `getAllPosts()` and `getAllTags()` — Fuse.js indexes the full post body for client-side search
6. `/blog/[slug]/page.tsx` uses `getPostBySlug()` — renders the compiled MDX via `MDXContent` client component; returns `notFound()` for unknown slugs
7. `/feed.xml/route.ts` uses `getAllPosts()` to generate an RSS 2.0 feed on demand

### Publishing Workflow — Blog Posts

1. Create a branch: `post/my-post-title`
2. Write `content/blog/my-post-title.mdx` with required frontmatter (`title`, `date`, `description`)
3. Push branch → Vercel builds a preview URL automatically
4. Review the post at the preview URL
5. Merge PR into `main` → Vercel deploys to production — post is live

## Directory Structure

```
SimplyInsilico/
├── content/
│   └── blog/                      # MDX blog posts — filename = URL slug
│       └── welcome.mdx
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
│   │   ├── contact/
│   │   │   └── page.tsx           # Contact page (/contact)
│   │   ├── blog/
│   │   │   ├── page.tsx           # Blog index — tag filter + Fuse.js search (/blog)
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Post page with OG metadata (/blog/[slug])
│   │   └── feed.xml/
│   │       └── route.ts           # RSS 2.0 feed (/feed.xml)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── ui/                    # shadcn/ui copied components (Button, Card, etc.)
│   │   ├── mdx-content.tsx        # Client component — evaluates compiled MDX strings
│   │   └── sections/              # Page-specific sections
│   │       ├── HeroSection.tsx
│   │       ├── ProductCard.tsx
│   │       ├── ServiceCard.tsx
│   │       └── ContactForm.tsx
│   ├── data/                      # Static content as TypeScript objects
│   │   ├── products.ts            # Product list
│   │   ├── services.ts            # Services list
│   │   └── contact.ts             # Formspree endpoint and contact config
│   └── lib/
│       ├── utils.ts               # cn() Tailwind class merging utility
│       ├── blog.ts                # Blog helpers: getAllPosts, getAllTags, getPostBySlug
│       └── blog.test.ts           # Unit tests for blog utilities
├── docs/
│   ├── requirements.md
│   └── architecture.md
├── velite.config.ts               # Velite schema: post shape, MDX plugins, computed fields
├── CLAUDE.md
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
| `next` | Framework (v16+) |
| `react` / `react-dom` | UI runtime |
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `framer-motion` | Scroll animations |
| `velite` | Blog content layer — MDX compilation, Zod schema validation, type generation |
| `rehype-pretty-code` + `shiki` | Syntax highlighting in blog posts (dual light/dark themes) |
| `fuse.js` | Client-side full-text fuzzy search on the blog index |
| `feed` | RSS 2.0 feed generation for `/feed.xml` |
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
| `NEXT_PUBLIC_BASE_URL` | Yes | The root URL of the site (e.g., `https://simplyinsilico.com`). Used by the RSS feed to build absolute post URLs and by Open Graph metadata. Falls back to `https://simplyinsilico.com` in code if missing, but should always be set explicitly in Vercel. |

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
