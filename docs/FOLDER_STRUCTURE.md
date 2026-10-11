# Folder Structure & Naming Conventions

**Rule: follow the structure of the sibling project `D:\My Projects\business book`.** When unsure how something is organized, open the matching folder there and copy the pattern (structure only; the stack differences are listed at the bottom).
**But fix its mistakes here:** where business book does something badly (needless nesting, duplication, etc.), improve it in this project and record the change in the "Differences" table at the bottom.

**Flat infrastructure folders:** `bootstrap/`, `config/`, `constants/`, `plugins/`, `hooks/`, `handlers/`, `utils/`, `decorators/` keep their files directly inside (the kebab-case name + role suffix already says the area, e.g. `config/pino.config.js`, `plugins/cors.plugin.js`). Create an `<area>/` sub-folder only once one area has **3+ files**. `modules/<module>/features/<feature>/` stays nested.

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
├── index.js                 entry: imports bootstrap, buildApp(), listen, shutdown signals
├── app.js                   export function buildApp(): creates Fastify, registers plugins, then registerRoutes
├── drizzle.config.js
├── eslint.config.js
├── package.json             "type": "module", "imports": { "#src/*": "./src/*" }
├── database/migrations/     drizzle-kit output
├── bruno/<module>/          API request collections (Bruno) per module + environments/
├── test/<module>/*.test.js  node:test; test/helpers/ (test-app.js, test-env.js)
└── src/
    ├── bootstrap/           index.js + load-dotenv.bootstrap.js (runs first)
    ├── config/              *.config.js builders like buildCorsConfig({ appConfig }); index.js re-exports
    │                        (env-schema, pino, fastify, listen, cors, jwt, database, rate-limit…)
    ├── constants/           *.constants.js; index.js re-exports
    ├── database/schema.js   re-exports every modules/<m>/<m>.table.js (for Drizzle)
    ├── decorators/          reply.success(...) decorator
    ├── handlers/            error, not-found, graceful-shutdown (*.handler.js → errorHandler, notFoundHandler...)
    ├── hooks/               *.hook.js (auth check, ownership/access checks, rate limits)
    ├── plugins/             *.plugin.js wrapped with fastify-plugin; index.js re-exports
    ├── shared/schemas/      fields/, params/, query/ reusable request schemas
    ├── utils/               *.util.js (errors, reply, password, pagination...); index.js re-exports
    │                        (all of the above: add an <area>/ sub-folder only at 3+ files for one area)
    └── modules/
        ├── index.js         registerRoutes(fastify): registers each <m>Routes with a prefix
        └── <module>/
            ├── <module>.routes.js       export function <module>Routes(fastify) { fastify.post(...) }
            ├── <entity>.table.js        Drizzle pgTable
            ├── <entity>.constants.js    lengths, statuses, enums
            ├── <entity>-columns.constants.js   selected columns for queries
            ├── features/<featureName>/  one folder per endpoint/use-case (camelCase folder)
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
- Files: **kebab-case** with a role suffix: `login.controller.js`, `find-business-by-id.repository.js`, `cors.plugin.js`, `hash-password.util.js`, `check-user-is-logged-in.hook.js`, `user.table.js`.
- Feature folders: **camelCase** (`forgotPassword`, `listSessions`). Module folders: camelCase plural (`businessUsers`, `aiGenerations`).
- Function name = file name in camelCase + role suffix: `login.controller.js` → `loginController`, `find-business-by-id.repository.js` → `findBusinessByIdRepository`, `pino.config.js` → `pinoConfig` (a builder function gets a `build` prefix: `listen.config.js` → `buildListenConfig`), `cors.plugin.js` → `corsPlugin`, `not-found.handler.js` → `notFoundHandler`.
- Functions take **one object argument** (`{ db, id }`, `{ server, email }`).
- Every folder of shared pieces has an **`index.js` barrel** that re-exports; imports use `#src/...` aliases, e.g. `import { hashPasswordUtil } from '#src/utils/index.js'`.
- Layering: routes → controller → service → repository. Repositories only talk to the DB; controllers never query the DB.

### Planned modules for this project (mapped to the roadmap)
`health`, `auth`, `users` (profile + settings), `sessions`, `mail`, `ai` (provider adapters: image provider + LangChain model), `generations`, `images`, `edits` (image-to-image, editing, history), `vision`, `prompts`, `projects` (+ collections), `credits`, `notifications`, `usage`, `billing`. Worker (2.7): a separate entry such as `backend/worker.js` that reuses the same `src/`.

## client/
```
client/
├── jsconfig.json             "paths": { "@/*": ["./src/*"] }
└── src/
    ├── app/                  Next.js App Router: login/, register/, forgot-password/, reset-password/,
    │                         app/ (authenticated area: layout.js, page.js = dashboard, one folder per screen)
    ├── components/
    │   ├── layout/           navbar/, sidebar/
    │   └── ui/               Button, Card, Input, Modal, Pill, Select, Skeleton, Spinner, ToastRegion…
    ├── features/<feature>/   screen-specific components (auth/LoginForm.js, generator/, editor/…)
    ├── constants/            per-feature constants + navigation.js
    ├── context/              React contexts (Toast, MobileNav…)
    ├── hooks/
    ├── lib/                  API client, auth helpers
    └── store/                Redux Toolkit store
```
- Components: **PascalCase** files (`LoginForm.js`, `Button.js`).
- Pages are thin; UI lives in `features/` and `components/`.

## Differences from business book (this project's stack wins)
| Topic | business book | Mindcraft Digital Studio |
|---|---|---|
| Request validation | JSON Schema (Ajv) in `*.schema.js` | **Zod** in `*.schema.js` (same file name/location) |
| Styling | CSS Modules (`*.module.css`) | **Tailwind + shadcn/ui** (shadcn components go in `components/ui/`) |
| Dev restart | nodemon | either works; `node --watch` needs no extra package |
| Infrastructure folders | one sub-folder per area, often with a single file (`config/logger/pino.config.js`) | **flat** (`config/pino.config.js`); `<area>/` sub-folder only at 3+ files |
| `.gitignore` | one per folder (`backend/`, `client/`) | **one at repo root** |
| Plugin naming | `validate-env.plugin.js` / `validateEnvPlugin` (named after an action) | **`env.plugin.js` / `envPlugin`**: plugins are named after what they register, like `cors.plugin.js` |
| Reply decorator | `decorators/reply/send-success.decorator.js` (`sendSuccessDecorator`) + `plugins/reply/success-reply.plugin.js` | **flat** `decorators/reply-success.decorator.js` (`replySuccessDecorator`) + `plugins/reply-success.plugin.js` (`replySuccessPlugin`): one name, `reply-success`, everywhere |
| HTTP errors | `utils/errors/http-errors.util.js`, codes hard-coded as `'FST_NOT_FOUND'` (Fastify's own prefix) | **flat** `utils/http-errors.util.js`; codes come from `constants/error-code.constants.js` (`ERROR_CODE.NOT_FOUND`), one list the client can rely on and provider error categories get added to |
| Error handler | `handlers/error/handle-error.handler.js`; body key `error: 'FST_...'`; 500 messages hidden except an `instanceof` allow-list | **flat** `handlers/error.handler.js`; body key `code` (from `ERROR_CODE`), validation errors add `details`; a private `resolveError()` decides the response; messages are shown only for our own `ERROR_CODE` errors (that list is the allow-list), every other 5xx is hidden |
| Handler naming | `handle-error.handler.js` / `handleErrorHandler` (verb + role repeats itself) | **`error.handler.js` / `errorHandler`**, `not-found.handler.js` / `notFoundHandler`: named after what they handle, same rule as plugins |
| AI | Gemini SDK directly | LangChain.js + image provider adapter (still under `modules/ai/providers/`) |
| Extra | — | Redis/BullMQ worker, storage service, credits |
