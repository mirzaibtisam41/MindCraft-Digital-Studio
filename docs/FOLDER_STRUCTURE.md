# Folder Structure & Naming Conventions

**Rule: follow the structure of the sibling project `D:\My Projects\business book`.** When unsure how something is organized, open the matching folder there and copy the pattern (structure only; the stack differences are listed at the bottom).
**But fix its mistakes here:** where business book does something badly (needless nesting, duplication, etc.), improve it in this project and record the change in the "Differences" table at the bottom.

**Flat infrastructure folders:** `bootstrap/`, `config/`, `constants/`, `plugins/`, `hooks/`, `handlers/`, `integrations/`, `utils/` keep their files directly inside (the kebab-case name + role suffix already says the area, e.g. `config/pino.config.js`, `plugins/cors.plugin.js`). Create an `<area>/` sub-folder only once one area has **3+ files**. `modules/<module>/features/<feature>/` stays nested.

## Repo root
```
Mindcraft Digital Studio/
├── backend/          Fastify API (+ BullMQ worker entry from Phase 2.7)
├── client/           Next.js frontend (named "client", not "frontend")
├── docs/             ROADMAP.md, DESIGN.md, this file
├── .github/workflows/ci.yml
└── CLAUDE.md
```

## backend/
```
backend/
├── index.js                 entry: only calls startServer() from src/bootstrap
├── drizzle.config.js
├── eslint.config.js
├── package.json             "type": "module", "imports": { "#src/*": "./src/*" }
├── database/migrations/     drizzle-kit output
├── bruno/<module>/          API request collections (Bruno) per module + environments/
├── test/<module>/*.test.js  node:test; test/helpers/ (test-app.js, test-env.js)
└── src/
    ├── bootstrap/           how the app starts, in order: load-env.bootstrap.js (loads .env, runs first),
    │                        build-app.bootstrap.js (buildApp(): Fastify + plugins in order + routes, used by tests),
    │                        start-server.bootstrap.js (startServer(): ready, listen, shutdown signals),
    │                        shutdown-server.bootstrap.js (shutdownServer(): close on SIGINT/SIGTERM),
    │                        start-jobs.bootstrap.js (startJobs(): repeating background jobs, real server only), index.js
    ├── config/              only settings that are big or used in several places: env.config.js (env schema +
    │                        buildAppConfig), pino.config.js, refresh-cookie.config.js; index.js re-exports
    ├── constants/           *.constants.js; index.js re-exports
    ├── database/schema.js   re-exports every modules/<m>/<m>.table.js (for Drizzle)
    ├── handlers/            request handlers Fastify calls: error, not-found (*.handler.js → errorHandler, notFoundHandler)
    ├── hooks/               *.hook.js (auth check, ownership/access checks, rate limits)
    ├── integrations/        third-party services the app talks to (no routes, no tables): <service>.integration.js,
    │                        e.g. brevo/ (send-brevo-email), r2/ (build-r2-client, upload-r2-file, delete-r2-file,
    │                        create-r2-signed-url, download-r2-file), openai/ (build-openai-client,
    │                        request-openai-images, generate-openai-images, edit-openai-images, map-openai-error),
    │                        langchain/ (vision-tasks, build-chat-model, analyze-image, enhance-prompt, map-langchain-error); one file per action; provider errors become a ProviderError
    │                        with a PROVIDER_ERROR_CATEGORY, the raw provider message never reaches the client,
    │                        upstash-redis.integration.js; a <service>/ folder only at 3+ files; index.js re-exports
    ├── plugins/             *.plugin.js wrapped with fastify-plugin (reply-success.plugin.js adds reply.success); index.js re-exports
    ├── shared/schemas/      request schemas used by several modules, e.g. uuid-params.schema.js →
    │                        uuidParamsSchema('id') / uuidParamsSchema('modelId', 'typeId') for every :id route,
    │                        pagination-query.schema.js → paginationQuerySchema (page, limit) for list endpoints
    ├── utils/               *.util.js (errors, reply, password, pagination...); index.js re-exports
    │                        (all of the above: add an <area>/ sub-folder only at 3+ files for one area)
    └── modules/
        ├── index.js         registerRoutes(fastify): registers each <m>Routes with a prefix
        └── <module>/
            ├── <module>.routes.js       export function <module>Routes(fastify) { fastify.post(...) }
            ├── <entity>.table.js        Drizzle pgTable
            ├── <entity>.constants.js    lengths, statuses, enums
            ├── <entity>-columns.constants.js   selected columns for queries
            ├── features/<feature-name>/ one folder per endpoint/use-case (kebab-case folder)
            │   ├── <feature>.controller.js   reads request, calls service, returns reply.success({ data, message })
            │   ├── <feature>.schema.js       request validation schema
            │   └── <feature>.service.js      business logic
            ├── shared/
            │   ├── repositories/   one DB query per file: find-x-by-id.repository.js … + index.js
            │   ├── services/       services reused by several features + index.js
            │   └── utils/
```

### API route map (which module owns which URL)
Prefixes are set in `src/modules/index.js`. Three modules share `/api/admin/models` and two share `/api/admin/users`, so look at the path after the id.

| Method + path | Module | Feature folder | Who |
|---|---|---|---|
| `GET /health` | `health` | — | anyone |
| `POST /api/auth/register` · `login` · `refresh` · `logout` | `auth` | `register` · `login` · `refresh-session` · `logout` | anyone |
| `GET /api/auth/me` | `auth` | `get-me` | logged in |
| `GET /api/auth/sessions` · `DELETE /api/auth/sessions/:familyId` · `POST /api/auth/logout-others` | `auth` | `list-sessions` · `revoke-session` · `logout-other-sessions` | logged in |
| `GET /api/wallet` | `credit-wallets` (`myWalletRoutes`) | `get-my-wallet` | logged in |
| `POST · GET /api/images` · `GET · PATCH · DELETE /api/images/:id` · `GET /api/images/:id/download` · `GET /api/images/:id/history` · `POST /api/images/bulk-favorite` · `POST /api/images/bulk-delete` | `images` | `upload-image` · `list-my-images` · `get-my-image` · `update-my-image` · `delete-my-image` · `get-my-image-download` · `get-image-history` · `bulk-favorite-my-images` · `bulk-delete-my-images` | logged in, own images only |
| `GET /api/generations/options?type=` · `POST · GET /api/generations` (type text_to_image, image_to_image or image_edit) · `GET /api/generations/:id` | `generations` | `get-generation-options` · `create-generation` · `list-my-generations` · `get-my-generation` | logged in, own generations only |
| `POST /api/prompts/enhance` (20/min) · `GET /api/prompts/options` · `POST · GET /api/prompts` · `PATCH · DELETE /api/prompts/:id` · `POST /api/prompts/:id/use` | `prompts` | `enhance-prompt` · `get-prompt-options` · `create-prompt` · `list-my-prompts` · `update-my-prompt` · `delete-my-prompt` · `use-my-prompt` | logged in, own prompts only |
| `GET /api/usage?month=&timezone=` | `usage` | `get-my-usage` | logged in, own usage only |
| `PATCH /api/me/profile` · `POST /api/me/password` · `POST /api/me/email` | `users` (`myAccountRoutes`) | `update-my-profile` · `change-my-password` · `change-my-email` | logged in |
| `POST /api/auth/forgot-password` · `reset-password` · `verify-email` · `resend-verification` | `auth` (tokens in `auth-tokens`) | `forgot-password` · `reset-password` · `verify-email` · `resend-verification` | anyone (resend: logged in) |
| `GET · PATCH /api/me/settings` | `user-settings` | `get-my-settings` · `update-my-settings` | logged in |
| `GET /api/notifications` · `POST /api/notifications/:id/read` · `POST /api/notifications/read-all` | `notifications` | `list-my-notifications` · `mark-notification-read` · `mark-all-notifications-read` | logged in, own notifications only |
| `GET /api/vision/options` · `POST · GET /api/vision/analyses` | `image-analyses` (`visionRoutes`) | `get-vision-options` · `create-image-analysis` · `list-image-analyses` | logged in, own images only |
| `POST · GET /api/projects` · `GET · PATCH · DELETE /api/projects/:projectId` · `GET · POST /api/projects/:projectId/images` · `POST /api/projects/:projectId/images/remove` · `PATCH /api/projects/:projectId/images/collection` · `POST /api/projects/:projectId/collections` · `PATCH · DELETE /api/projects/:projectId/collections/:collectionId` | `projects` | `create-project` · `list-my-projects` · `get-my-project` · `update-my-project` · `delete-my-project` · `list-project-images` · `add-project-images` · `remove-project-images` · `move-project-images` · `create-project-collection` · `rename-project-collection` · `delete-project-collection` | logged in, own projects only |
| `POST · GET /api/admin/providers` · `GET · PATCH · DELETE /api/admin/providers/:id` · `PATCH /api/admin/providers/:id/status` | `ai-providers` | `create-ai-provider` · `list-ai-providers` · `get-ai-provider` · `update-ai-provider` · `delete-ai-provider` · `update-ai-provider-status` | admin |
| `POST · GET /api/admin/models` · `GET · PATCH /api/admin/models/:id` · `PATCH /api/admin/models/:id/status` | `ai-models` | `create-ai-model` · `list-ai-models` · `get-ai-model` · `update-ai-model` · `update-ai-model-status` | admin |
| `GET /api/admin/models/:modelId/workflows` · `PUT /api/admin/models/:modelId/workflows/:typeId` | `model-workflows` | `list-model-workflows` · `save-model-workflow` | admin |
| `GET /api/admin/models/:modelId/prices` · `PUT /api/admin/models/:modelId/workflows/:typeId/prices` | `ai-model-credit-prices` | `list-model-credit-prices` · `save-workflow-credit-prices` | admin |
| `POST · GET /api/admin/generation-types` · `PATCH · DELETE /api/admin/generation-types/:id` · `PATCH /api/admin/generation-types/:id/status` | `generation-types` | `create-generation-type` · `list-generation-types` · `update-generation-type` · `delete-generation-type` · `update-generation-type-status` | admin |
| `GET · PATCH /api/admin/settings` | `platform-settings` | `get-platform-settings` · `update-platform-settings` | admin |
| `GET /api/admin/users` · `GET /api/admin/users/:userId` · `PATCH /api/admin/users/:userId/status` · `PATCH /api/admin/users/:userId/role` | `users` (`adminUsersRoutes`) | `list-users` · `get-user` · `update-user-status` · `update-user-role` | admin |
| `GET /api/admin/users/:userId/wallet` · `POST /api/admin/users/:userId/credit-adjustments` | `credit-wallets` (`adminUserWalletRoutes`) | `get-user-wallet` · `adjust-user-credits` | admin |

Keep this table updated when a route is added or moved.

### Storage bucket layout
Every file lives under its owner, then a folder for what made it: `users/<userId>/uploads/<imageId>.<ext>`, `users/<userId>/generations/<imageId>.<ext>`, `users/<userId>/edits/<imageId>.<ext>`; every image also has a 400px WebP thumbnail at `users/<userId>/thumbnails/<imageId>.webp`. Folder names are kebab-case plurals, the file name is the `images.id` row, so the database and the bucket always match. Keys are built only by `buildImageStorageKeyUtil` (`modules/images/shared/utils/`); never build a key by hand. The bucket is private; files are read through signed URLs that last 1 hour.

### Naming conventions
- Files: **kebab-case** with a role suffix: `login.controller.js`, `find-business-by-id.repository.js`, `cors.plugin.js`, `password.util.js`, `check-user-is-logged-in.hook.js`, `user.table.js`.
- Folders: **kebab-case** for every multiword name. Feature folders: `forgot-password`, `refresh-session`. Module folders: kebab-case plural (`user-settings`, `password-reset-tokens`). A module with a single small endpoint stays flat (`health/health.controller.js` + `health.routes.js`) instead of `features/<name>/`.
- Function name = file name in camelCase + role suffix: `login.controller.js` → `loginController`, `find-business-by-id.repository.js` → `findBusinessByIdRepository`, `pino.config.js` → `pinoConfig` (a builder function gets a `build` prefix: `listen.config.js` → `buildListenConfig`), `cors.plugin.js` → `corsPlugin`, `not-found.handler.js` → `notFoundHandler`.
- Functions take **one object argument** (`{ db, id }`, `{ server, email }`).
- Every folder of shared pieces has an **`index.js` barrel** that re-exports; imports use `#src/...` aliases, e.g. `import { hashPasswordUtil } from '#src/utils/index.js'`.
- **Every import uses `#src/...`, never `./` or `../`** — even a file in the same folder (controller → its service, route → its features, barrel `index.js` re-exports, table → its constants). Root files (`index.js`, `drizzle.config.js`, `scripts/`) too. Only `tests/` keeps relative imports for its own helpers (they live outside `src/`).
- Layering: routes → controller → service → repository. Repositories only talk to the DB; controllers never query the DB.

### Planned modules for this project (mapped to the roadmap)
`health`, `auth`, `users` (profile updates; the logged-in user itself is `GET /api/auth/me`), `user-settings` (`/api/me/settings`), `auth-sessions` (refresh tokens), `auth-tokens` (email verify + password reset), `generations`, `images`, `edits` (image-to-image, editing, history), `vision`, `prompts`, `projects` (+ collections), `credits`, `notifications`, `usage`, `billing`. Not modules: sending mail, calling AI providers (image SDK + LangChain), file storage and Redis are **`src/integrations/`**; a module is something with its own routes and/or tables. Prompt templates live in the module that uses them (e.g. `modules/prompts/`). Worker (2.7): a separate entry such as `backend/worker.js` that reuses the same `src/`.

## client/
```
client/
├── jsconfig.json             "paths": { "@/*": ["./src/*"] }
├── components.json           shadcn/ui config (JS, new-york style, aliases @/components, @/lib/utils)
├── .env.example              NEXT_PUBLIC_API_URL=http://localhost:8000
└── src/
    ├── app/                  Next.js App Router: login/, register/, forgot-password/, reset-password/,
    │                         app/ (authenticated area: layout.js = AuthGuard + AppShell, page.js = dashboard,
    │                         settings/<section>/page.js, [...missing] → not-found)
    ├── components/
    │   ├── layout/           AppShell, AuthLayout, guards, skeletons, navbar/, sidebar/
    │   └── ui/               shadcn components (button.jsx, switch.jsx…) + our own (Field.js, PasswordInput.js…)
    ├── features/<feature>/   feature code: <feature>Api.js (RTK Query endpoints), slices, forms, sections
    ├── constants/            navigation.js, settings.js, formLimits.js
    ├── hooks/                useSignOut, useSettingsDraft, useFormState, useResolvedTheme
    ├── lib/                  apiUrl, apiError, refreshLock, safeNextPath, validators, theme, utils (cn)
    └── store/                store.js, baseApi.js (fetch + 401 → single refresh → retry), StoreProvider.js
```
- Components: **PascalCase** files (`LoginForm.js`), except shadcn-generated files in `components/ui/`, which keep the CLI's kebab-case `.jsx` names so `npx shadcn add` can update them.
- Pages are thin server components (metadata only); UI lives in `features/` and `components/`.
- Auth: access token only in Redux memory; on load `SessionBoot` calls `/api/auth/refresh` (httpOnly cookie) to restore it. Refresh calls are single-flight and wrapped in a Web Lock so tabs do not rotate the same token at once.
- Theme: tokens from DESIGN.md live in `globals.css` (`:root` = dark, `[data-theme='light']` overrides). An inline script in `layout.js` applies the saved theme before paint. `ThemeSync` keeps it in step with the user's settings.

## Differences from business book (this project's stack wins)
| Topic | business book | Mindcraft Digital Studio |
|---|---|---|
| Styling | CSS Modules (`*.module.css`) | **Tailwind + shadcn/ui** (shadcn components go in `components/ui/`) |
| Dev restart | nodemon | either works; `node --watch` needs no extra package |
| Infrastructure folders | one sub-folder per area, often with a single file (`config/logger/pino.config.js`) | **flat** (`config/pino.config.js`); `<area>/` sub-folder only at 3+ files |
| `.gitignore` | one per folder (`backend/`, `client/`) | **one at repo root** |
| Plugin naming | `validate-env.plugin.js` / `validateEnvPlugin` (named after an action) | plugins are named after what they register, like `cors.plugin.js` / `corsPlugin` |
| Env / config | `validate-env.plugin.js` reads `process.env` itself; other files (pino, fastify config) also read `process.env` | env is validated **once** in `buildApp()` with `env-schema` (`config/app.config.js` → `buildAppConfig()`); the same `appConfig` builds the logger and is decorated as `fastify.config` by `plugins/config.plugin.js`. **Only `fastify.config` / `appConfig` is used; nothing reads `process.env` directly** (except bootstrap loading `.env`) |
| Reply decorator | `decorators/reply/send-success.decorator.js` (`sendSuccessDecorator`) + `plugins/reply/success-reply.plugin.js` | **one file** `plugins/reply-success.plugin.js` (`replySuccessPlugin`) holds the `reply.success` function and registers it; no `decorators/` folder and no separate success-response util (2026-10-15) |
| HTTP errors | `utils/errors/http-errors.util.js`, codes hard-coded as `'FST_NOT_FOUND'` (Fastify's own prefix) | **flat** `utils/http-errors.util.js`; codes come from `constants/error-code.constants.js` (`ERROR_CODE.NOT_FOUND`), one list the client can rely on and provider error categories get added to |
| Error handler | `handlers/error/handle-error.handler.js`; body key `error: 'FST_...'`; 500 messages hidden except an `instanceof` allow-list | **flat** `handlers/error.handler.js`; body key `code` (from `ERROR_CODE`), validation errors add `details`; a private `resolveError()` decides the response; messages are shown only for our own `ERROR_CODE` errors (that list is the allow-list), every other 5xx is hidden |
| Handler naming | `handle-error.handler.js` / `handleErrorHandler` (verb + role repeats itself) | **`error.handler.js` / `errorHandler`**, `not-found.handler.js` / `notFoundHandler`: named after what they handle, same rule as plugins |
| Database plugin | `plugins/database/database.plugin.js`; no connection check, so a wrong `DATABASE_URL` only fails on the first query | **flat** `plugins/database.plugin.js`; runs `SELECT 1` at startup so a bad URL/password stops the server before it listens; pool size (10) and connect timeout (5 s) are written in the plugin |
| Env variables | many tuning numbers in `.env` | **only values that differ per environment or are secret** (2026-10-15): `NODE_ENV`, `LOG_LEVEL`, `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `COOKIE_SAME_SITE`, `STORAGE_R2_*` (account id, access key id, secret, bucket). Fixed app rules (host, rate limit, pool size, timeouts, token lifetimes) are written in code; a value used in several files becomes a module constant (`REFRESH_TOKEN_TTL_DAYS` in `auth.constants.js`) |
| Sessions table | no refresh-token column (the refresh JWT only carries the session id), `started_at` + `created_at` duplicate each other, lengths in a `SESSION_LENGTHS` object | stores **`refresh_token_hash`** (SHA-256 of an opaque random token, unique) so rotation can detect a reused old token and revoke the session; `last_used_at` for the active-sessions list; flat `SESSION_*_LENGTH` constants like `USER_*` |
| Refresh token | a signed JWT with `purpose: 'refresh'`, same secret as the access token; reuse detection relies on timing | **opaque random token** (`generateTokenUtil`), only its SHA-256 stored; rotation revokes the old row and inserts a new one in one transaction (`revoked_at IS NULL` guard stops concurrent double-rotation); a revoked token used again after a 10 s grace revokes all the user's sessions |
| Refresh cookie helpers | `modules/auth/shared/cookies/refresh-cookie.js` (no role suffix, three exports in one file) | cookie options are a config builder `config/refresh-cookie.config.js` (`buildRefreshCookieConfig`, `REFRESH_COOKIE_NAME`); helpers are one function per file in `modules/auth/shared/utils/` (`set-`, `clear-`, `read-refresh-cookie.util.js`); the refresh endpoint clears the cookie only on `UNAUTHORIZED`, not on a 5xx |
| Logout | needs a valid access token (`checkUserIsLoggedInHook`) | uses the **refresh cookie** and is idempotent, so a user with an expired access token can still log out |
| Password reset token | a JWT signed with the app secret; "single use" inferred from `users.updated_at` | own module `password-reset-tokens` with a `password_reset_tokens` table: hashed token, 30 min expiry, consumed by one atomic `UPDATE … WHERE used_at IS NULL AND expires_at > now() RETURNING`; a new request invalidates older tokens |
| Mail | `modules/mail/` with one `send-email.service.js` hard-wired to Brevo | not a module: **`integrations/resend-mail.integration.js`** (`sendEmailIntegration`); in development it only logs the email |
| Password hashing | bcrypt (72-byte limit, `maxBytes` custom keyword) | **argon2id** (`argon2` package), max length 128, no custom Ajv keyword needed |
| Profile / settings routes | `GET /auth/me` inside the auth module | `/api/me` lives in `users` (`users.routes.js`), `/api/me/settings` in `user-settings` (`user-settings.routes.js`); each routes plugin adds `checkUserIsLoggedInHook` with `addHook('onRequest')` once instead of per route |
| Folder naming | camelCase feature folders (`forgotPassword`) and camelCase module folders (`businessUsers`), while files are kebab-case: two styles in one path | **kebab-case everywhere** (`modules/user-settings/features/update-my-settings/update-my-settings.service.js`): folders and files use one style, and paths stay safe on case-sensitive Linux file systems. Exported function names stay camelCase |
| Single-endpoint module | `health/features/checkHealth/check-health.controller.js` (two folders for one file) | **flat** `health/health.controller.js` + `health.routes.js`; `features/` appears only when a module has several use-cases |
| Toasts | own `context/ToastContext.js` + `ToastRegion` | **sonner** via shadcn's `components/ui/sonner.jsx` (bottom-right, 3 visible, 6 s, pauses on hover as DESIGN.md asks); no `context/` folder needed yet |
| Sign-out redirect | `AuthGuard` always adds `?next=` when the session ends, so a deliberate sign-out from a deep page sends the next login back there | `sessionEnded({ reason })`: a deliberate sign-out goes to plain `/login`; only an expired session keeps `?next=` |
| AI | Gemini SDK inside `modules/ai/providers/gemini/full-response/…` | LangChain.js + image provider SDK in **`integrations/`** (one flat file per provider); the `ai-providers` / `ai-models` modules are only the admin config tables |
| Third-party code | mixed into `modules/` (`ai`, `mail`) next to real feature modules | **`src/integrations/`** (2026-10-15): `modules/` holds only modules with routes and/or tables; SDK clients and calls to outside services live in integrations and are used by services |
| Startup | `index.js` loads env, root `app.js` builds the app, `index.js` listens | **everything about starting the app lives in `src/bootstrap/`**: `load-env`, `build-app` (`buildApp`), `start-server` (`startServer`), `shutdown-server` (`shutdownServer`, moved out of `handlers/` because it is not a request handler); root `index.js` only calls `startServer()`. Plugin **settings** stay in `config/`, plugin **registration** in `plugins/`; plugin order lives in `registerPlugins` (`plugins/index.js`) like routes in `registerRoutes` (`modules/index.js`), so `buildApp` only creates Fastify and calls both (2026-10-15) |
| Config files | one builder per plugin (`buildCorsConfig`, `buildJwtConfig`…) | **no tiny builders** (2026-10-15): a setting of a few lines that is used in one place is written inline where it is used (cors, jwt, rate limit and database options inside their plugin, listen options in `start-server`, Fastify options in `build-app`). `config/` keeps only big or shared settings |
| Extra | — | Redis/BullMQ worker, storage service, credits |
