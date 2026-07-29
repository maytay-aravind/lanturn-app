# LanTURN — Backend Structure

> Node.js + Express. Layered: **routes → controllers → services → repositories**. Config and infra isolated.
> See `CODING_GUIDELINES.md` for rules and `API_SPECIFICATION.md` for the contract.

---

## 1. Layering Rules

```
HTTP request
   │
   ▼
[Middlewares]  authn → rbac → validation → rateLimit → requestLogger
   │
   ▼
[Routes]            map URL → controller method
   │
   ▼
[Controllers]       thin: parse req, call service, shape response. No business logic.
   │
   ▼
[Services]          ALL business logic. Orchestrates repositories + external clients.
   │
   ▼
[Repositories / Clients]  Firestore, Storage, Gemini, Email. Only I/O here.
```

- Controllers MUST NOT touch Firestore/Gemini directly.
- Services MUST NOT know about Express (`req`/`res`).
- Repositories/clients MUST NOT contain business rules.

---

## 2. Folder Layout

```
backend/
├─ src/
│  ├─ app.js                      # Express app instance + middleware wiring
│  ├─ server.js                   # HTTP server bootstrap (listen)
│  ├─ config/
│  │  ├─ index.js                 # validated env + config object (fail-fast)
│  │  ├─ env.js                   # env schema (zod) + NODE_ENV helpers
│  │  └─ constants.js             # roles, statuses, limits, mime types
│  ├─ firebase/
│  │  ├─ index.js                 # initialize Admin SDK (singleton)
│  │  ├─ firestore.js             # db handle
│  │  ├─ auth.js                  # auth handle
│  │  └─ storage.js               # bucket handle + helpers
│  ├─ middlewares/
│  │  ├─ index.js                 # barrel
│  │  ├─ auth.middleware.js       # verify Firebase ID token → req.user
│  │  ├─ rbac.middleware.js       # requireRole('student' | 'employer' | 'admin')
│  │  ├─ validate.middleware.js   # run zod schema on req.body/query/params
│  │  ├─ rateLimit.middleware.js  # per-route + AI-specific limits
│  │  ├─ error.middleware.js      # central error handler (last)
│  │  ├─ notFound.middleware.js   # 404 for unknown routes
│  │  └─ requestContext.middleware.js  # attach requestId, logger
│  ├─ utils/
│  │  ├─ asyncHandler.js          # wraps async controllers (forwards errors)
│  │  ├─ httpErrors.js            # AppError classes + error codes
│  │  ├─ logger.js                # pino/winston instance
│  │  ├─ pagination.js            # cursor helpers
│  │  ├─ ids.js                   # id/slug generators
│  │  └─ firebaseTimestamp.js     # timestamp converters
│  ├─ schemas/                    # zod validation schemas (input)
│  │  ├─ auth.schema.js
│  │  ├─ student.schema.js
│  │  ├─ employer.schema.js
│  │  ├─ job.schema.js
│  │  ├─ application.schema.js
│  │  ├─ ai.schema.js
│  │  └─ admin.schema.js
│  ├─ repositories/               # Firestore I/O (one file per collection)
│  │  ├─ users.repository.js
│  │  ├─ students.repository.js
│  │  ├─ employers.repository.js
│  │  ├─ jobs.repository.js
│  │  ├─ applications.repository.js
│  │  ├─ notifications.repository.js
│  │  ├─ chat.repository.js
│  │  ├─ aiUsage.repository.js
│  │  └─ analytics.repository.js
│  ├─ clients/                    # external integrations (non-Firestore)
│  │  ├─ gemini.client.js         # Gemini API wrapper + retry/timeout
│  │  ├─ email.client.js          # email provider wrapper
│  │  └─ storage.client.js        # signed URL + download helpers
│  ├─ services/                   # business logic
│  │  ├─ auth.service.js
│  │  ├─ profile.service.js       # student + employer profile orchestration
│  │  ├─ upload.service.js        # sign + commit upload flows
│  │  ├─ job.service.js
│  │  ├─ application.service.js
│  │  ├─ notification.service.js  # writes notifications + dispatches email
│  │  ├─ email.service.js         # templates + sending
│  │  ├─ ai.service.js            # orchestrates Gemini features
│  │  ├─ aiQuota.service.js       # per-user quota checks/updates
│  │  ├─ analytics.service.js
│  │  └─ admin.service.js
│  ├─ controllers/
│  │  ├─ auth.controller.js
│  │  ├─ student.controller.js
│  │  ├─ employer.controller.js
│  │  ├─ upload.controller.js
│  │  ├─ job.controller.js
│  │  ├─ application.controller.js
│  │  ├─ notification.controller.js
│  │  ├─ ai.controller.js
│  │  └─ admin.controller.js
│  ├─ routes/
│  │  ├─ index.js                 # mounts all routers under /api
│  │  ├─ auth.routes.js
│  │  ├─ student.routes.js
│  │  ├─ employer.routes.js
│  │  ├─ upload.routes.js
│  │  ├─ job.routes.js
│  │  ├─ application.routes.js
│  │  ├─ notification.routes.js
│  │  ├─ ai.routes.js
│  │  ├─ admin.routes.js
│  │  └─ health.routes.js
│  └─ types/                      # (if TS) or JSDoc typedefs
│     ├─ express.d.ts             # augments req.user
│     └─ domain.d.ts              # shared domain types
├─ tests/
│  ├─ unit/                       # services, schemas, utils
│  ├─ integration/                # routes + repositories (emulator)
│  └─ fixtures/
├─ .env.example
├─ .eslintrc.cjs
├─ .prettierrc
├─ package.json
├─ render.yaml                    # Render service definition (or Dockerfile)
├─ Dockerfile
└─ README.md
```

---

## 3. File Responsibilities

### 3.1 Entry points
- **`server.js`** — boots `app.js`, calls `app.listen()`, handles graceful shutdown.
- **`app.js`** — creates Express app, registers global middleware (CORS, JSON, helmet, requestId, logger), mounts `/api` routes, attaches error handler **last**.

### 3.2 Config (`config/`)
- **`env.js`** — zod schema for required env vars. Throws on missing/invalid in production; warns in dev.
- **`index.js`** — exports a frozen `config` object (e.g., `config.firebase`, `config.gemini`, `config.cors.origins`, `config.limits.uploadMaxBytes`). **No `process.env` access outside this folder.**
- **`constants.js`** — role enum, status enums, mime allowlists, default page sizes.

### 3.3 Firebase (`firebase/`)
- Initializes Admin SDK **once** using service account env vars.
- Exposes `db`, `auth`, `bucket` handles. No business logic.

### 3.4 Middlewares (`middlewares/`)
- **`auth.middleware.js`** — reads `Authorization: Bearer`, calls `auth.verifyIdToken()`, loads `users/{uid}`, attaches `req.user = { uid, role, profileComplete, ... }`.
- **`rbac.middleware.js`** — `requireRole(...roles)` → 403 if mismatch. Also a `requireProfileComplete` helper.
- **`validate.middleware.js`** — `validate({ body?, query?, params? })` runs zod schemas.
- **`rateLimit.middleware.js`** — general limiter + stricter limiter for `/api/ai/*`.
- **`error.middleware.js`** — normalizes `AppError` and zod errors into the standard envelope; logs; never leaks stack to client in prod.

### 3.5 Schemas (`schemas/`)
- One zod schema file per domain. Used by both validation middleware and TS inference.

### 3.6 Repositories (`repositories/`)
- Pure data access: `getById`, `list`, `create`, `update`, `delete`, plus collection-specific queries (e.g., `jobs.listActive({ filters, cursor })`).
- Return plain objects (DTOs), not Firestore DocumentSnapshots.

### 3.7 Clients (`clients/`)
- **`gemini.client.js`** — wraps the Gemini SDK: model selection, safety settings, timeout, retry on transient errors, token accounting.
- **`email.client.js`** — abstracts the email provider so it can be swapped.
- **`storage.client.js`** — signed upload URLs, download-to-text for resumes.

### 3.8 Services (`services/`)
- All business rules and orchestration. Example: `applicationService.apply({ studentId, jobId, coverLetter })` checks job is active, deadline not passed, no duplicate, writes `applications`, increments `jobs.applicationCount`, creates a notification for the employer, and records an analytics event — ideally in a **Firestore transaction**.

### 3.9 Controllers (`controllers/`)
- Thin. Pattern:
  ```js
  export const apply = asyncHandler(async (req, res) => {
    const result = await applicationService.apply({ studentId: req.user.uid, jobId: req.params.jobId, ...req.body });
    res.status(201).json({ data: result });
  });
  ```

### 3.10 Routes (`routes/`)
- Define the URL shape and attach middleware per route. Example:
  ```js
  router.post('/jobs/:jobId/applications',
    authenticate, requireRole('student'), requireProfileComplete,
    validate({ body: applyBodySchema }),
    applicationsCtrl.apply);
  ```

### 3.11 Utils (`utils/`)
- `asyncHandler` — wraps async fns to forward rejections to error middleware.
- `httpErrors.js` — `class AppError extends Error { constructor(code, message, { status, details }) }`.
- `logger.js` — structured logging with request id binding.

---

## 4. Cross-Cutting Patterns

### 4.1 Error Flow
Controllers throw `AppError`; everything else throws typed errors; `error.middleware.js` converts to the response envelope.

### 4.2 Transactions
Multi-document writes (apply, status change, counters) use `db.runTransaction(async tx => ...)`.

### 4.3 Pagination
Repositories accept `{ limit, cursor }` and return `{ items, nextCursor }`. Cursor is opaque (base64 of last doc fields or doc id).

### 4.4 Logging
- One log per request at the end (method, path, status, ms, requestId, userId).
- Errors logged with stack + requestId.
- Never log tokens, passwords, or PII beyond email.

### 4.5 Configuration access
Always `import { config } from '#config'`. No direct `process.env`.

---

## 5. Module Resolution

Use Node subpath imports (`package.json` `imports` map) for clean aliases:
- `#config`, `#middlewares`, `#services`, `#repositories`, `#schemas`, `#utils`, `#firebase`, `#clients`.

Example import: `import { applicationService } from '#services/application.service.js'`.

---

## 6. Environment Variables (`.env.example`)

```bash
NODE_ENV=development
PORT=8080

# CORS
CORS_ORIGINS=http://localhost:5173

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_STORAGE_BUCKET=

# Gemini
GEMINI_API_KEY=

# Email provider (e.g., Resend)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=
EMAIL_FROM="LanTURN <no-reply@lanturn.app>"

# Limits
UPLOAD_MAX_BYTES=5242880
AI_RATE_LIMIT_PER_DAY=20
```

---

## 7. Scripts (package.json)

```jsonc
{
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "lint": "eslint src",
    "format": "prettier --write .",
    "test": "jest",
    "test:integration": "FIRESTORE_EMULATOR_HOST=localhost:8080 jest --config jest.int.config.js"
  }
}
```

---

## 8. Deployment Notes
- **Render:** use `render.yaml` with a web service; env vars in dashboard; auto-deploy from GitHub.
- **Oracle Cloud Always Free:** Node behind a reverse proxy (Nginx/Caddy) with PM2 or Docker; HTTPS via Caddy/Let's Encrypt.
- Stateless: no sticky sessions, no in-memory cache required for v1.

---

## 9. Testing Strategy
- **Unit:** services (mock repositories/clients), schemas, utils.
- **Integration:** routes against Firestore emulator; seed fixtures.
- **Contract:** keep a Postman/bruno collection matching `API_SPECIFICATION.md`.

---

## 10. Keep-It-Tidy Rules
- One concern per file.
- No file > ~400 lines without justification.
- No circular imports (services ↔ repositories, never repository ↔ controller).
- Re-export barrels (`index.js`) for clean imports, but avoid over-nesting.
