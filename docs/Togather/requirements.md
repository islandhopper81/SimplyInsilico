# toGather — Product Requirements

`simplyinsilico.com/products/togather/`

_Version 1.0 | SimplyInsilico | V1 Stateless Release_

---

## 1. Introduction

### 1.1 Purpose

This document defines the product requirements for toGather — a group formation tool built and hosted under the Simply Insilico product umbrella. It establishes what the system must do, what it explicitly will not do, and the constraints it must operate within.

The companion document `architecture.md` describes how these requirements will be implemented. This document describes what must be true for the product to be considered complete.

### 1.2 Product Overview

toGather helps league administrators, coaches, and organizers fairly divide a roster of participants into balanced groups. It maximizes friend co-placement, ensures every group is assigned a coach volunteer, and lets the administrator manually adjust the result before exporting.

The v1 release is a stateless, session-based tool. No account is required. The administrator enters or imports their data, runs the algorithm, adjusts the result, and exports. When the browser session ends, the data is gone. Persistence is a v2 feature.

### 1.3 Intended Audience

- Product owner (Simply Insilico)
- Engineering team implementing the feature
- Any stakeholders reviewing scope before development begins

---

## 2. Scope

### 2.1 V1 In Scope

- Participant entry (manual and CSV import)
- Friendship / affinity entry between participants
- Coach volunteer registration and coach-child affinity
- Group formation algorithm (friendship maximization + coach assignment)
- Drag-and-drop manual adjustment of group assignments (Board view and Graph view)
- Group result export (CSV and JSON)

### 2.2 Explicitly Out of Scope for V1

- Schedule management
- Coach conflict detection (schedule-based)
- iCal / calendar feed generation
- Family-facing schedule pages
- SMS or email notifications
- User authentication
- Database persistence (saved sessions)
- Multi-user collaboration
- White-label theming
- Stripe billing or paid tiers

These items are candidates for v2 or later phases and must not be introduced during v1 development.

---

## 3. Functional Requirements

### 3.1 Session Setup

| ID | Requirement |
|---|---|
| REQ-001 | The administrator must be able to create a new session by providing a session name, target group count, and maximum group size. |
| REQ-002 | All three session setup fields (name, group count, max group size) must be required before the administrator can advance to participant entry. |
| REQ-003 | The session name must accept free-form text (e.g. "Spring 2025 T-Ball League"). |
| REQ-004 | Group count and max group size must accept positive integers only. |

### 3.2 Participant Management

| ID | Requirement |
|---|---|
| REQ-010 | The administrator must be able to add participants one at a time via a manual entry form. |
| REQ-011 | Each participant record must include: name (required), age group (required), contact email (optional), willing-to-coach flag (boolean, required — defaults to false). |
| REQ-012 | The administrator must be able to import a roster of participants from a CSV file. |
| REQ-013 | The CSV import must map columns to participant fields and surface a clear error if required columns are missing or malformed. |
| REQ-014 | The administrator must be able to view all entered participants in a list before running the algorithm. |
| REQ-015 | The administrator must be able to remove a participant from the session before running the algorithm. |
| REQ-016 | The administrator must be able to edit a participant's details before running the algorithm. |

### 3.3 Friendship and Affinity Entry

| ID | Requirement |
|---|---|
| REQ-020 | The administrator must be able to record a friendship / affinity relationship between any two participants. |
| REQ-021 | Affinities must have a directional form (from participant A toward participant B) with a default weight of 1.0. |
| REQ-022 | The administrator must be able to enter multiple friendship pairs without restarting a flow. |
| REQ-023 | The system must display all entered affinities so the administrator can review them before running the algorithm. |
| REQ-024 | The administrator must be able to remove an affinity before running the algorithm. |

### 3.4 Coach Volunteer Registration

| ID | Requirement |
|---|---|
| REQ-030 | Any participant may be flagged as willing to coach using the `willingToCoach` boolean on their participant record. |
| REQ-031 | When a participant is flagged as willing to coach, the system must automatically create a coach-child affinity edge at weight 2.0 between that participant and their linked child in the roster. This is not entered manually — it is inferred by the system. |
| REQ-032 | If a coaching volunteer has no linked child in the roster, the `willingToCoach` flag must still be honored. No auto-affinity is created, but the participant remains eligible for coach assignment. |
| REQ-033 | The administrator must be able to view which participants are flagged as willing to coach before running the algorithm. |

### 3.5 Group Formation Algorithm

| ID | Requirement |
|---|---|
| REQ-040 | The administrator must be able to trigger the group formation algorithm from the group view after completing participant and affinity entry. |
| REQ-041 | The algorithm must assign every participant to exactly one group. |
| REQ-042 | No group may exceed the maximum group size set in session setup. |
| REQ-043 | The algorithm must attempt to place friends (participants connected by affinity edges) in the same group. Friend co-placement is a soft objective. |
| REQ-044 | Every group must be assigned exactly one head coach. Coach assignment is a hard constraint. |
| REQ-045 | If the number of willing coaches is fewer than the number of groups, the algorithm must not produce an invalid assignment. Instead, it must return a structured warning identifying which groups are uncovered, and surface that warning to the administrator before any assignments are written. |
| REQ-046 | If too many coaches cluster in one social group, the algorithm must distribute them across groups even if doing so slightly reduces friend co-location. Coach coverage takes priority over friend satisfaction. |
| REQ-047 | The system must display a Friend Satisfaction score (percentage of friendship edges where both participants are in the same group) after the algorithm runs. |
| REQ-048 | The system must display a Coach Coverage indicator (number of groups with an assigned head coach vs. total groups) after the algorithm runs. Groups missing a coach must be visually flagged. |
| REQ-049 | A JavaScript greedy fallback algorithm must be available client-side. It must activate automatically if the algorithm API endpoint is unavailable. The fallback is sufficient for small leagues (under ~50 participants). |

### 3.6 Board View

| ID | Requirement |
|---|---|
| REQ-050 | The system must display a Board view of group assignments after the algorithm runs, organized as one column per group in a Trello-style layout. |
| REQ-051 | Each group column must have a designated Coach Slot at the top. The slot must be visually distinct. If the slot is empty (no head coach assigned), it must be highlighted to signal the gap. |
| REQ-052 | Each participant card in the Board view must display the participant's name and a friend-match indicator (e.g. "3 of 4 friends on this team"). |
| REQ-053 | The administrator must be able to drag a participant card from one group column to another to manually reassign them. |
| REQ-054 | Moving a participant must update the Friend Satisfaction score and Coach Coverage indicator immediately without re-running the algorithm. |

### 3.7 Graph View

| ID | Requirement |
|---|---|
| REQ-060 | The system must display a Graph view of group assignments as an interactive node-edge canvas, accessible via a toggle from the Board view. |
| REQ-061 | Each node in the Graph view must represent a participant. Nodes must be colored by group membership. |
| REQ-062 | Coach-volunteer nodes must be rendered with a visually distinct shape (e.g. diamond) to differentiate them from regular participant nodes (circle). |
| REQ-063 | Friendship edges must be drawn between connected participants. Coach-child edges must be visually distinct from standard friendship edges (e.g. thicker or a different style). |
| REQ-064 | The administrator must be able to drag a node to reassign a participant to a different group. |
| REQ-065 | Shift-dragging a node must move that participant and all of their directly connected neighbors as a cluster. |
| REQ-066 | Moving a participant in the Graph view must update the same Friend Satisfaction and Coach Coverage indicators as the Board view. |

### 3.8 View Toggle

| ID | Requirement |
|---|---|
| REQ-070 | The administrator must be able to switch between Board view and Graph view at any time using a persistent toggle control. |
| REQ-071 | Switching views must not recalculate group assignments. Both views read from the same shared state. |

### 3.9 Export

| ID | Requirement |
|---|---|
| REQ-080 | The administrator must be able to export group assignments as a CSV file. |
| REQ-081 | The CSV export must include one row per participant with at minimum: participant name, assigned group, and head coach for that group. |
| REQ-082 | The CSV must be formatted for direct import into common league management tools (e.g. TeamSnap, GameChanger). |
| REQ-083 | The administrator must be able to export the full session state as a JSON file. |
| REQ-084 | The JSON export must capture all session data: session settings, all participants, all affinities, all group assignments including coach assignments. |
| REQ-085 | The administrator must be able to re-import a previously exported JSON file to restore a session in a future browser session. This is the v1 workaround for persistence. |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|---|---|
| REQ-100 | The algorithm must complete in under 1 second for leagues of up to 500 participants. |
| REQ-101 | The system must operate without any server-side database in v1. All state lives in browser memory (Zustand) for the duration of the session. |
| REQ-102 | The system must not require the administrator to create an account or authenticate in v1. |
| REQ-103 | The system must be fully functional in the latest stable versions of Chrome, Firefox, Safari, and Edge. |
| REQ-104 | The Graph view must handle at least 200 participant nodes without significant performance degradation. |
| REQ-105 | The application must be accessible at a minimum to WCAG 2.1 Level A. Drag-and-drop interactions must have a keyboard-accessible alternative. |
| REQ-106 | The toGather tool must be hosted as part of the existing SimplyInsilico Next.js application — not as a separate deployment. |

---

## 5. Data Requirements

These field definitions govern what the system stores in session state. They are also designed to match the future database schema to minimize migration effort in v2.

### 5.1 Session

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | e.g. "Spring 2025 T-Ball League" |
| `groupCount` | number | Yes | How many teams/groups to form |
| `maxGroupSize` | number | Yes | Hard cap per group |

### 5.2 Participant

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string (uuid) | Yes | Generated by the system |
| `name` | string | Yes | |
| `ageGroup` | string | Yes | |
| `contactEmail` | string | No | |
| `willingToCoach` | boolean | Yes | Defaults to false |
| `coachingNotes` | string | No | Optional free-text notes |

### 5.3 Affinity

| Field | Type | Required | Notes |
|---|---|---|---|
| `fromId` | string (participant id) | Yes | Directed edge origin |
| `toId` | string (participant id) | Yes | Directed edge destination |
| `weight` | number | Yes | Default 1.0; coach-child auto-affinity is 2.0 |

### 5.4 Group

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string (uuid) | Yes | Generated by the system |
| `name` | string | Yes | e.g. "Team 1" or admin-assigned name |
| `color` | string | Yes | For visual distinction in Board and Graph views |
| `memberIds` | string[] | Yes | Ordered list of participant IDs |
| `headCoachId` | string \| null | Yes | Participant ID of assigned coach; null if gap exists |

### 5.5 Session Metadata

| Field | Type | Notes |
|---|---|---|
| `meta.assignedBy` | `"algorithm"` \| `"manual"` | Tracks whether last assignment was algorithm-generated or manually adjusted |
| `meta.satisfactionScore` | number (0–1) | Fraction of friendship edges that are intra-group |
| `meta.coachCoverage` | number | Count of groups with a head coach assigned |

---

## 6. URL Structure

| Route | Purpose |
|---|---|
| `/products/togather/` | Public landing page — product description and call to action |
| `/products/togather/app/setup` | Step 1 — session name, group count, max group size |
| `/products/togather/app/participants` | Step 2 — participant entry, CSV import, affinity entry, coach volunteer flagging |
| `/products/togather/app/groups` | Step 3 — run algorithm, Board + Graph views, drag adjustment, export |
| `/api/togather/algorithm` | POST endpoint — accepts graph JSON, returns group assignments, saves nothing |

---

## 7. Algorithm Requirements (Detail)

| ID | Requirement |
|---|---|
| REQ-200 | The algorithm must use a two-phase approach: Phase 1 builds social clusters using community detection on the friendship graph; Phase 2 applies constraint satisfaction to enforce max group size and guarantee coach coverage. |
| REQ-201 | Coach-child affinity edges (weight 2.0) must be included in the Phase 1 graph so coaching parents are strongly pulled onto the same team as their child before friend preferences are considered. |
| REQ-202 | The algorithm endpoint must be stateless. It accepts a graph payload and returns assignments. It must not write to any data store. |
| REQ-203 | The algorithm endpoint must return a structured error response (not a 500) when coach coverage cannot be satisfied. The response must identify how many coaches are available vs. how many groups need coverage. |
| REQ-204 | The JavaScript fallback must produce valid group assignments (all participants assigned, no group over max size). It does not need to guarantee coach coverage — that is a best-effort constraint for the fallback only. |

---

## 8. V2 Requirements (Deferred)

The following requirements are defined here for planning continuity but must not be implemented in v1.

| ID | Requirement |
|---|---|
| REQ-300 | Users must be able to create an account using magic link authentication (no passwords). |
| REQ-301 | Authenticated users must be able to save a session to a database and return to it later. |
| REQ-302 | The session data model in the database must match the v1 Zustand state shape exactly to avoid a data migration. |
| REQ-303 | Authenticated users must be able to view a dashboard listing their saved sessions. |
| REQ-304 | Multiple administrators within the same organization must be able to share access to a session. |

---

## 9. Open Questions

The following questions are unresolved and must be answered before or during implementation. They are carried forward from the architecture document.

| # | Question |
|---|---|
| OQ-1 | How will friend preferences be collected? Options: admin enters them manually in the tool, participants fill out a form themselves, or data is imported from registration CSV. The answer affects the participant entry UX significantly. |
| OQ-2 | How will coach volunteering be collected? Ideally part of the same registration form as friend preferences so all data arrives together — but the collection mechanism is undefined. |
| OQ-3 | If a coaching parent's child is in a different age group than the team they want to coach, does the coach-child affinity still apply? Or does the admin override it manually? |
| OQ-4 | Should the algorithm endpoint be a Vercel Python serverless function or a separate service (e.g. Render)? Render avoids cold-start issues but adds a second deployment to manage. |
| OQ-5 | Is JSON re-import sufficient as a v1 persistence workaround, or is there a minimum bar of saved state that makes v1 feel incomplete without a database? |
| OQ-6 | Should the app use a multi-page stepper (separate URL per step) or a single-page wizard? Multi-page is more shareable and browser-back friendly; single-page is simpler to build. |
| OQ-7 | What is the requirement ID scheme to use for traceability into Jira? This document uses REQ-### — confirm this is acceptable before tickets are created. |

---

## 10. Out of Scope

The following are explicitly excluded from all v1 work and must not be introduced:

- Schedule management of any kind
- Coach availability or conflict detection
- iCal / calendar feed generation
- Family-facing schedule or team pages
- SMS, email, or push notifications
- User authentication or account creation
- Database or any server-side persistence
- Multi-user collaboration on a shared session
- White-label theming or custom branding
- Stripe, billing, or any paid tier infrastructure
- Scheduling features (beyond group formation)
