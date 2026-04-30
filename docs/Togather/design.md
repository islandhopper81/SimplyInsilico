# Togather — Design Document

`simplyinsilico.com/products/togather/`

_Version 1.0 | SimplyInsilico | V1 Stateless Release_

---

## 1. Introduction

### 1.1 Purpose

This document describes how Togather is designed — the user flows, screen layouts, component interfaces, state management structure, and API contract. It bridges the requirements document (what must be true) and the architecture document (which technologies are used) by specifying the concrete design decisions that implementation must follow.

### 1.2 Companion Documents

| Document | Describes |
|---|---|
| `requirements.md` | What the system must do (functional and non-functional requirements) |
| `architecture.md` | Technology choices, build phases, v1→v2 migration path |
| `design.md` (this document) | User flows, screen layouts, component design, state structure, API contract |

---

## 2. User Personas

### Primary Persona — The League Administrator

The administrator is a volunteer parent, recreation department coordinator, or club organizer. They are not technical. They manage a roster of children (or adults) and want to divide them into fair, balanced teams before a season starts. They care about:

- Keeping friends together where possible
- Making sure every team has a coach
- Being able to fix the algorithm's output when it misses something obvious
- Getting the result into TeamSnap or GameChanger quickly

They are using a laptop or desktop. Mobile is not a primary target for the tool (the landing page is mobile-responsive; the app is desktop-first).

### Secondary Persona — The Simply Insilico Product Owner

Reviews the landing page and decides whether to trust the tool with real league data. Cares about product credibility, data privacy (no backend, nothing stored), and simplicity.

---

## 3. User Flows

### 3.1 Primary Flow — New Session

```
Landing Page
    → Click "Launch Tool"
    → Setup (step 1): enter session name, group count, max group size
    → Participants (step 2): add participants, mark coaches, enter friendships
    → Groups (step 3): run algorithm → view Board/Graph → adjust → export
```

### 3.2 Secondary Flow — Resume via JSON Import

```
Landing Page
    → Click "Launch Tool"
    → Setup (step 1): click "Import previous session (JSON)"
    → Skips to Groups (step 3) with state restored from JSON
```

### 3.3 Error Flow — Algorithm Unavailable

```
Groups (step 3): click "Run Algorithm"
    → Python endpoint unavailable (timeout / 5xx)
    → System automatically falls back to JS greedy heuristic
    → Toast notification: "Algorithm service unavailable — using local fallback. Results may be less optimal for large leagues."
    → Board view populates normally
```

### 3.4 Error Flow — Not Enough Coaches

```
Groups (step 3): click "Run Algorithm"
    → Algorithm returns coach coverage warning
    → Modal displayed before any assignments are written:
        "Not enough coaches: 6 groups require a head coach but only 4 participants have volunteered.
         You can proceed with 2 groups unassigned, or go back and add more coach volunteers."
    → Two CTAs: "Proceed anyway" | "Go back to participants"
    → If proceeding: groups without a coach show the Coach Slot highlighted in red
```

---

## 4. Screen Designs

### 4.1 Landing Page — `/products/togather/`

The landing page is a public marketing page within the existing SimplyInsilico site. It follows the same layout conventions as other product landing pages.

**Sections:**

| Section | Content |
|---|---|
| Hero | Product name "Togather", tagline, "Launch Tool" CTA button |
| Problem statement | Two or three sentences on the pain of manual team formation |
| How it works | Three-step visual (Enter roster → Run algorithm → Export result) |
| Feature highlights | Friendship-aware grouping, coach assignment, drag-and-drop adjustment, no account required |
| Privacy callout | "Your data never leaves your browser. No account. No database." |
| CTA | "Launch Tool" button linking to `/products/togather/app/setup` |

**Notes:**
- Consistent with SimplyInsilico Tailwind + shadcn/ui conventions
- Framer Motion scroll animations using `whileInView` with `viewport={{ once: true }}`
- No blog, no testimonials, no pricing in v1

---

### 4.2 App Shell — `/products/togather/app/`

All three app steps share a persistent shell:

```
┌─────────────────────────────────────────────────────┐
│  Togather              [Session Name]          [?]  │  ← Top bar
├──────────────────────────────────────────────────────┤
│  ① Setup   ②  Participants   ③  Groups              │  ← Stepper
├──────────────────────────────────────────────────────┤
│                                                      │
│                   [Step Content]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Top bar:**
- Left: "Togather" wordmark (links back to landing page)
- Center: Session name (read-only display once set)
- Right: Help icon (links to a tooltip or docs page)

**Stepper:**
- Three numbered steps; completed steps are clickable to go back
- Current step is highlighted
- Steps are not skippable (must complete in order for a new session)

---

### 4.3 Setup Screen — `/products/togather/app/setup`

```
┌─────────────────────────────────┐
│  New Session                    │
│                                 │
│  Session name                   │
│  [Spring 2025 T-Ball League  ]  │
│                                 │
│  Number of groups               │
│  [  6  ]                        │
│                                 │
│  Max participants per group     │
│  [  8  ]                        │
│                                 │
│  ─────────────── or ──────────  │
│                                 │
│  [ Import previous session ]    │
│                                 │
│              [ Next → ]         │
└─────────────────────────────────┘
```

**Behavior:**
- "Next" is disabled until all three fields are valid
- Number fields accept only positive integers; non-numeric input is rejected on blur
- "Import previous session" opens a file picker filtered to `.json`; on successful parse, it bypasses steps 1 and 2 and navigates directly to the Groups view with full state restored
- If JSON import fails to parse, display an inline error: "Could not read this file. Make sure it was exported from Togather."

---

### 4.4 Participants Screen — `/products/togather/app/participants`

```
┌──────────────────────────────────────────────────────┐
│  Participants (0)              [ + Add ] [ Import CSV]│
├───────────────────────────────────────────────────────┤
│  Name          Age Group   Coach?   Actions           │
│  ──────────────────────────────────────────────────   │
│  (empty state — "Add your first participant above")   │
│                                                       │
├───────────────────────────────────────────────────────┤
│  Friendships (0)              [ + Add friendship ]    │
├───────────────────────────────────────────────────────┤
│  (empty state — "Add participants first")             │
│                                                       │
│                            [ ← Back ]  [ Next → ]    │
└──────────────────────────────────────────────────────┘
```

**Add Participant — Inline Form (appears above list on "+ Add" click):**

```
  Name *          [                    ]
  Age Group *     [                    ]
  Contact Email   [                    ]
  Willing to coach? [ ] Yes
  Coaching notes  [                    ]
                  [ Cancel ] [ Add Participant ]
```

**Participant List Row:**

```
  Alex Johnson    U10    🧢 Coach    [ Edit ] [ Remove ]
  Sam Lee         U10               [ Edit ] [ Remove ]
```

- Coach icon / badge shown if `willingToCoach` is true
- Removing a participant also removes all their affinity edges and clears them from any friendship pairs

**Add Friendship — Inline Form:**

```
  From participant   [ Select... ▾ ]
  To participant     [ Select... ▾ ]
  Weight             [ 1.0 ]   (most users will leave this at default)
                     [ Cancel ] [ Add Friendship ]
```

- Dropdowns list current participants by name
- Weight field is pre-filled to 1.0; advanced users can increase it
- Coach-child edges at weight 2.0 are created automatically and shown in the list as read-only (system-generated, cannot be manually edited or deleted)

**Friendship List:**

```
  Alex Johnson  →  Sam Lee         1.0    [ Remove ]
  Alex Johnson  →  Taylor Kim      1.0    [ Remove ]
  [Coach] Alex Johnson ↔ Alex Jr.  2.0    (auto-created)
```

**CSV Import:**
- Opens a file picker filtered to `.csv`
- On parse success: shows a mapping confirmation dialog (column → field) before importing
- On column mismatch: shows which required columns are missing and allows the user to re-map them
- Required CSV columns: `name`, `age_group`
- Optional CSV columns: `contact_email`, `willing_to_coach` (accepts `true`/`false`/`yes`/`no`/`1`/`0`)

**"Next" button behavior:**
- Disabled if participant count is 0
- Warns (but does not block) if no participants are marked as coach volunteers: "No coach volunteers added. Every group will need a coach — add volunteers before running the algorithm, or proceed and assign coaches manually."

---

### 4.5 Groups Screen — `/products/togather/app/groups`

```
┌──────────────────────────────────────────────────────────────────┐
│  👥 Friend Satisfaction: 78%     🎽 Coach Coverage: 5/6 groups  │  ← ScoreBar
├──────────────────────────────────────────────────────────────────┤
│  [ Run Algorithm ]   [ Board | Graph ]   [ Export ▾ ]           │  ← Action bar
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [Board View or Graph View content]                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Before algorithm is run:**
- Board and Graph views show a placeholder: "Run the algorithm to generate groups, or drag participants manually."
- "Run Algorithm" button is prominent

**After algorithm runs:**
- ScoreBar updates with live metrics
- Board/Graph populate
- "Run Algorithm" becomes "Re-run Algorithm" with a tooltip: "Re-running will overwrite any manual adjustments."

---

### 4.5a Board View

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Team 1     │  │  Team 2     │  │  Team 3     │  │  Team 4     │
│ ╔═════════╗ │  │ ╔═════════╗ │  │ ╔═══════!╗  │  │ ╔═════════╗ │
│ ║ 🧢 Alex  ║ │  ║ 🧢 Jordan ║ │  ║  No Coach ║  │  ║ 🧢 Taylor ║ │
│ ╚═════════╝ │  │ ╚═════════╝ │  │ ╚═══════!╝  │  │ ╚═════════╝ │
│ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │
│ │ Sam L.  │ │  │ │ Morgan  │ │  │ │ Casey   │ │  │ │ Drew    │ │
│ │ 3/4 ✓  │ │  │ │ 2/3 ✓  │ │  │ │ 1/2 ✓  │ │  │ │ 3/3 ✓  │ │
│ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │
│     ...     │  │     ...     │  │     ...     │  │     ...     │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

- **Coach Slot**: visually distinct box at top of each column (darker background, coach hat icon). Red border + "No Coach" label if empty.
- **Participant Card**: name on first line, friend-match indicator on second line (e.g. "3/4 friends here")
- **Dragging**: drag any card to another column. Dragging a coach out of the Coach Slot into the participant area demotes them; dragging a coach-volunteer card into the Coach Slot promotes them to head coach.
- **Column count**: columns scroll horizontally if there are more than 4–5 groups
- **Empty group warning**: if dragging leaves a group with 0 members, show a placeholder "Drop participants here" state

---

### 4.5b Graph View

- **Canvas**: fills available height below action bar
- **Nodes**: circles colored by group (same color palette as Board columns). Coach-volunteer nodes rendered as diamonds.
- **Edges**: thin gray lines for friendships. Coach-child edges are thicker and a distinct color (e.g. amber).
- **Labels**: participant name displayed below each node
- **Drag**: drag a node to move one participant to a different group. The node's color updates immediately.
- **Shift+drag**: moves the dragged node plus all directly connected neighbors as a cluster
- **Zoom/pan**: standard pinch-zoom and scroll-pan behavior via Cytoscape.js defaults
- **Legend**: small fixed legend in corner: ○ Participant, ◆ Coach volunteer, — Friendship, — Coach-child bond

---

### 4.6 Export Panel

Triggered by the "Export ▾" button, which opens a dropdown:

```
  Export ▾
  ├── Download CSV
  └── Download JSON
       (re-importable)
```

**CSV format:**

```csv
participant_name,age_group,group_name,head_coach
Alex Johnson,U10,Team 1,Alex Johnson
Sam Lee,U10,Team 1,Alex Johnson
Jordan Smith,U10,Team 2,Jordan Smith
```

**JSON format:** full Zustand session state — session settings, participants array, affinities array, groups array, and meta object. Identical shape to the v2 database schema.

---

## 5. Component Design

### 5.1 Key Components

#### `SessionSetupForm`

| Prop | Type | Description |
|---|---|---|
| `onSubmit` | `(setup: SessionSetup) => void` | Called when form is valid and submitted |
| `onImport` | `(session: SessionState) => void` | Called when a JSON file is successfully parsed |

Internal state: form field values and validation errors. No Zustand dependency — parent writes to store on submit.

---

#### `ParticipantForm`

| Prop | Type | Description |
|---|---|---|
| `initialValues` | `Participant \| null` | If non-null, form is in edit mode |
| `onSave` | `(participant: Participant) => void` | |
| `onCancel` | `() => void` | |

---

#### `ParticipantList`

| Prop | Type | Description |
|---|---|---|
| `participants` | `Participant[]` | |
| `onEdit` | `(id: string) => void` | |
| `onRemove` | `(id: string) => void` | |

---

#### `AffinityForm`

| Prop | Type | Description |
|---|---|---|
| `participants` | `Participant[]` | Populates the from/to dropdowns |
| `onSave` | `(affinity: Affinity) => void` | |
| `onCancel` | `() => void` | |

---

#### `AffinityList`

| Prop | Type | Description |
|---|---|---|
| `affinities` | `Affinity[]` | |
| `participants` | `Participant[]` | Used to resolve IDs to display names |
| `onRemove` | `(affinity: Affinity) => void` | System-generated coach-child affinities are excluded from `onRemove` |

---

#### `ScoreBar`

| Prop | Type | Description |
|---|---|---|
| `satisfactionScore` | `number` | 0–1, rendered as percentage |
| `coachCoverage` | `number` | Count of groups with a head coach |
| `groupCount` | `number` | Total groups — used to compute coverage ratio |

No interaction. Pure display. Re-renders whenever Zustand meta values change.

---

#### `BoardView`

| Prop | Type | Description |
|---|---|---|
| `groups` | `Group[]` | |
| `participants` | `Participant[]` | |
| `onMove` | `(participantId: string, toGroupId: string) => void` | Called on successful drag drop |
| `onPromoteCoach` | `(participantId: string, groupId: string) => void` | Called when a participant is dropped into the Coach Slot |

Uses `dnd-kit`. Each column is a droppable zone. Coach Slot is a separate droppable within the column.

---

#### `GraphView`

| Prop | Type | Description |
|---|---|---|
| `groups` | `Group[]` | |
| `participants` | `Participant[]` | |
| `affinities` | `Affinity[]` | |
| `onMove` | `(participantId: string, toGroupId: string) => void` | |

Wraps Cytoscape.js. Node color is derived from group membership. Cytoscape instance is created once on mount and updated via `cy.batch()` when props change.

---

#### `ExportPanel`

| Prop | Type | Description |
|---|---|---|
| `session` | `SessionState` | Full session state passed in for serialization |

No external dependencies. Uses `csv-stringify` for CSV and `JSON.stringify` + `file-saver` for JSON.

---

## 6. State Management Design

All session state lives in a single Zustand store. The store is the single source of truth — all components read from and write to it.

### 6.1 Store Shape

```typescript
interface TogetherStore {
  // Session settings
  session: {
    name: string;
    groupCount: number;
    maxGroupSize: number;
  } | null;

  // Core data
  participants: Participant[];
  affinities: Affinity[];
  groups: Group[];

  // Derived / computed metadata
  meta: {
    assignedBy: 'algorithm' | 'manual' | null;
    satisfactionScore: number;   // 0–1
    coachCoverage: number;       // count of groups with a head coach
  };

  // Actions
  initSession: (setup: SessionSetup) => void;
  importSession: (state: SessionState) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  removeParticipant: (id: string) => void;
  addAffinity: (affinity: Affinity) => void;
  removeAffinity: (fromId: string, toId: string) => void;
  applyAlgorithmResult: (groups: Group[]) => void;
  moveParticipant: (participantId: string, toGroupId: string) => void;
  promoteToHeadCoach: (participantId: string, groupId: string) => void;
}
```

### 6.2 Derived State Rules

These values are recomputed by the store after every mutation:

**`meta.satisfactionScore`**

```
satisfied = count of affinity edges where fromId and toId are in the same group
total     = count of all non-system affinities (weight < 2.0)
score     = satisfied / total   (0 if total is 0)
```

**`meta.coachCoverage`**

```
coverage = count of groups where headCoachId is not null
```

**Coach-child auto-affinity**

When `addParticipant` is called with `willingToCoach: true` and a linked child ID is present, the store automatically calls `addAffinity` with `weight: 2.0` and marks the edge as `system: true`. When the participant is removed, all their system-generated affinities are removed with them.

### 6.3 Persistence

In v1, the store is not persisted to localStorage or any external store. State is lost on page refresh. The JSON export is the only persistence mechanism.

---

## 7. Algorithm API Contract

### Endpoint

```
POST /api/togather/algorithm
Content-Type: application/json
```

### Request Body

```typescript
interface AlgorithmRequest {
  session: {
    groupCount: number;
    maxGroupSize: number;
  };
  participants: {
    id: string;
    willingToCoach: boolean;
  }[];
  affinities: {
    fromId: string;
    toId: string;
    weight: number;
  }[];
}
```

### Success Response — `200 OK`

```typescript
interface AlgorithmSuccessResponse {
  status: 'ok';
  groups: {
    id: string;
    memberIds: string[];
    headCoachId: string;
  }[];
  meta: {
    satisfactionScore: number;   // 0–1
    coachCoverage: number;
  };
}
```

### Coach Coverage Warning — `200 OK`

Returned when the algorithm cannot satisfy coach coverage. The client must display the warning before applying any assignments.

```typescript
interface AlgorithmWarningResponse {
  status: 'coach_coverage_warning';
  availableCoaches: number;
  requiredCoaches: number;
  groups: {
    id: string;
    memberIds: string[];
    headCoachId: string | null;   // null for uncovered groups
  }[];
  meta: {
    satisfactionScore: number;
    coachCoverage: number;
  };
}
```

### Error Response — `400 Bad Request`

```typescript
interface AlgorithmErrorResponse {
  status: 'error';
  code: 'invalid_input' | 'infeasible';
  message: string;
}
```

**`invalid_input`**: malformed request (missing required fields, negative numbers, etc.)
**`infeasible`**: constraint problem has no solution (e.g. maxGroupSize is too small for the participant count)

### Timeout / 5xx

The client treats any network error or 5xx response as an endpoint unavailability signal and falls back to the JavaScript greedy heuristic automatically. The user is notified via a toast.

---

## 8. Error States and Edge Cases

| Scenario | UI Behavior |
|---|---|
| Session setup: non-numeric group count | Inline validation error on blur: "Must be a whole number greater than 0" |
| Session setup: JSON import fails to parse | Inline error below import button: "Could not read this file. Make sure it was exported from Togather." |
| Participants: CSV missing required columns | Modal listing missing columns; import is blocked until resolved |
| Participants: duplicate participant name | Allow it — names are not unique keys. IDs are. |
| Groups: algorithm endpoint unavailable | JS fallback runs silently; toast notifies user |
| Groups: not enough coaches | Blocking modal before assignments are written; user chooses to proceed or go back |
| Groups: re-run algorithm after manual adjustments | Confirmation dialog: "Re-running will overwrite your manual changes. Continue?" |
| Groups: drag produces a group exceeding max size | Drop is rejected; card snaps back to origin; toast: "Team N is already at max size." |
| Export: zero groups assigned | Export buttons disabled; tooltip: "Run the algorithm or assign participants manually before exporting." |

---

## 9. Accessibility Design

| Requirement | Implementation |
|---|---|
| Keyboard navigation through stepper | Steps are focusable and activatable with Enter/Space |
| Drag-and-drop keyboard alternative | dnd-kit provides keyboard drag support out of the box (Space to pick up, arrow keys to move, Enter/Space to drop) |
| Color not the only group differentiator | Group name label always present alongside color. Colorblind-safe palette required. |
| Coach slot empty state | Announced to screen readers via `aria-label="Coach slot: empty"` |
| ScoreBar metrics | Rendered as text, not just visual indicators, so screen readers can read them |
| Form error messages | Associated with inputs via `aria-describedby`; not just color changes |
| Toast notifications | Rendered into an `aria-live="polite"` region |

---

## 10. Visual Design Decisions

### Color Palette for Groups

Groups use a fixed palette of 12 distinct colors to ensure visual differentiation. Palette is selected for colorblind accessibility (avoids red/green as the only distinguishing pair).

```
Team 1:  #3B82F6  (blue)
Team 2:  #8B5CF6  (violet)
Team 3:  #F59E0B  (amber)
Team 4:  #10B981  (emerald)
Team 5:  #EF4444  (red)
Team 6:  #06B6D4  (cyan)
Team 7:  #F97316  (orange)
Team 8:  #84CC16  (lime)
Team 9:  #EC4899  (pink)
Team 10: #14B8A6  (teal)
Team 11: #A78BFA  (purple)
Team 12: #FBBF24  (yellow)
```

If group count exceeds 12, colors cycle with a pattern overlay to differentiate.

### Typography and Spacing

Follows existing SimplyInsilico Tailwind conventions. No new CSS files — all styling through Tailwind utility classes and existing shadcn/ui components.

### Coach Visual Treatment

- Board view: coach hat emoji (🧢) prefix on coach card, Coach Slot uses a darker card background
- Graph view: diamond node shape instead of circle
- In both views, the color is the same as the group — the shape/icon is the differentiator

---

## 11. Open Design Questions

| # | Question | Impact |
|---|---|---|
| DQ-1 | Should the app stepper use separate URLs per step or a single-page wizard? Separate URLs support browser back/forward and deep links; single-page is simpler to build. | Navigation architecture |
| DQ-2 | Should group names be auto-generated ("Team 1", "Team 2") or admin-named? If admin-named, where does naming happen — after the algorithm runs or in setup? | Setup and groups screen design |
| DQ-3 | Is 12 the right maximum number of groups? Groups beyond 12 need color cycling — is that acceptable? | Color palette |
| DQ-4 | Should the friend-match indicator ("3/4 friends here") count only direct friends or also second-degree connections? | Algorithm result display |
| DQ-5 | What is the empty-state design for the Graph view when 0 participants are assigned? | Graph view |
| DQ-6 | Should the CSV import support re-mapping columns (if headers don't match expected names), or require exact column names and show an error? | Participant import UX |
