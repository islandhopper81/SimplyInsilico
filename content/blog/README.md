# Blog Content

This directory contains all blog posts for the SimplyInsilico website. Each post is a single MDX file.

---

## File Naming

Files are named after the post slug:

```
content/blog/{slug}.mdx
```

**Slug rules:**
- Lowercase only
- Spaces replaced with hyphens
- Special characters removed (punctuation, em dashes, etc.)

Example: "Why Your AI Answers Are Generic — and How to Fix It" → `why-your-ai-answers-are-generic.mdx`

---

## Frontmatter Schema

Every post must begin with this frontmatter block:

```mdx
---
title: {Full post title}
date: YYYY-MM-DD
description: {One to two sentence summary for previews and SEO}
tags: [tag1, tag2, tag3]
---
```

### Field Reference

| Field | Required | Format | Notes |
|---|---|---|---|
| `title` | Yes | Plain text | No quotes needed. |
| `date` | Yes | `YYYY-MM-DD` | Publication date. |
| `description` | Yes | Plain text | One to two sentences. Appears in post previews and search results. |
| `tags` | Yes | `[tag1, tag2]` | Lowercase. Hyphens for multi-word tags (e.g., `small-business`). Aim for 2–4 tags. |

### Example

```mdx
---
title: Why Your AI Answers Are Generic — and How to Fix It
date: 2026-04-17
description: Getting generic AI responses? The problem isn't the tool — it's the prompt. Here are five specific things you can do right now to get answers that actually feel like they were written for your business.
tags: [ai, prompting, small-business]
---
```

---

## Images

Images are stored in:

```
public/blog/images/{slug}/{filename}
```

Referenced in MDX as:

```mdx
![Alt text](/blog/images/{slug}/{filename})
```

**Image rules:**
- Filenames should be lowercase and descriptive (e.g., `prompt-comparison.png`)
- Preferred formats: `.png`, `.jpg`, `.webp`
