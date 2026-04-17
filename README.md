# Simply Insilico

Public marketing website for Simply Insilico LLC — an AI consulting and software products company focused on helping small businesses adopt AI. The site showcases consulting services, highlights products (starting with [FeedTheFamily](https://feedthefamily.app/)), and provides a contact form for prospective clients.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Content Layer**: Velite (MDX blog posts with Zod schema validation)
- **Blog Search**: Fuse.js (client-side full-text fuzzy search)
- **Syntax Highlighting**: rehype-pretty-code + Shiki (dual light/dark themes)
- **Contact Form**: Formspree
- **Analytics**: Vercel Analytics
- **Testing**: Vitest + React Testing Library
- **Hosting**: Vercel

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy the example env file and fill in your values
cp .env.example .env.local

# Start the dev server
npm run dev
```

The site will be available at `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Your Formspree form URL (e.g., `https://formspree.io/f/xxxxxxxx`). Found in the Formspree dashboard under your form's integration settings. |
| `NEXT_PUBLIC_BASE_URL` | The root URL of the site (e.g., `https://simplyinsilico.com`). Used by the RSS feed and Open Graph metadata to build absolute URLs. |

> **Important**: `NEXT_PUBLIC_` variables are baked into the build at compile time. If you update them in Vercel, you must trigger a redeploy for the changes to take effect. If `NEXT_PUBLIC_FORMSPREE_ENDPOINT` is missing, the contact form will silently fail.

---

## Testing

```bash
# Run all tests once
npm run test

# Watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

---

## Deployment

The site is hosted on [Vercel](https://vercel.com) and connected to this GitHub repository.

- **Production**: Automatically deploys when a PR is merged into `main`
- **Preview**: Every pull request gets a unique preview URL from Vercel
- **Domain**: [simplyinsilico.com](https://simplyinsilico.com)

To deploy manually, merge your branch into `main` via a pull request.

---

## Project Structure

```
content/
└── blog/             # MDX blog posts — filename becomes the URL slug
src/
├── app/              # Next.js App Router — one folder per route
│   ├── layout.tsx    # Root layout (Navbar, Footer, Analytics)
│   ├── page.tsx      # Landing page (/)
│   ├── services/     # Services page (/services)
│   ├── products/     # Products page (/products)
│   ├── contact/      # Contact page (/contact)
│   ├── blog/
│   │   ├── page.tsx       # Blog index with tag filter + search (/blog)
│   │   └── [slug]/
│   │       └── page.tsx   # Individual post page (/blog/[slug])
│   └── feed.xml/
│       └── route.ts       # RSS feed (/feed.xml)
├── components/
│   ├── layout/       # Navbar, Footer
│   ├── ui/           # shadcn/ui components + ContactForm, ProductCard
│   ├── sections/     # Page-specific sections (Hero, etc.)
│   └── mdx-content.tsx  # Client component that renders compiled MDX
├── data/             # Static content as TypeScript files
│   ├── products.ts   # Product list
│   ├── services.ts   # Services list
│   └── contact.ts    # Formspree endpoint config
└── lib/
    ├── blog.ts       # Blog helpers: getAllPosts, getAllTags, getPostBySlug
    └── blog.test.ts  # Unit tests for blog utilities
```

See [`docs/architecture.md`](docs/architecture.md) for full system design details.
