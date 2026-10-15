# Folder Structure & Naming Conventions

**Rule: follow the structure of the sibling project `D:\My Projects\business book`.** When unsure how something is organized, open the matching folder there and copy the pattern (structure only; the stack differences are listed at the bottom).
**But fix its mistakes here:** where business book does something badly (needless nesting, duplication, etc.), improve it in this project and record the change in the "Differences" table at the bottom.

**Flat infrastructure folders:** `bootstrap/`, `config/`, `constants/`, `plugins/`, `hooks/`, `handlers/`, `utils/` keep their files directly inside (the kebab-case name + role suffix already says the area, e.g. `config/pino.config.js`, `plugins/cors.plugin.js`). Create an `<area>/` sub-folder only once one area has **3+ files**. `modules/<module>/features/<feature>/` stays nested.

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
    │                        start-server.bootstrap.js (startServer(): ready, listen, shutdown signals), index.js
    ├── config/              only settings that are big or used in several places: env.config.js (env schema +
    │                        buildAppConfig), pino.config.js, refresh-cookie.config.js; index.js re-exports
    ├── constants/           *.constants.js; index.js re-exports
    ├── database/schema.js   re-exports every modules/<m>/<m>.table.js (for Drizzle)
    ├── handlers/            error, not-found, graceful-shutdown (*.handler.js → errorHandler, notFoundHandler...)
    ├── hooks/               *.hook.js (auth check, ownership/access checks, rate limits)
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
            ├── prompts/        (AI modules) prompt templates
            └── providers/      (AI modules) provider adapters, e.g. providers/<name>/shared/*.util.js
```

### Naming conventions
- Files: **kebab-case** with a role suffix: `login.controller.js`, `find-business-by-id.repository.js`, `cors.plugin.js`, `password.util.js`, `check-user-is-logged-in.hook.js`, `user.table.js`.
- Folders: **kebab-case** for every multiword name. Feature folders: `forgot-password`, `refresh-session`. Module folders: kebab-case plural (`user-settings`, `password-reset-tokens`). A module with a single small endpoint stays flat (`health/health.controller.js` + `health.routes.js`) instead of `features/<name>/`.
- Function name = file name in camelCase + role suffix: `login.controller.js` → `loginController`, `find-business-by-id.repository.js` → `findBusinessByIdRepository`, `pino.config.js` → `pinoConfig` (a builder function gets a `build` prefix: `listen.config.js` → `buildListenConfig`), `cors.plugin.js` → `corsPlugin`, `not-found.handler.js` → `notFoundHandler`.
- Functions take **one object argument** (`{ db, id }`, `{ server, email }`).
- Every folder of shared pieces has an **`index.js` barrel** that re-exports; imports use `#src/...` aliases, e.g. `import { hashPasswordUtil } from '#src/utils/index.js'`.
- Layering: routes → controller → service → repository. Repositories only talk to the DB; controllers never query the DB.

### Planned modules for this project (mapped to the roadmap)
`health`, `auth`, `users` (profile updates; the logged-in user itself is `GET /api/auth/me`), `user-settings` (`/api/me/settings`), `auth-sessions` (refresh tokens), `auth-tokens` (email verify + password reset), `mail`, `ai` (provider adapters: image provider + LangChain model), `generations`, `images`, `edits` (image-to-image, editing, history), `vision`, `prompts`, `projects` (+ collections), `credits`, `notifications`, `usage`, `billing`. Worker (2.7): a separate entry such as `backend/worker.js` that reuses the same `src/`.

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
| Database plugin | `plugins/database/database.plugin.js`; no connection check, so a wrong `DATABASE_URL` only fails on the first query | **flat** `plugins/database.plugin.js`; runs `SELECT 1` at startup so a bad URL/password stops the server before it listens; pool size and connect timeout come from env (`DATABASE_POOL_MAX`, `DATABASE_CONNECTION_TIMEOUT_MS`) |
| Sessions table | no refresh-token column (the refresh JWT only carries the session id), `started_at` + `created_at` duplicate each other, lengths in a `SESSION_LENGTHS` object | stores **`refresh_token_hash`** (SHA-256 of an opaque random token, unique) so rotation can detect a reused old token and revoke the session; `last_used_at` for the active-sessions list; flat `SESSION_*_LENGTH` constants like `USER_*` |
| Refresh token | a signed JWT with `purpose: 'refresh'`, same secret as the access token; reuse detection relies on timing | **opaque random token** (`generateTokenUtil`), only its SHA-256 stored; rotation revokes the old row and inserts a new one in one transaction (`revoked_at IS NULL` guard stops concurrent double-rotation); a revoked token used again after a 10 s grace revokes all the user's sessions |
| Refresh cookie helpers | `modules/auth/shared/cookies/refresh-cookie.js` (no role suffix, three exports in one file) | cookie options are a config builder `config/refresh-cookie.config.js` (`buildRefreshCookieConfig`, `REFRESH_COOKIE_NAME`); helpers are one function per file in `modules/auth/shared/utils/` (`set-`, `clear-`, `read-refresh-cookie.util.js`); the refresh endpoint clears the cookie only on `UNAUTHORIZED`, not on a 5xx |
| Logout | needs a valid access token (`checkUserIsLoggedInHook`) | uses the **refresh cookie** and is idempotent, so a user with an expired access token can still log out |
| Password reset token | a JWT signed with the app secret; "single use" inferred from `users.updated_at` | own module `password-reset-tokens` with a `password_reset_tokens` table: hashed token, 30 min expiry, consumed by one atomic `UPDATE … WHERE used_at IS NULL AND expires_at > now() RETURNING`; a new request invalidates older tokens |
| Mail | one `send-email.service.js` hard-wired to Brevo | provider interface: `modules/mail/providers/<name>-mail.provider.js` (`console` for dev logs the email, `resend` for prod), `sendEmailService` picks one from `MAIL_PROVIDER`; env schema forbids `console` in production |
| Password hashing | bcrypt (72-byte limit, `maxBytes` custom keyword) | **argon2id** (`argon2` package), max length 128, no custom Ajv keyword needed |
| Profile / settings routes | `GET /auth/me` inside the auth module | `/api/me` lives in `users` (`users.routes.js`), `/api/me/settings` in `user-settings` (`user-settings.routes.js`); each routes plugin adds `checkUserIsLoggedInHook` with `addHook('onRequest')` once instead of per route |
| Folder naming | camelCase feature folders (`forgotPassword`) and camelCase module folders (`businessUsers`), while files are kebab-case: two styles in one path | **kebab-case everywhere** (`modules/user-settings/features/update-my-settings/update-my-settings.service.js`): folders and files use one style, and paths stay safe on case-sensitive Linux file systems. Exported function names stay camelCase |
| Single-endpoint module | `health/features/checkHealth/check-health.controller.js` (two folders for one file) | **flat** `health/health.controller.js` + `health.routes.js`; `features/` appears only when a module has several use-cases |
| Toasts | own `context/ToastContext.js` + `ToastRegion` | **sonner** via shadcn's `components/ui/sonner.jsx` (bottom-right, 3 visible, 6 s, pauses on hover as DESIGN.md asks); no `context/` folder needed yet |
| Sign-out redirect | `AuthGuard` always adds `?next=` when the session ends, so a deliberate sign-out from a deep page sends the next login back there | `sessionEnded({ reason })`: a deliberate sign-out goes to plain `/login`; only an expired session keeps `?next=` |
| AI | Gemini SDK directly | LangChain.js + image provider adapter (still under `modules/ai/providers/`) |
| Startup | `index.js` loads env, root `app.js` builds the app, `index.js` listens | **everything about starting the app lives in `src/bootstrap/`**: `load-env`, `build-app` (`buildApp`), `start-server` (`startServer`); root `index.js` only calls `startServer()`. Plugin **settings** stay in `config/`, plugin **registration** in `plugins/`; bootstrap only decides the order (2026-10-15) |
| Config files | one builder per plugin (`buildCorsConfig`, `buildJwtConfig`…) | **no tiny builders** (2026-10-15): a setting of a few lines that is used in one place is written inline where it is used (cors, jwt, rate limit and database options inside their plugin, listen options in `start-server`, Fastify options in `build-app`). `config/` keeps only big or shared settings |
| Extra | — | Redis/BullMQ worker, storage service, credits |
