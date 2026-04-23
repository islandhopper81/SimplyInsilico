# SKILL: Blog Post Publishing

## Purpose
Take an approved, finalized blog post from a Jira content ticket and publish it to the SimplyInsilico website by creating a properly formatted MDX file, handling any images, committing to a feature branch, and opening a pull request.

This skill covers **publishing only**. Content creation and drafting happens separately before this skill is invoked.

---

## Prerequisites
Before running this skill, the content ticket must contain:
- Final post title
- Final post body (fully drafted and approved)
- Description (one to two sentences for SEO/previews)
- Tags
- Any images, attached to the ticket with placement markers in the body (see Image Handling below)

---

## Inputs

| Input | Description |
|---|---|
| `CONTENT_TICKET` | Jira ticket ID containing the finalized post content |

---

## File & Folder Conventions

### Blog post location
```
content/blog/{slug}.mdx
```

### Image location
```
public/blog/images/{slug}/{filename}
```

### Branch naming
```
blog/{CONTENT_TICKET_ID}-{slug}
```
Example: `blog/SIM-42-how-to-set-up-a-claude-project`

### Frontmatter schema
See `content/blog/README.md` for the canonical frontmatter reference.

---

## Image Handling

Images are attached to the content ticket as file attachments. Their placement within the post body is indicated by explicit markers written into the ticket content:

```
{{IMAGE: filename.png, alt: "Descriptive alt text"}}
```

**Example in post body:**
```
Here is what the finished setup looks like:

{{IMAGE: claude-project-setup.png, alt: "Claude Project settings panel with custom instructions filled in"}}

Once you've saved those settings, every new conversation will start with that context already loaded.
```

**Processing rules:**
1. Scan the ticket body for all `{{IMAGE: ...}}` markers
2. For each marker, download the matching attachment from the Jira ticket
3. Save the file to `public/blog/images/{slug}/{filename}`
4. Replace the marker in the MDX body with the proper image syntax:
   ```mdx
   ![Descriptive alt text](/blog/images/{slug}/filename.png)
   ```
5. If an image marker references a filename that has no matching attachment, stop and flag it before proceeding

**If no image markers are present**, check whether the ticket has attachments anyway. If attachments exist but no markers are present, do not place the images — flag this to the user and ask for clarification.

---

## Step-by-Step Workflow

### Step 1 — Read the content ticket
Fetch the Jira content ticket. Extract:
- Post title
- Post body (including any `{{IMAGE: ...}}` markers)
- Description
- Tags
- File attachments (if any)

### Step 2 — Derive the slug
- Take the post title
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters (punctuation, em dashes, quotes, etc.)

Example: "How to Set Up a Claude Project That Actually Knows Your Business" → `how-to-set-up-a-claude-project-that-actually-knows-your-business`

### Step 3 — Handle images
Follow the image handling rules above. Download attachments, place them in `public/blog/images/{slug}/`, and replace all `{{IMAGE: ...}}` markers with proper MDX image syntax.

### Step 4 — Create the MDX file
Create `content/blog/{slug}.mdx` with:
- Frontmatter block (per `content/blog/README.md`)
- Post body with image markers replaced by MDX image references

### Step 5 — Create a feature branch
```bash
git checkout main
git pull origin main
git checkout -b blog/{CONTENT_TICKET_ID}-{slug}
```

### Step 6 — Commit the changes
```bash
git add content/blog/{slug}.mdx
git add public/blog/images/{slug}/   # only if images were added
git commit -m "blog: add '{title}' ({CONTENT_TICKET_ID})"
```

### Step 7 — Push and open a PR
```bash
git push origin blog/{CONTENT_TICKET_ID}-{slug}
```

Open a pull request:
- **Base branch:** `main`
- **Title:** `Blog: {post title}`
- **Body:** Link to the content ticket, one-line description of the post

---

## Quality Checks Before Committing

- [ ] Frontmatter is complete and valid (no missing fields, correct date format)
- [ ] Slug is URL-safe (lowercase, hyphens only, no special characters)
- [ ] All `{{IMAGE: ...}}` markers have been replaced — none remain in the MDX body
- [ ] All referenced images exist in `public/blog/images/{slug}/`
- [ ] No placeholder text remains in the post body
- [ ] Description is specific (not generic)
- [ ] Tags are lowercase and hyphenated where needed

---

## Notes
- Never commit directly to `main` — always use a feature branch and PR
- Vercel automatically deploys once the PR is merged into `main`
- Date in frontmatter should be today's date unless the ticket specifies otherwise