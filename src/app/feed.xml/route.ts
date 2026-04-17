import { Feed } from 'feed'
import { getAllPosts } from '@/lib/blog'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://simplyinsilico.com'

export async function GET() {
  const posts = getAllPosts()

  const feed = new Feed({
    title: 'Simply Insilico Blog',
    description: 'Thoughts on AI, bioinformatics, and helping small businesses grow.',
    id: BASE_URL,
    link: BASE_URL,
    copyright: `© ${new Date().getFullYear()} Simply Insilico LLC`,
    feedLinks: {
      rss: `${BASE_URL}/feed.xml`,
    },
  })

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${BASE_URL}/${post.slug}`,
      link: `${BASE_URL}/${post.slug}`,
      description: post.description,
      date: new Date(post.date),
      category: post.tags.map((tag) => ({ name: tag })),
    })
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
