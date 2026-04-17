import type { Metadata } from 'next'
import BlogIndex from './BlogIndex'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practical insights on AI adoption and helping small businesses navigate a rapidly changing world.',
}

export default function BlogIndexPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-3">Blog</h1>
      <p className="text-muted-foreground text-lg mb-10">
        Thoughts on AI and helping small businesses grow.
      </p>

      <BlogIndex />
    </main>
  )
}
