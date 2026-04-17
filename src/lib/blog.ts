import { posts } from '#content'

export type { Post } from '#content'

const WORDS_PER_MINUTE = 200

/**
 * Returns the estimated reading time for a block of raw text.
 * Exported for unit testing — the same logic runs inside velite.config.ts at build time.
 */
export function computeReadingTime(text: string): string {
  const wordCount = text.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)
  return `${minutes} min read`
}

/**
 * Returns a deduplicated, alphabetically sorted list of all tags
 * across every published blog post.
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>()
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
}

/**
 * Returns all posts sorted by date descending (newest first).
 */
export function getAllPosts() {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

/**
 * Returns a single post matching the given slug, or undefined if not found.
 */
export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === `blog/${slug}`)
}
