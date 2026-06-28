# Agent Development Rules & Architecture Guidelines (AGENT.md)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This document serves as the absolute global rulebook and execution framework for AI Agents, Copilots, and developers working on the **Talas** codebase. Every code generation, architectural decision, and feature implementation must strictly comply with the guidelines defined herein.

---

## 1. Core Architectural Paradigm: Modular Monolith

Talas is strictly designed as a **Modular Monolith**. The codebase must maintain highly isolated domain boundaries to ensure seamless future extraction into independent Go-based microservices.

### 1.1. Directory Structure Standards

All core business domains must reside within their respective encapsulated folders inside `src/modules/[module_name]/`. The structure of each module is strictly locked to the following pattern:

```text
src/modules/[module_name]/
├── [module_name].interface.ts   # Data contracts, type definitions, DTOs, and cross-module facades
├── [module_name].aggregator.ts  # Complex READ operations involving cross-module JOIN queries
├── /services
│   └── [module_name].service.ts     # Core domain business logic & strict isolated WRITE operations
├── /types
│   └── [module_name].ts             # TypeScript interfaces, DTOs, and response shapes
└── /utils
    └── *.ts                         # Pure, micro-unit helper functions isolated to this module
```

> **Note:** The `/types` directory is mandatory in every module and was established as a pattern throughout this project. All interfaces (`*Item`, `*Input`, `*Filter`) must reside here, never inlined inside service or aggregator files.

### 1.2. Strict Architecture Layering Rules

1. **Layer API (Route Handlers):** Located at `src/app/api/...`. Responsible _only_ for receiving HTTP requests, executing initial schema validations using Zod, invoking the designated Module Interface, and returning HTTP responses. Direct database queries or business logic inside route handlers are **strictly prohibited**.
2. **Layer Interface (Cross-Module Facade):** Module A **is explicitly forbidden** from invoking the Service layer of Module B directly. Cross-module communication must pass through the target module's `.interface.ts` file. This decouples dependencies so that when a module transitions into a microservice, only the interface implementation changes.
3. **Layer Service & Aggregator Boundary:**

- `*.service.ts` files must handle core domain modifications and **strictly local WRITE operations** (Create/Update/Delete) targeting only the module's dedicated tables.
- `*.aggregator.ts` files are specialized for **permissive READ operations**. They are allowed to execute cross-module relational database `JOIN` operations (via Prisma `include` or `select`).

4. **Layer UI & Presentation:** Strict segregation between Server Components (`page.tsx`) for initial data fetching/SEO, and Client Components (`*Client.tsx`) for user interactions, dynamic local state, and Framer Motion animations.

### 1.3. URL & Routing Conventions

- Artifact detail pages use the URL pattern `/{username}/af/{slug}` — the `af` prefix (abbreviation for "artifact") is mandatory to distinguish artifact routes from other user-scoped pages.
- Route segment files follow Next.js App Router conventions: `src/app/(main)/[username]/af/[slug]/page.tsx` (Server Component) + `ArtifactDetailClient.tsx` (Client Component).

### 1.4. Module Scaffolding

A `generate-module` script exists at `scripts/generate-module.mjs`. Always use it when bootstrapping a new module:

```bash
node scripts/generate-module.mjs [module_name]
```

This creates the full directory structure including `/types`, `/services`, and `/utils` folders with `.gitkeep` placeholders.

---

## 2. Database Interaction & Query Rules

To optimize execution on a resource-constrained environment (**VPS 2 Core / 2GB RAM**), database patterns must meticulously adhere to these structural policies:

### 2.1. The Rule of Write (Strict Isolation)

- **No Direct Cross-Table Mutations:** A module's service layer must never execute `INSERT`, `UPDATE`, or `DELETE` queries on tables owned by a different domain.
- **Event-Driven / Coordination via Interface:** If a business transaction spans multiple domains, the mutation must be coordinated via Interface facades or triggered asynchronously. For non-critical side effects (e.g., notifications after a discussion is created), use **fire-and-forget** (`Promise` without `await`, wrapped in `.catch()`) so that failures in the side effect do not rollback the primary transaction.

### 2.2. The Rule of Read (Permissive Join & Aggregation)

- **Prisma Joint Optimization:** To preserve memory and prevent high CPU overhead from client-side data stitching, cross-module `JOIN` queries are fully authorized inside `*.aggregator.ts` using Prisma's native `include` statements.
- **Fuzzy Search Strategy:** Global search capabilities across Artifacts, Users, and Guilds must utilize the native **PostgreSQL Trigram (`pg_trgm`)** extension. Do not implement heavy Node.js-based fuzzy search libraries (e.g., Fuse.js) on the backend to avoid Out-Of-Memory (OOM) fatal crashes on the 2GB RAM VPS.

### 2.3. Denormalization & Cache Policy

- Read-heavy list views (e.g., Feeds, Profile Summaries, Dashboard statistics) must fetch data exclusively from the pre-calculated, denormalized counter fields embedded in the `User`, `Artifact`, and `Discussion` models. Avoid runtime dynamic SQL `COUNT(*)` aggregations on high-traffic endpoints.

### 2.4. Prisma Schema Integrity Rules

- **Field-Schema Alignment:** TypeScript interfaces in `/types` must always be 100% aligned with the Prisma schema. Never add fields to an interface that do not exist in the corresponding Prisma model. Always cross-reference `schema.prisma` before writing type definitions.
- **Unique Constraint Scope:** `@@unique` constraints in Prisma apply globally across all records. Do NOT use a broad `@@unique` to enforce logic that only applies to a subset of rows (e.g., only for certain enum values). Partial uniqueness must be enforced at the **service layer** using `findFirst + conditional update/create`.
- **Prisma Client Staleness:** After running `prisma migrate dev` or `prisma generate` while the Next.js dev server is running, the server **must be restarted** to reload the new Prisma Client from memory. Hot module replacement does not reload native Node.js modules.
- **Migration Strategy:** When schema drift is detected (e.g., DB created without migrations), use `prisma migrate reset --force --skip-seed` followed by `prisma migrate dev` to reconcile.

---

## 3. Strict Module Specifications & Business Rules

Every feature implementation generated by an agent must satisfy the precise functional specifications recorded in Section 4 and Section 7 of the PRD:

### 3.1. Auth & User Module

- **Identity Options:** Authentication must natively support flexible lookup via either unique username or verified email address.
- **Session Integrity:** User sessions must be managed via secure, cryptographically signed JSON Web Tokens (JWT) stored in client browsers using HTTP-only, `Secure`, and `SameSite=Strict` cookies. A `refresh_token` flow via `/api/auth/refresh` must be implemented to silently renew expired access tokens, preventing forced logouts on 401 responses.
- **Token Interceptor:** The `apiClient` (`src/lib/apiClient.ts`) must automatically intercept 401 responses, call `/api/auth/refresh`, and retry the original request seamlessly before surfacing errors to the user.
- **Verification Block:** Users registered manually must be completely blocked from bypassing the verification wall or accessing internal endpoints until their account state transitions to `is_verified: true` via valid OTP entry. OTP expiration window is strictly set to 15–30 minutes.
- **Google OAuth Behavior:** If an OAuth signup occurs with a completely new email, the system must redirect the user to `/setup-username` to enforce the declaration of a distinct, unique username before minting the session token. Google profile photos must be automatically downloaded and stored in Cloudflare R2 during this flow.

### 3.2. Artifact & Collaborative Co-Authoring Module

- **Markdown Standard:** Document body storage must adhere to native string Markdown/MDX formats produced by the `MDXEditor` engine.
- **Co-Author Limitations:** Multi-user authoring invitations are strictly capped at a maximum allowance of 5 designated co-authors per individual Artifact.
- **Slug Collisions:** Slug production is dynamically derived from the title string. In the event of a collision detection within the database, a numerical Unix timestamp suffix must automatically be appended to the newly formed slug string.
- **Ownership Controls:** Only the master owner/creator of the Artifact holds structural authority to edit, delete, or archive the record. Co-authors/Collaborators are restricted to a singular, non-destructive administrative action: "Leave Collaboration".
- **Tag System:** Artifacts support a many-to-many tag relationship via `ArtifactTag` junction table. Tags have both a `name` and a unique `slug` field. Slug is auto-derived from the tag name.
- **Media Storage:** All artifact images are stored under the `/artifacts` folder prefix in Cloudflare R2 (not `/avatars`). Media file sizes must always be recorded in the `Media.size` field.

### 3.3. Guild Module

- **Open Visibility:** All Guilds created within the platform are completely public by default. Any authenticated or anonymous guest can read their feeds without subscribing.
- **Insights Authorization:** Access to the Guild analytical dashboard layer (`/insight`) is exclusively restricted to the designated `Guild Owner`. Unprivileged access attempts must immediately redirect to the public Guild root with an HTTP 401 Unauthorized payload.
- **Time Filters:** The aggregation backend supporting the dashboard charts must strictly expose filtering options mapped to standard Weekly and Monthly time ranges.

### 3.4. Nested Discussions System

- **Structural Depth Boundary:** Threaded conversation responses are strictly hard-capped to a maximum hierarchy level of 3 (Level 3). Any reply targeted at a Level 3 comment must structurally and visually render flush at Level 3 within the schema to prevent layout breaking on viewport screens.
- **Optimistic Updates:** When a user submits a discussion or reply, an optimistic update must be applied immediately to the UI before the server confirms. Root discussions are prepended to the top of the list; replies are prepended to the top of their parent's reply list.
- **Mentions Integration:** Tapping the `@` identifier must trigger a dynamic auto-complete dropdown menu. Upon successful publication, the raw mention text must convert to an active profile hyperlink, concurrently firing a specialized notification event to the mentioned user.
- **Discussion Input UX:** The discussion textarea must start as a single-line input and auto-expand as the user types. Maximum length is **200 words** (not characters). A live word count is displayed at the bottom-left, aligned with the submit button.

### 3.5. Merit-Based Reputation (Boost / Reduce) Engine

- **Toggle & Transition Logic:** Clicking an active interaction state button must undo the operation and reset the vote weight back to a completely neutral value. If a user has voted "Boost" and immediately fires a "Reduce" interaction, the system must implicitly toggle off the Boost record and persist the new Reduce vote in a single transactional action.
- **Animation Behavior:** When transitioning between Boost and Reduce states, a slide animation (using Framer Motion) must play to indicate the directional switch. Count displays must always show `0` explicitly, never be empty.
- **MVP Scope Restriction:** Volatile interaction votes (Boost/Reduce clean metrics) must exclusively influence feed sorting matrix algorithms and are restricted from updating a user's absolute profile karma during the MVP phase.

### 3.6. Artifact Archiving & Curated Collection Vault

- **Cascade on Archive/Delete:** When an author deletes or archives an Artifact, background worker queues must immediately wipe out all corresponding relational ties mapping that specific entry across all external user Collection Vaults to ensure ironclad user privacy enforcement.
- **Vault Visibility:** User bookmarks are isolated to a single container per account and are strictly hidden behind JWT verification walls; no public view of another user's collection is permissible.

### 3.7. Multi-Channel Notification Hub

- **Aggregation Strategy (Instagram-style):** Notifications for aggregate-type events (`ARTIFACT_BOOST`, `ARTIFACT_AMPLIFY`, `NEW_WATCHER`) use a **findFirst + conditional update/create** pattern — 1 row per `(user_id, type, artifact_id)`. The `actor_count` field is incremented and `last_actor_id` is updated on each new event. Do NOT use `prisma.upsert()` for this; use manual `findFirst` followed by `update` or `create`.
- **Non-Aggregate Notifications:** Events of type `NEW_DISCUSSION`, `DISCUSSION_REPLY`, `USER_MENTION`, and `COLLAB_*` create a **new row per event**, since each event is distinct.
- **Discussion Notification Rules:**
  - Root discussion (no `parent_id`): Send `NEW_DISCUSSION` to the **artifact owner only**.
  - Reply (has `parent_id`): Send `DISCUSSION_REPLY` to the **direct parent author** AND `NEW_DISCUSSION` to the **artifact owner**.
  - Grandparent and further ancestors are **never notified**.
  - Dedup: If `parent author === artifact owner`, send only 1 notification (`DISCUSSION_REPLY`) to avoid duplicate notifications to the same person.
  - Self-skip: Never send a notification when `actor_id === recipient_id`.
- **Delivery Mechanism:** Notifications triggered as side effects of other operations (e.g., after `createDiscussion`) must be dispatched **fire-and-forget** using `Promise.allSettled()`. Failures must be logged via `console.error` but must not rollback or fail the primary operation.
- **Client-Side Polling Policy:** To shield the VPS RAM ceiling from persistent socket allocations, do not implement WebSockets or Server-Sent Events (SSE). The notification dashboard must fetch and update data using client-driven periodic polling powered by `TanStack React Query` refetch interval cycles.
- **Bulk Read Automation:** Triggering the display of the notification panel must automatically fire a background batch update converting all unread messages targeted to that recipient into a read state (`is_read: true`), negating the need for a manual "Mark all as read" button.

### 3.8. Media Module & Storage Rules

- **Client-Side Heavy Lifting:** Image compression, canvas cropping, and WebP asset transformations must be handled completely on the user's browser using Web Workers before transmission to prevent CPU degradation on the VPS host server.
- **Direct S3 Uploads:** Files must be routed to Cloudflare R2 via secure server-generated Presigned URLs using an HTTP `PUT` action directly from the browser instance.
- **Folder Conventions:** Avatar/profile images → `/avatars/` prefix. Artifact images → `/artifacts/` prefix. These must never be mixed.
- **Next.js Image Optimization:** All external image domains (e.g., Cloudflare R2 hostname, Google user content) must be registered in `next.config.ts` under `images.remotePatterns`. The first meaningful image above the fold (LCP candidate) must use `loading="eager"` and `priority`. When resizing a `next/image` with CSS, always include `width="auto"` or `height="auto"` to preserve aspect ratio.

---

## 4. Coding Conventions & Code Generation Directives

When generating or editing code blocks, agents must respect these structural paradigms:

1. **Type Safety:** TypeScript is non-negotiable. Avoid `any` types at all costs. Utilize Prisma-generated types for database input/output transformations.
2. **Input Validation:** Every endpoint handling user input must enforce strict Zod runtime verification checks immediately within the API layer.
3. **Error Handling:** Implement centralized catch blocks mapping error states to consistent JSON API payloads:

```json
{
	"success": false,
	"error": "SPECIFIC_ERROR_CODE",
	"message": "Human-readable explanation aligned with business rules."
}
```

4. **Prisma Operations:** Keep data models lean. Always supply indexing wrappers (`@@index`) for fields frequently scanned inside search parameters or relation lookups. Always include proper cascading parameters (`onDelete: Cascade`) for junction models to safeguard against orphan data pollution.
5. **Testing:** Integration tests for service-layer logic must be written using **Vitest** (`npm test`). Tests must use a real database connection with per-test cleanup via `afterEach` using `deleteMany`. Minimum 3 test cases per service method, targeting real edge cases (not happy-path only). The Vitest config is at `vitest.config.ts` with `pool: "forks"` and `singleFork: true` for sequential execution to prevent DB race conditions.
6. **UI Animation:** Use **Framer Motion** for all micro-animations. State transition animations (e.g., Boost ↔ Reduce toggle) use slide/scale variants. Collect and Amplify buttons use scale-bounce animations on click. Never use CSS `transition` alone for interactive state changes in the interaction bar.
7. **Toast Notifications:** All user-facing success/error feedback for async operations must use **Sonner** (`sonner` package). Separate developer-facing errors must be logged to `console.error` with a `[Developer Log]` prefix.

<!-- END:nextjs-agent-rules -->
