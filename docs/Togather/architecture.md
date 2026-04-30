# Togather — Architecture Plan

`simplyinsilico.com/products/togather/`

_Version 3.0 | SimplyInsilico | Stateless-first with stateful migration path_

---

## 1. Scope

**In Scope:** Participant entry and import, friendship/affinity entry, coach volunteer registration, group formation algorithm (friendships + coach assignment), drag-and-drop adjustment UI (Board + Graph views), result export. Team formation only.

**Out of Scope:** Schedule management, coach conflict detection, iCal feeds, family-facing schedule pages, SMS/email notifications. All deferred to a future phase.

---

## 2. Core Architecture Decision — Stateless First

Togather v1 is a stateless, session-based tool. No database, no authentication, no backend persistence. The user enters or imports their data, runs the algorithm, adjusts the result, and exports. When the session ends, the state is gone.

This is an intentional product decision, not a technical limitation. The right trigger to add persistence is a real user asking to come back to a saved session — not speculation before launch.

| | V1 — Stateless | V2 — Stateful |
|---|---|---|
| **Auth required** | None | Magic link via Supabase Auth |
| **Data storage** | Browser memory only | Supabase Postgres |
| **Session persistence** | None — export to save | Saved sessions per user |
| **Backend** | Stateless algorithm endpoint only | API routes + database layer |
| **Deployment** | Vercel (unchanged) | Vercel + Supabase (same pipeline) |
| **Build time to working tool** | Weeks | Months |
| **Infrastructure cost** | Free tier | Free tier (early), usage-based (growth) |
| **Multi-user collaboration** | Not supported | Supported |

---

## 3. V1 Tech Stack — Stateless

V1 adds only what is necessary. The existing SimplyInsilico stack is untouched.

### 3a. Frontend — Existing (No Changes)

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js App Router + React 19 + TypeScript 5 | Togather is a new route in the existing repo — not a new app |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Consistent with rest of site |
| **Animation** | Framer Motion 12 | Already installed — use for drag transitions |

### 3b. Frontend — New Additions

| Layer | Technology | Rationale |
|---|---|---|
| **Graph view** | Cytoscape.js | Purpose-built for interactive node/edge graphs, handles 200+ nodes smoothly, drag support built in |
| **Drag & drop** | dnd-kit | Modern, accessible, React 19 compatible — better than react-beautiful-dnd which is unmaintained |
| **Local state** | Zustand | Lightweight global state for the session — participants, affinities, group assignments. Single source of truth. |
| **Export** | csv-stringify + file-saver | Client-side CSV export, no server needed. JSON export as a fallback for re-importing later. |

### 3c. Algorithm — Stateless API Endpoint

| Layer | Technology | Rationale |
|---|---|---|
| **Language** | Python 3.11 | Algorithm most naturally expressed in Python. networkx and community detection libraries are mature. |
| **Libraries** | networkx + python-louvain + scipy | Louvain for community detection, networkx for graph operations, scipy CP-SAT for constraint satisfaction phase. |
| **Deployment** | Vercel Python serverless function | Lives at `/api/togather/algorithm`. Stateless — takes graph in, returns assignments out, saves nothing. |
| **Fallback** | JavaScript greedy heuristic | Pure client-side fallback if Python endpoint is unavailable. Sufficient for small leagues. |

> **Vercel Limits:** Serverless functions have a 60-second execution limit on Pro plan. The algorithm runs in under 1 second for leagues under 500 participants. This is a non-issue for v1.

### Algorithm Two-Phase Approach

The algorithm solves two objectives simultaneously: maximize friend connections within groups (soft), and ensure every group has exactly one head coach (hard).

| Phase | Description |
|---|---|
| **Phase 1 — Community Detection** | Louvain runs on the friendship graph including coach-child edges at weight 2.0. Natural social clusters form. Coach volunteering is not yet considered — this phase is purely about social structure. |
| **Phase 2 — Constraint Satisfaction** | CP-SAT rebalances communities to respect max group size AND ensures each group receives exactly one head coach. Friend satisfaction is maximized within these hard constraints. Coach distribution acts as counter-pressure to clustering — coaches are spread across groups even if it slightly reduces friend co-location. |
| **Phase 3 — Validation** | Before returning the result, the algorithm checks coach coverage. If fewer willing coaches exist than groups, it returns a structured warning rather than an invalid assignment. The admin is informed of the gap before any assignments are written. |

---

## 4. V1 In-Memory Data Shape

State lives in Zustand during the session. The shape is designed to be identical to what would eventually be persisted in a database — making the v2 migration a storage layer addition, not a data model rewrite.

### Session State Structure

| Field | Description |
|---|---|
| `session.name` | string — e.g. "Spring 2025 T-Ball League" |
| `session.groupCount` | number — how many teams/groups to form |
| `session.maxGroupSize` | number — hard cap per group |
| `participants[]` | id, name, ageGroup, contactEmail, willingToCoach (boolean), coachingNotes? (string) |
| `affinities[]` | fromId, toId, weight (default 1.0) — directed friendship edges. Coach-child pairs auto-created at weight 2.0. |
| `groups[]` | id, name, color, memberIds[], headCoachId (string \| null) |
| `meta.assignedBy` | `"algorithm"` \| `"manual"` — tracks last assignment method |
| `meta.satisfactionScore` | number 0–1 — % of friend edges that are intra-group |
| `meta.coachCoverage` | number — count of groups with a head coach assigned |

### Coach-Child Affinity Rule

When a participant marks `willingToCoach` as true, the system automatically creates a maximum-weight affinity edge (weight 2.0) between that parent and their child in the participant list. This is not entered manually — it is inferred at registration and treated as a near-hard constraint by the algorithm. The effect is that coaching parents are strongly pulled onto the same team as their child before friend preferences are considered.

### Coach Coverage Edge Cases

| Scenario | Behavior |
|---|---|
| **Not enough coaches** | Algorithm flags unresolvable constraint and surfaces a warning to the admin before assignment. Admin must either recruit more coaches or proceed with known gaps. |
| **Too many coaches in one cluster** | Algorithm distributes coaches across groups even if it slightly reduces friend satisfaction. Coach coverage is a hard constraint; friend satisfaction is a soft objective. |
| **Coach volunteers but child not in league** | Valid case — `willingToCoach` flag is still honored, no auto-affinity is created. Coach is assigned to a group based purely on distribution needs. |

### Export Formats

- **CSV** — one row per participant with their assigned group and coach assignment. Coach column included. For printing or importing into TeamSnap/GameChanger.
- **JSON** — full session state including coach assignments. Can be re-imported into Togather in a future session. This is the v1 workaround for persistence.

---

## 5. V1 URL & Component Structure

| Route | Purpose |
|---|---|
| `products/togather/` | Public landing page — what Togather is, call to action to launch the tool |
| `products/togather/app/` | Application shell — single-page tool, all state in Zustand |
| `products/togather/app/setup` | Step 1 — session name, group count, max size |
| `products/togather/app/participants` | Step 2 — enter or CSV-import participants, friend preferences, and coach volunteers |
| `products/togather/app/groups` | Step 3 — run algorithm, view Board + Graph, drag to adjust, export |
| `api/togather/algorithm` | POST endpoint — accepts graph JSON, returns group assignments |

---

## 6. UI Component Architecture

### Group Formation View — Dual Mode

| Component | Description |
|---|---|
| **BoardView** | Trello-style columns, one per group. Uses dnd-kit. Each column has a designated Coach Slot at the top (visually distinct, highlighted red if empty) followed by player cards. Player cards show name and a friend-match indicator (e.g. 3/4 friends on this team). Dragging a card moves one participant. |
| **GraphView** | Cytoscape.js canvas. Nodes are participants colored by group membership. Coach-volunteer nodes rendered as a different shape (diamond vs circle). Edges are friendships, with coach-child edges shown as thicker lines. Shift+drag moves a node plus all connected neighbors. |
| **ViewToggle** | Persistent toggle between Board and Graph. Both read from Zustand — switching is instant, no recalculation. |
| **ScoreBar** | Two metrics displayed at top of both views: (1) Friend Satisfaction — % of friend edges that are intra-group. (2) Coach Coverage — N of M groups have a head coach, shown as a warning badge if any group is uncovered. |
| **ExportPanel** | Drawer or modal with CSV and JSON export options. CSV includes a coach column per group. JSON captures full session state including coach assignments. |

---

## 7. V1 → V2 Migration Path

The migration from stateless to stateful is additive — nothing in v1 is thrown away. Each step is independently deployable.

| Step | Name | What Changes | Trigger |
|---|---|---|---|
| **1** | Add database | Supabase project created, Prisma schema defined matching v1 data shape exactly. No UI changes. | Decision to add persistence |
| **2** | Save session | POST `/api/togather/sessions` writes current Zustand state to database. "Save" button added to ExportPanel. | First user asks to return to saved work |
| **3** | Add auth | Supabase magic link auth added. Users get an account. Saved sessions scoped to their user ID. | Same trigger as Step 2 |
| **4** | Load session | GET `/api/togather/sessions/[id]` hydrates Zustand from database on page load. Dashboard page lists saved sessions. | After Step 3 is stable |
| **5** | Multi-org | Organizations table added. Multiple admins can share a session. Row-level security policies enforced. | Second league wants to use the tool |

> **Key Insight:** Because the v1 Zustand state shape is designed to match the future database schema, Steps 1–4 require zero changes to the UI components or the algorithm. The data model does not change — only where it lives.

---

## 8. V2 Stack Additions — When Persistence Is Added

Everything in V1 remains. These layers are added on top.

| Layer | Technology | Rationale |
|---|---|---|
| **Database** | Supabase (Postgres) | Managed Postgres, built-in auth, row-level security, Vercel integration. Free tier covers early usage. |
| **ORM** | Prisma | Type-safe database client, schema-first, migrations built in. Excellent Next.js integration. |
| **Auth** | Supabase Auth | Magic link login. No passwords. One API call to send a login link, session managed automatically. |
| **API routes** | Next.js Route Handlers | Sessions CRUD added to `/api/togather/`. Same serverless deployment, no new infrastructure. |

---

## 9. Build Phases

| Phase | Name | Deliverables | Outcome |
|---|---|---|---|
| **1a** | Setup & Routing | Landing page at `/products/togather/`, app shell with stepper UI, Zustand store wired up, basic session setup form | Route exists, state management in place |
| **1b** | Participant Entry | Manual entry form with `willingToCoach` flag and child linkage, CSV import, affinity entry, auto-creation of coach-child affinity at weight 2.0, participant list view | Can enter a full league roster with friendships and coach volunteers |
| **1c** | Algorithm | Python serverless function deployed, two-phase algorithm (Louvain + CP-SAT with coach hard constraint), BoardView with coach slot per column, ScoreBar with friend satisfaction + coach coverage, JS greedy fallback | Algorithm runs, assigns groups, and guarantees coach coverage or surfaces gaps |
| **1d** | Interaction | dnd-kit drag in BoardView, Cytoscape.js GraphView with coach node shapes, shift+drag cluster move, ViewToggle, optimistic score updates | Full drag-and-drop adjustment working |
| **1e** | Export | CSV export with coach column, JSON export, JSON re-import, print-friendly view | Complete v1 — usable end to end |
| **2** | Persistence | Supabase setup, Prisma schema, Save Session, magic link auth, session dashboard, Load Session | Users can return to saved work |
| **3** | Growth | Multi-org support, white-label theming, Stripe billing, scheduling features | Product ready for additional leagues |

---

## 10. Open Questions

- How will friend preferences be collected? Options: admin enters them manually, participants fill out a form themselves, or imported via CSV from registration data.
- How will coach volunteering be collected? Same options as friend preferences — ideally part of the same registration form so the data arrives together.
- How does the system handle a coaching parent whose child is in a different age group than the team they want to coach? Is the coach-child affinity still applied or does the admin override it?
- Should the algorithm endpoint be a Vercel Python function or a separate service on Render? Render avoids cold start concerns but adds a second deployment to manage.
- Is JSON re-import sufficient as a v1 persistence workaround, or is there a minimum bar of saved state that makes v1 feel incomplete without a database?
- Should the app stepper be a multi-page flow (separate URLs per step) or a single-page wizard? Multi-page is more shareable and browser-back friendly.

---

## 11. Repo Structure

Togather lives inside the existing `simplyinsilico` repository. New directories only:

| Path | Purpose |
|---|---|
| `src/app/products/togather/` | Landing page and app shell |
| `src/app/api/togather/` | Algorithm endpoint and (later) sessions CRUD |
| `src/components/togather/` | BoardView, GraphView, ScoreBar, ParticipantCard, ExportPanel, ViewToggle |
| `src/lib/togather/` | Zustand store, type definitions, score calculator, CSV parser, export utilities |
| `src/lib/togather/types.ts` | Shared TypeScript types — Session, Participant, Affinity, Group |
| `algorithm/` | Python algorithm service — main.py, requirements.txt, deployable independently |
| `prisma/` | Added in V2 only — schema.prisma with Togather tables |