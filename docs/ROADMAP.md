# Mindcraft Digital Studio — Phase 2 Development Roadmap

Source: `AI_Image_Studio_Phase_2_Detailed_Development_Plan.pdf` (35 pages). Numbering and order are preserved from the original.
**➕ = added after review (2026-10-11)** to fix gaps between the PDF plan and the V2 design. See "Review notes" at the bottom.
Estimated effort: PDF says 38–62 dev days; realistically **3–4 months** when learning and coding manually.

---

# New module plan (in progress, started 2026-10-13)
After the reset, the project is rebuilt module by module. Each module is vertical: table → repository → service → API → UI. Admin-side config modules come before the user-side modules that use them. This section replaces the phase plan below once it is complete; until then the old plan stays for reference only.

Conventions for all tables:
- Primary keys are UUID.
- JS uses camelCase, DB uses snake_case via `drizzle({ casing: 'snake_case' })`.
- Every table has `createdAt`. Column names are not written by hand (`uuid()`, not `uuid('id')`); index and unique constraint names are, because drizzle-kit otherwise names unique constraints in camelCase. Mutable tables also have `updatedAt` with `.$onUpdate(() => new Date())`.
- Fixed value sets are `pgEnum`, not free VARCHAR.
- Tokens are never stored raw, only their hash.

## Module 1 — Identity & Access (schema decided 2026-10-13; tables + migration 0000 done; `POST /api/auth/register` + `POST /api/auth/login` + `POST /api/auth/refresh` + `POST /api/auth/logout` + auth hook + admin hook + `npm run admin:promote` + `GET /api/auth/me` + session management (`GET /api/auth/sessions`, `DELETE /api/auth/sessions/:familyId`, `POST /api/auth/logout-others`) done; automated tests: `npm test`, 37 passing)
3 tables: `users`, `auth_sessions`, `auth_tokens`. There is **no `roles` table**: a user has exactly one role and roles carry no permissions, so it is an enum. If permissions are ever needed, a `roles` + `role_permissions` design replaces the enum then.

Enums:
- `user_role`: `admin` · `user`
- `user_status`: `active` · `suspended`
- `auth_token_type`: `email_verify` · `password_reset`

**`users`**
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(150) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, unique on `lower(email)`; stored lowercased |
| passwordHash | TEXT | NOT NULL |
| role | `user_role` | NOT NULL, default `user` |
| status | `user_status` | NOT NULL, default `active` |
| emailVerifiedAt | TIMESTAMPTZ | nullable |
| lastLoginAt | TIMESTAMPTZ | nullable |
| createdAt / updatedAt | TIMESTAMPTZ | NOT NULL |

**`auth_sessions`** (one row per refresh token; rotation creates a new row)
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → users.id, on delete cascade, indexed |
| familyId | UUID | NOT NULL, indexed; shared by all tokens rotated from one login |
| refreshTokenHash | TEXT | NOT NULL, UNIQUE |
| replacedById | UUID | nullable, FK → auth_sessions.id |
| userAgent | TEXT | nullable |
| ipAddress | VARCHAR(45) | nullable |
| expiresAt | TIMESTAMPTZ | NOT NULL |
| lastUsedAt | TIMESTAMPTZ | nullable |
| revokedAt | TIMESTAMPTZ | nullable |
| createdAt | TIMESTAMPTZ | NOT NULL |

Reuse detection: if a refresh token that already has `replacedById` (or `revokedAt`) is presented again, revoke every session in its `familyId`.

**`auth_tokens`** (email verification + password reset)
| Field | Type | Constraint |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → users.id, on delete cascade, indexed |
| type | `auth_token_type` | NOT NULL |
| tokenHash | TEXT | NOT NULL, UNIQUE |
| expiresAt | TIMESTAMPTZ | NOT NULL |
| usedAt | TIMESTAMPTZ | nullable; single use |
| createdAt | TIMESTAMPTZ | NOT NULL |

Relationships: one user → many sessions · one user → many auth tokens.

## Module 2 — AI Providers (in progress: `ai_providers` table + migration 0001, admin CRUD `POST /api/admin/providers`, `GET /api/admin/providers`, `GET /:id`, `PATCH /:id` (name only; code is immutable), `PATCH /:id/status`, `DELETE /:id` + tests, admin UI `/admin/models` done)
Table `ai_providers`: `id` UUID PK · `code` VARCHAR(50) UNIQUE (stored lowercase) · `name` VARCHAR(100) · `isActive` BOOLEAN default false · `createdAt` · `updatedAt`. Kept as a plain admin CRUD for now (user decision 2026-10-13); the adapter registry idea was dropped until real provider integrations are built.

## Module 3 — AI Models (done: `ai_models` table + migration 0002, admin APIs `POST /api/admin/models`, `GET /api/admin/models` (page, limit, search, providerId, status), `GET /:id`, `PATCH /:id` (name, description, sortOrder), `PATCH /:id/status` + provider delete 409 while it has models + tests, admin UI `/admin/models` done)
Table `ai_models`: `id` UUID PK · `providerId` FK → ai_providers (on delete restrict) · `name` VARCHAR(150) · `slug` VARCHAR(150) UNIQUE · `providerModelId` VARCHAR(150) · `description` TEXT null · `status` enum draft/active/disabled/deprecated default draft · `sortOrder` INT default 0 · `createdBy` / `updatedBy` FK → users (on delete set null) · `createdAt` · `updatedAt`. UNIQUE (providerId, providerModelId). Decisions: no adapter checks yet; all statuses allowed until pricing exists (Module 5 adds the activation check); providerId, providerModelId and slug are immutable; no model delete; provider delete returns 409 while it has models; admin UI at /admin/models.

## Module 4 — Generation Types & Model Workflows (in progress: tables + migration 0003 with seed, admin APIs `POST /api/admin/generation-types`, `GET /api/admin/generation-types`, `PATCH /:id`, `PATCH /:id/status`, `DELETE /:id`, `GET /api/admin/models/:modelId/generation-types`, `PUT /api/admin/models/:modelId/generation-types/:typeId` + tests, admin UI `/admin/generation-types` and `/admin/models/:id` workflows done)
Tables: `generation_types` (`id`, `code` UNIQUE, `name`, `description`, `isActive` default true, timestamps; seeded with `text_to_image`, `image_edit`, `image_to_image`) and `ai_model_generation_types` (`id`, `modelId` FK → ai_models on delete cascade, `generationTypeId` FK → generation_types on delete restrict, `isEnabled` default false, `enabledOptions` JSONB, `defaultOptions` JSONB, timestamps; UNIQUE (modelId, generationTypeId)). Decisions (2026-10-13): no separate capabilities table and no configVersion; no adapter or provider-capability checks yet, options are validated against a fixed code-side list of sizes, qualities, output formats and max images; generation types are seeded and admins can also create, rename, toggle and delete them (delete returns 409 while a model uses the type; user decision 2026-10-13); one PUT endpoint per model + type saves isEnabled, enabledOptions and defaultOptions; a workflow cannot be enabled without valid options or while its type is inactive; UI: generation types page + workflows on a model detail page.

---

# Old phase plan (reference only, superseded by the module plan above)

## Working rules
- **The user writes the code manually** — this is a learning project. Explain, guide, review; don't dump full implementations unless asked.
- Complete each substep, **test it**, then move to the next.
- Feature-based modular monolith.
- Start with a **simple synchronous** image-generation flow; move to a BullMQ worker in **Phase 2.7**.
- If the selected image provider does not support a feature, **don't force-implement it** — hide/disable it in the UI (capability-driven).
- UI reference: approved V2 design → see [DESIGN.md](DESIGN.md).
- ➕ **Tests with every phase**, not only in 2.10. Each phase ends with a test checkpoint (unit + Fastify `inject` route tests, provider mocked).
- ➕ **Optional thin UI slices:** if motivation needs something visible, build a rough page for a feature right after its backend; the polished V2 UI still happens in 2.8.

## Tech stack
| Layer | Choice |
|---|---|
| Backend | Node.js + Fastify + **JavaScript** (ES modules, not TypeScript) |
| Frontend | Next.js + Tailwind + shadcn/ui |
| AI | LangChain.js + compatible image provider SDK |
| Database | PostgreSQL + Drizzle |
| Async | Redis + BullMQ (separate worker process) |
| Storage | Cloudflare R2 or Supabase Storage (private bucket, signed URLs) |
| Realtime | SSE or Socket.IO (pick one in 2.7.6) |
| Auth / Billing | JWT (access + refresh rotation) / Stripe (optional, later) |

## Recurring "how to do it" patterns (the PDF repeats these per substep)
- **Feature:** define input/output + business rule → small working example → persist/connect data → verify happy path + edge cases.
- **Config/integration:** add package/config, keep secrets in env, validate env at startup, verify with a health/smoke check.
- **Validation:** Fastify JSON Schemas (Ajv) with limits; test valid, missing, invalid and boundary inputs.
- **DB table:** Drizzle schema with IDs, FKs, constraints, timestamps → migrate → insert/read a sample row. Note indexes.
- **API route:** Fastify route + JSON Schema validation + auth/ownership check + service call + predictable success/error response.
- **Ownership:** verify identity; users only access their own resources; test unauthorized + cross-user access.
- **Provider:** map app's internal options to provider-specific args per provider docs; identify supported capabilities.
- **Errors:** map to categories, safe client message, structured logs; never expose provider internals.
- **Retries:** limited attempts for transient errors, exponential backoff, stop on permanent errors, avoid duplicate generation/billing.
- **Status:** clear lifecycle states persisted in DB; reject illegal transitions; consistent status to client.
- **Uploads:** allowed types, real file signature (magic bytes), size, dimensions; streaming + temp-file cleanup; ownership.
- **Logging:** structured logs with request/job ID, duration, error category; redact tokens/secrets.
- **Credits/ledger:** idempotency, insufficient balance, failed transaction scenarios.
- **Frontend:** implement V2 screen as responsive component; start with mock state, then wire authenticated API + loading/error states.
- **Tests:** automated success + at least one failure/edge case; mock external provider.

---

## Phase 2.1 — Backend Foundation & LangChain Setup
Deliverable: authenticated Fastify backend, PostgreSQL/Drizzle, LangChain fundamentals, provider foundation.

- **2.1.1 Project Initialization:** ES-module Node project · Fastify + deps · env vars (validated) · JS import aliases · ESLint + formatting
  - ➕ 2.1.1.6 **Local services without Docker (Windows):** install **PostgreSQL** with the official Windows installer (includes pgAdmin). **Redis** is only needed from 2.7: Redis has no official Windows build, so use **Memurai** (Redis-compatible Windows app, free dev edition) or a free hosted **Upstash Redis**. Decide at 2.7.1.2.
  - ➕ 2.1.1.7 **Repo structure:** follow `docs/FOLDER_STRUCTURE.md` (copied from the sibling `business book` project): `backend/` (API + worker as two entry points, 2.7.7.1) and `client/` (2.8).
- **2.1.2 Application Architecture:** feature-based folders · app bootstrap · Fastify plugins · route/controller/service separation · shared utils & constants
- **2.1.3 Fastify Core Config:** CORS · Helmet · rate limiting · Pino request logging · global error handler · JSON Schema request validation (Fastify built-in, not Zod) · graceful shutdown · health endpoint
- **2.1.4 Database Setup:** PostgreSQL connection · Drizzle config · migrations · `users` table · sessions/refresh-tokens table · repository pattern
  - ➕ 2.1.4.7 **User settings** (table or JSON column): default model, default aspect ratio, auto-enhance prompts, save originals with edits, notification toggles, theme, `onboarding_completed_at`
- **2.1.5 Authentication:** register · login · password hashing · access + refresh tokens · protected routes · refresh-token rotation · logout · forgot/reset password
  - ➕ 2.1.5.9 **Email service** behind an interface: in dev just **log the email (reset link) to the console**, a real provider (e.g. Resend/SMTP) in prod; used by forgot/reset password. Reset tokens hashed, single-use, short expiry.
  - ➕ 2.1.5.10 **Profile & settings API:** `GET/PATCH /api/me`, `GET/PATCH /api/me/settings`, change password (Settings screen)
- **2.1.6 LangChain Fundamentals:** what LangChain.js is · models/providers · prompt templates · Runnable interface · Runnable sequences · output parsers · LangChain error handling · provider SDK vs LangChain responsibilities
- **2.1.7 AI Provider Foundation:** select image provider · API credentials · image-generation provider adapter · LangChain model for prompt enhancement + vision · timeouts & retry policy · normalize provider responses · map provider errors
  - Note: pick the provider early and write down its **capability matrix** (img2img, inpainting, strength, seed, negative prompt, upscaling, progress reporting, pricing). Phases 2.2–2.4 depend on it.
- ➕ **2.1.8 Testing Setup (SKIPPED 2026-10-12, user decision; no test setup in the project for now):** test runner (Vitest or `node:test`) · Fastify `app.inject()` route tests · separate test database · first tests for health + register/login/refresh

## Phase 2.2 — Text-to-Image Generation
Deliverable: working Text-to-Image API with validated options and persisted generation metadata.

- **2.2.1 Fundamentals:** diffusion basics · text-to-image workflow · model capabilities/limitations · output formats · pricing
- **2.2.2 Database:** `generations` table · generation types · prompt & settings fields · generation status · model/provider metadata · generated image records
  - Note: "generated image records" **is the `images` table**. Create it here with the minimum columns and extend it in 2.6.2 (no second table).
  - ➕ 2.2.2.7 **Cloud storage (decided 2026-10-12: skip the local-disk driver, go straight to Cloudflare R2):** a `StorageService` interface (`save`, `read`, `delete`, `getSignedUrl`) with an **R2 driver** (S3-compatible, `@aws-sdk/client-s3`, private bucket). Download the provider image immediately (provider URLs expire) and upload it. Serve it through an authenticated route / short-lived signed URL. Absorbs the core of 2.6.1.
- **2.2.3 Prompt Processing:** validate prompt · validate model · validate supported settings · normalize options · handle unsupported params
- **2.2.4 Service:** build provider request · execute · handle URL/binary response · normalize image metadata · handle provider failures · save generation record
- **2.2.5 API:** `POST /api/images/generate` · `GET /api/images/generations/:id` · request schema · response schema · auth + ownership checks
- **2.2.6 Options:** model selection · aspect ratio · resolution · number of images · style presets · seed (if supported) · model-specific advanced settings
- ➕ **2.2.7 Minimal Credit Ledger** (basic version; 2.9.2 extends it): `credit_transactions` table (user, amount ±, type, reference id, idempotency key) · balance = sum of the ledger (or a cached column updated in the same DB transaction) · signup grant (60 credits, per onboarding design) · cost estimate per model × images · deduct in a DB transaction before calling the provider · refund on failure · reject with "insufficient credits" before calling the provider

## Phase 2.3 — Image Editing & Transformation
Deliverable: Image-to-Image and AI editing backend, limited to operations the selected provider supports.

- **2.3.1 Input Handling:** upload validation · MIME + size checks · dimension validation · temporary input handling · ownership verification
- **2.3.2 Image-to-Image:** reference image · transformation prompt · style · strength (if supported) · variations · save transformation metadata
- **2.3.3 AI Editor:** natural-language editing · mask-based inpainting · background replacement · object removal/replacement · provider capability checks · store edited output
  - ➕ 2.3.3.7 **Upscale** ("Download 2× HD" in the design), only if the provider supports it · ➕ 2.3.3.8 **Crop/resize** done locally (e.g. `sharp`), free, recorded as an edit step
- **2.3.4 Edit History:** parent image reference · edit operation records · version relationships · restore previous version · before/after metadata
- **2.3.5 APIs:** `POST /api/images/transform` · `POST /api/images/edit` · `GET /api/images/:id/versions` · `GET /api/images/:id/history`

## Phase 2.4 — AI Vision / Image Understanding
Deliverable: LangChain multimodal integration — descriptions, visual Q&A, structured analysis.

- **2.4.1 Fundamentals:** multimodal models · image input representation · image + text prompts · limitations
- **2.4.2 LangChain Vision:** configure vision chat model · build multimodal messages · pass image refs/data · invoke via LangChain · normalize response
- **2.4.3 Features:** describe · visual Q&A · OCR · identify objects · analyze design · captions
- **2.4.4 Structured Output:** Zod schemas · structured output via LangChain · parse + validate · handle missing info · **avoid invented confidence scores**
- **2.4.5 History & API:** `vision_analyses` table · `POST /api/vision/analyze` · `POST /api/vision/ask` · `GET /api/vision/history` · user-scoped access

## Phase 2.5 — Prompt Studio & LangChain Workflows
Deliverable: LangChain-powered prompt enhancement and reusable prompt library.

- **2.5.1 Prompt Engineering:** image prompt structure · subject/environment/lighting/composition · style keywords · model-specific prompting · prompt quality vs model capability
- **2.5.2 Templates:** PromptTemplate · ChatPromptTemplate · dynamic variables · system instructions · reusable template functions
- **2.5.3 Enhancement:** receive simple prompt · build instructions · run LangChain workflow · return enhanced prompt · **preserve original intent** · allow user edit
- **2.5.4 Library:** `prompts` table · save · update · delete · categories · templates · recently used
- **2.5.5 APIs:** `POST /api/prompts/enhance` · `POST /api/prompts` · `GET /api/prompts` · `PATCH /api/prompts/:id` · `DELETE /api/prompts/:id`

## Phase 2.6 — Image Storage, Gallery & Projects
Deliverable: cloud storage, searchable gallery, project organization, generation history.

- **2.6.1 Cloud Storage:** pick R2 or Supabase · private bucket · streaming uploads · store generated files · thumbnails · signed URLs · secure deletion
- **2.6.2 Image Metadata:** `images` table · owner + generation relation · storage key + content type · width/height/size · original prompt + model · favorite + timestamps
- **2.6.3 My Creations:** paginated listing · search prompt/title · filter by type · filter by model/date · favorite toggle · image detail · bulk delete/download
- **2.6.4 Projects:** `projects` table · project-image relations · create · update · delete · add/remove images · project gallery + cover image
  - ➕ 2.6.4.8 **Collections inside projects** (design: "Hero shots · 9", "+ New collection"): `project_collections` table; a project image can optionally belong to a collection
  - Note 2.6.1: the R2 driver already exists from 2.2.2.7; only thumbnails and secure deletion remain here.
- **2.6.5 Generation History:** list · filter by status · details · reuse prompt/settings · link images · pagination + sorting
- **2.6.6 Library APIs:** `GET/DELETE /api/images[/:id]` · `POST/GET /api/projects` · `GET/PATCH/DELETE /api/projects/:id` · project-image management endpoints

## Phase 2.7 — Redis, BullMQ & Background Jobs
Deliverable: reliable async generation with workers, retries, concurrency, status.

- **2.7.1 Redis Fundamentals:** what/why · install + connect · data types · SET/GET/DEL · EXPIRE/TTL · INCR/DECR · key namespaces · caching basics
- **2.7.2 BullMQ Fundamentals:** queues · producer vs worker · architecture · queue setup · add jobs · process jobs · job lifecycle · QueueEvents
- **2.7.3 Generation Queue:** create queue · create worker · validate + persist request · add job · **return job/generation ID immediately** · worker calls provider · worker stores image · worker updates DB status
  - ➕ 2.7.3.9 **Credits with jobs:** switch the 2.2.7 flow to **hold on enqueue → settle on completion → release on failure/cancel** (design shows "8 cr held" / "8 cr refunded"). Each step is idempotent (keyed by generation ID) so retries never double-charge.
- **2.7.4 Reliability:** retries · exponential backoff · timeouts + stalled jobs · idempotency · duplicate prevention · concurrency limits · provider rate limits · permanent failure handling
- **2.7.5 Progress & Cancellation:** queued · processing · completed · failed · progress where measurable · cancel waiting jobs · cooperative cancel for active jobs · **no misleading progress %**
- **2.7.6 Realtime:** SSE vs Socket.IO · pick one · authenticate subscriptions · publish status changes · frontend reconnect · reconcile status from DB
  - ➕ 2.7.6.7 **Notifications:** `notifications` table (batch complete, failed + refunded, low credits) · `GET /api/notifications` · mark one/all read · push new ones over the same realtime channel
- **2.7.7 Worker Architecture:** separate entry point · Redis connection management · graceful shutdown · error logging · deployment config

## Phase 2.8 — Frontend Integration (Next.js)
Deliverable: functional frontend matching the approved V2 design.

- **2.8.1 Foundation:** Next.js setup · Tailwind + shadcn/ui · theme + design tokens · app layout · sidebar/nav · reusable components · API client + auth
- **2.8.2 Auth & Onboarding:** register · login · password reset · protected routes · first-time onboarding modal
  - ➕ 2.8.2.6 **Settings page:** profile, generation defaults, notification toggles, security (password), appearance (uses 2.1.5.10)
  - ➕ 2.8.2.7 **Notifications panel + toasts** wired to 2.7.6.7
- **2.8.3 Dashboard:** welcome · quick prompt · quick action cards · recent creations · recent projects · usage/credit widgets
- **2.8.4 Image Generator:** prompt composer · model selector · aspect/resolution · quantity · style presets · generate · results · queue · details modal
- **2.8.5 Image Editor:** upload/empty state · canvas · toolbar · AI instruction panel · mask selection · before/after · edit history · export
- **2.8.6 Image-to-Image:** reference upload · prompt · style + strength · original/generated compare · variations gallery
- **2.8.7 AI Vision:** upload · analysis actions · visual Q&A · results · previous analyses
- **2.8.8 Prompt Studio:** editor · enhance · templates · saved prompts · copy/use in generator
- **2.8.9 Library & Projects:** My Creations · filters/search · favorites · bulk actions · projects list · project details · generation history
- **2.8.10 Responsive & UX States:** desktop · tablet · mobile nav · mobile settings bottom sheet · fullscreen preview · mobile editor · loading/error/empty · notifications + confirm dialogs

## Phase 2.9 — Usage Tracking, Credits & Billing
Deliverable: usage analytics, credit accounting, quotas, optional paid billing.

- **2.9.1 Usage Tracking:** `usage_events` table · generation type · model/provider · quantity · latency + status · actual provider cost · aggregation
- **2.9.2 Credits** (extends the 2.2.7 ledger and 2.7.3.9 holds; don't rebuild): balance model · **ledger** · estimation · **atomic reservation** · settlement after generation · refund/release on eligible failures · prevent double charging · insufficient credit handling
- **2.9.3 Plans & Limits:** `plans` table · features · monthly allowance · model access restrictions · per-user limits · top-ups
- **2.9.4 Billing (Stripe, optional):** customer mapping · subscription checkout · credit pack checkout · webhook verification · idempotent webhooks · subscription sync · billing history
- **2.9.5 Usage Dashboard:** remaining credits · monthly usage · usage by feature · daily chart · transactions · billing/upgrade screens

## Phase 2.10 — Testing, Security & Deployment
Deliverable: tested, secure, deployable app with API + worker monitoring.

Note: most unit/integration tests should already exist from each phase's checkpoint. 2.10 means filling gaps, plus ➕ a few **end-to-end tests** (e.g. Playwright: register → generate → see in My Creations).

- **2.10.1 Unit:** validation · settings normalization · provider adapter · prompt enhancement · credit calculation · retry policy
- **2.10.2 API Integration:** auth · generation · editing · vision · prompt studio · gallery/projects · ownership/authorization
- **2.10.3 Queue & Worker:** enqueue · processing · retry/backoff · duplicate jobs · restart recovery · cancellation · concurrency
- **2.10.4 Security:** upload security · private storage authz · input validation · API rate limiting · ownership enforcement · provider key protection · credit abuse prevention · AI content safety errors
  - ➕ 2.10.4.9 **2FA (TOTP)** + **active sessions list/revoke** (Settings → Security). Optional; the sessions table from 2.1.4.5 already supports revoke.
- **2.10.5 Performance:** upload memory · streaming files · DB query optimization · worker concurrency tuning · Redis monitoring · timeout/failure recovery · logging/monitoring
- **2.10.6 Deployment:** prod env config · Postgres prod · Redis prod · backend · worker · frontend · storage · migrations · prod smoke tests
  - ➕ 2.10.6.10 **CI** (GitHub Actions): lint + tests on every push

## Phase 2.A — Admin Console (added 2026-10-12, built before Phase 2.3)
Deliverable: a `super_admin` role and an admin console to manage what the user side depends on.

- **2.A.1 Foundation:** `users.role` (user / super_admin) · `users.suspended_at` (login + existing sessions blocked) · `requireSuperAdminHook` · `npm run admin:promote -- <email>`
- **2.A.2 Models & pricing:** `image_models` table (enable/disable, label, sort order, credits per quality, allowed sizes/qualities/backgrounds/moderations, max images, defaults); features stay adapter-owned; the last enabled model cannot be disabled
- **2.A.3 Users:** list/search/filter · detail · suspend/unsuspend · role change (not on yourself)
- **2.A.4 Credits:** adjust a balance (±, reason, never below zero) · per-user transactions · signup credits stored in `system_settings`
- **2.A.5 Generations:** list with status/model/user filters · detail with credit hold/refund
- **2.A.6 Audit log:** every admin change (who, what, from → to), read-only
- **2.A.7 Later, with their phases:** plans/limits (2.9.3), billing (2.9.4), queue/worker monitoring (2.7), usage analytics, prompt templates

## Completion criteria
Core generation, editing, vision, prompt studio, gallery/projects, async queue and V2 UI main flows work; authenticated ownership checks and automated tests pass; production secrets secure; deployment smoke tests pass. Stripe subscriptions optional.

---

## Review notes (2026-10-11)
Why the ➕ items were added:
1. **Storage came too late:** images are generated in 2.2, but storage only arrived in 2.6, and provider URLs expire → ➕ 2.2.2.7 storage driver (originally local-disk, changed to Cloudflare R2 on 2026-10-12).
2. **Credits came too late:** the queue and UI need held/refunded credits before 2.9 → ➕ 2.2.7 minimal ledger, ➕ 2.7.3.9 holds with jobs; 2.9.2 extends them.
3. **Testing only at the end:** → ➕ 2.1.8 test setup + a test checkpoint at the end of every phase.
4. **Design features missing from the plan:** settings/preferences, notifications, project collections, upscale (2× HD), 2FA/sessions, onboarding flag + signup credits → added in their phases.
5. **Missing infrastructure:** email service, local Postgres/Redis setup (no Docker — user does not use it), repo structure, CI → added.
6. **The PDF's "Karna kya hai" text is auto-generated boilerplate** and sometimes doesn't match the heading (e.g. 2.8.10.2 Tablet layout → "Drizzle schema", 2.7.6.3 Authenticate subscriptions → "ledger/payment", 2.4.2.2 Build multimodal messages → "Next.js component"). **Trust the headings, not those descriptions.** Use the "Recurring patterns" section above instead.
