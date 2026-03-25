# CLAUDE.md — Project Context for Claude Code

This file is read automatically by Claude Code at the start of every session.
Keep it up to date as project conventions evolve.

---

## Project Description

This project is a website that hosts information about my LLS, Simply Insilico.  The LLC is an umbrella for my products and services.  

The services branch of the LLC is focused primarily on AI consulting.  We are focused on helping small business adopt AI. Sometimes this means helping them catch up and stay up-to-date in the rapidly changin world of AI.  Secondarily, I want to offer consulting services for bioinformatics.  

The products on this website currently include:

- FeedTheFamliy

More products will be added as they are rolled out.

---

## Project Identity

**Project Name**: SimplyInsilico
**Repository**: github.com/islandhopper81/SimplyInsilico
**Description**: Public marketing website for Simply Insilico LLC — AI consulting services and software products for small businesses.

---

## Jira

**Project Key**: SIM
**Site**: yourstonefamily.atlassian.net
**Issue Types in Use**: Story, Task, Bug, Spike

---

## Branch Naming

Pattern: `{type}/{TICKET-ID}-{short-description}`

Types:
- `feat` — new feature (Story)
- `fix` — bug fix (Bug)
- `chore` — technical task, refactor, tooling (Task)
- `spike` — exploratory work (Spike)

Example: `feat/FTF-42-ingredient-substitution`

Default base branch: `main`

---

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
{type}({scope}): {short description}
```

Examples:
- `feat(meal-planner): add ingredient substitution suggestions`
- `fix(auth): resolve token expiry on refresh`
- `docs(readme): update installation instructions`

---

## Test Commands

```bash
# Unit + component tests
npm run test

# Watch mode (during development)
npm run test:watch

# All tests with coverage
npm run test:coverage
```

---

## Documentation

**Location**: `/docs/` (top-level) and `README.md`

Key documents:
- `README.md` — setup, usage, overview
- `docs/architecture.md` — system design and data flow
<!-- Add additional docs as they are created -->

---

## PR Conventions

- PRs target `main`
- PR description should include `Closes {TICKET-ID}` to auto-link to Jira
- All PRs should have passing tests before merge

---

## Coding Patterns and Philosophy

These patterns apply to all code written in this project. Claude must follow them
by default without being asked, and should flag when an approach would require
deviating from them.

---

### Readability Over Cleverness

**Always prefer code that is easy to read over code that is short or clever.**

- Use descriptive names for variables, functions, classes, and parameters.
  A name should communicate intent — `calculateWeeklyCalorieTotal()` not `calcCals()`.
- Avoid chained one-liners when breaking into named intermediate steps is clearer.
  Prefer:
  ```js
  const activeMeals = meals.filter(meal => meal.isActive);
  const sortedMeals = activeMeals.sort(byDate);
  ```
  Over:
  ```js
  const result = meals.filter(m => m.isActive).sort(byDate);
  ```
- Explicit is better than implicit. Do not rely on language "magic", implicit type
  coercion, or non-obvious defaults.
- Comments should explain **why**, not **what**. If the code itself doesn't make
  the "what" obvious, rename things until it does.
- Avoid unconventional syntax or language features that would surprise a competent
  developer unfamiliar with the codebase.

---

### Object-Oriented Design

Apply OOP principles consistently across the codebase:

**Single Responsibility**
Each class and module should do one thing and have one reason to change.
If a class is doing two distinct jobs, split it. If a function needs a long comment
to explain its multiple responsibilities, it should be multiple functions.

**Encapsulation**
Keep internals private. Expose clean, intentional interfaces.
- Mark internal methods and properties private explicitly (using language conventions)
- Do not expose internal state directly — use accessors or methods where appropriate
- A class's public interface should represent what it *does*, not how it works inside

**Inheritance**
Use class hierarchies to share behavior when a genuine "is-a" relationship exists.
- Define abstract base classes or interfaces to establish contracts
- Keep inheritance hierarchies shallow — more than 2–3 levels is a signal to refactor
- Never use inheritance purely for code reuse when composition would be cleaner

**Composition Over Inheritance**
When the relationship is "has-a" rather than "is-a", prefer composition.
Inject dependencies rather than inheriting them. This keeps classes testable
and avoids tight coupling through deep hierarchies.

---

### Error Handling

**Fail fast.** Validate inputs at the entry point of every function or method
that has expectations about its arguments. Do not let bad data propagate silently.

- Check preconditions early and throw explicit, descriptive errors:
  ```js
  if (!userId) throw new Error('userId is required and cannot be null');
  ```
- Use consistent error handling patterns throughout the project.
  Pick one approach (try/catch, Result types, etc.) and apply it uniformly —
  do not mix patterns within the same codebase.
- Error messages should be actionable — tell the developer or user what went wrong
  and ideally what to do about it.
- Never swallow errors silently with an empty catch block.

---

### Constants Over Magic Values

Never use unexplained literal values inline. Define named constants.

```js
// Wrong
if (user.sessionAge > 3600) { ... }

// Right
const SESSION_TIMEOUT_SECONDS = 3600;
if (user.sessionAge > SESSION_TIMEOUT_SECONDS) { ... }
```

Group related constants in a dedicated constants file or enum rather than
scattering them across the codebase.

---

## Notes for Claude

- This is a **Next.js 14 app using the App Router** (`src/app/` directory)
- Use **npm** (not pnpm or yarn)
- Styling is **Tailwind CSS** — do not introduce separate CSS files for new components unless absolutely necessary
- Animations use **Framer Motion** — use `whileInView` with `viewport={{ once: true }}` for scroll-triggered effects
- UI components come from **shadcn/ui** — add new components by copying them into `src/components/ui/`, not by installing new component libraries
- Static content (product list, services list) lives in **`src/data/`** as TypeScript files — update content there, not inline in page components
- Contact form submissions go through **Formspree** — the endpoint is configured in `src/data/contact.ts`
- Do not add API routes unless a new feature explicitly requires server-side logic
- The blog is **out of scope** — do not scaffold blog infrastructure unless specifically asked
