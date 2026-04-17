'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Fuse from 'fuse.js'
import { getAllPosts, getAllTags } from '@/lib/blog'

const ALL_POSTS = getAllPosts()
const ALL_TAGS = getAllTags()

const fuseIndex = new Fuse(ALL_POSTS, {
  keys: ['title', 'description', 'tags', 'raw'],
  threshold: 0.3,
})

export default function BlogIndex() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = useMemo(() => {
    let results = ALL_POSTS

    if (searchQuery.trim()) {
      results = fuseIndex.search(searchQuery).map((result) => result.item)
    }

    if (selectedTag) {
      results = results.filter((post) => post.tags.includes(selectedTag))
    }

    return results
  }, [searchQuery, selectedTag])

  return (
    <>
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <input
          type="search"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </motion.div>

      {/* Tag filters */}
      {ALL_TAGS.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTag === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>
      )}

      {/* Post list */}
      <div className="flex flex-col gap-8">
        {filteredPosts.length === 0 ? (
          <p className="text-muted-foreground">No posts match your search.</p>
        ) : (
          filteredPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link href={`/${post.slug}`} className="group block">
                <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                  {post.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <p className="text-muted-foreground">{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </motion.article>
          ))
        )}
      </div>
    </>
  )
}
