import { defineConfig, defineCollection, s } from 'velite'
import rehypePrettyCode from 'rehype-pretty-code'

const WORDS_PER_MINUTE = 200

function computeReadingTime(text: string): string {
  const wordCount = text.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)
  return `${minutes} min read`
}

const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s
    .object({
      title: s.string(),
      date: s.isodate(),
      description: s.string(),
      tags: s.array(s.string()).default([]),
      body: s.mdx(),
      raw: s.raw(),
      slug: s.path(),
    })
    .transform((data) => ({
      ...data,
      readingTime: computeReadingTime(data.raw),
    })),
})

export default defineConfig({
  root: 'content',
  collections: { posts },
  mdx: {
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: { light: 'github-light', dark: 'github-dark' },
      }],
    ],
  },
})
