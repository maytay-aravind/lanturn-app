# LanTURN — Coding Guidelines

> Strict, enforceable rules for humans **and** AI coding agents.
> Applies to both `backend/` and `frontend/`. ESLint + Prettier must pass.

---

## 1. Guiding Principles
1. **Backend owns logic; frontend renders.** Never implement business rules in the client.
2. **Modularity over size.** Split files by concern; one job per file.
3. **Readability first.** Code is read far more than it is written.
4. **Fail fast, fail safe.** Validate inputs at the edges; throw typed errors.
5. **No magic.** Prefer explicit over clever; name things well.
6. **Match the surrounding code.** When editing, mirror local style, naming, and idioms.

---

## 2. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files (domain) | `camelCase.service.js`, `job.controller.js`, `auth.routes.js`, `job.schema.js` | `application.service.js` |
| Files (React components) | `PascalCase.jsx` | `JobCard.jsx` |
| Directories | `lowercase` or `kebab-case` | `components/`, `chat-threads/` |
| Variables/functions | `camelCase` | `getActiveJobs` |
| Classes | `PascalCase` | `class AppError` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_UPLOAD_BYTES` |
| Enums/union values | `kebab-case` strings | `"full-time"`, `"application_received"` |
| Firestore collections | `lowercase` plural | `notifications` |
| Document ids | `camelCase` or `<studentId>_<jobId>` | `job_001`, `abc123_job001` |
| Env vars | `UPPER_SNAKE_CASE`; client vars prefixed `VITE_` | `GEMINI_API_KEY`, `VITE_API_URL` |
| Boolean vars | `is/has/can/should` prefix | `isAuthenticated`, `hasRole` |
| Event handlers | `on*` (props), `handle*` (functions) | `onSubmit`, `handleSubmit` |

---

## 3. Folder Rules

### Backend
- Follow `BACKEND_STRUCTURE.md` exactly. Do not invent top-level folders.
- `routes` → `controllers` → `services` → `repositories/clients`. No skipping layers.
- `repositories/` = Firestore I/O only. `clients/` = external APIs only.
- `schemas/` owns all zod schemas; reuse across middleware + types.
- `config/` is the only place `process.env` is read.
- No circular imports. Repositories must not import services.

### Frontend
- Follow `FRONTEND_STRUCTURE.md`. Feature folders under `components/`, pages under `pages/`.
- All HTTP calls live in `services/`. Components import services, never `fetch`.
- Hooks in `hooks/`; query hooks under `hooks/queries/`.
- UI primitives in `components/ui/`; reuse them — don't reinvent buttons/inputs.
- No business logic in components (no match-score computation, eligibility checks, etc.).

---

## 4. Function & File Length

- **Functions:** aim for ≤ 40 lines. If longer, extract helpers with descriptive names.
- **Files:** ≤ 400 lines. If larger, split by responsibility and justify in a comment.
- **Components:** ≤ 250 lines. Split into subcomponents when growing.
- **Route handlers / controllers:** thin — parse, call service, shape response. No business logic.

---

## 5. Error Handling

### Backend
- Throw typed `AppError(code, message, { status, details })`. Do not throw raw strings.
- Use `asyncHandler` so rejections reach `error.middleware.js`.
- Central error middleware converts errors to the standard envelope; never leak stack traces in prod.
- Map external failures to `UPSTREAM_ERROR` (502) or `RATE_LIMITED` (429) where appropriate.
- Validate before side effects; use Firestore **transactions** for multi-doc writes.
- Never swallow errors silently; at minimum log with context.

### Frontend
- Services throw `ApiError(code, message, details)` parsed from the envelope.
- Handle errors at the call site (TanStack Query `onError`, try/catch in handlers).
- Show user-friendly toasts/messages; never show raw stack traces.

---

## 6. Logging

- **Structured JSON logs** (`pino`/`winston`).
- Every request logged once with: method, path, status, duration ms, `requestId`, `userId` (if authed).
- Errors logged with stack + `requestId`.
- **Never** log: ID tokens, passwords, service-account keys, full resumes, or unnecessary PII.
- Include enough context to debug: entity ids, operation name, relevant params (non-secret).
- Use log levels correctly: `info` (lifecycle), `warn` (recoverable), `error` (failures), `debug` (dev only).

---

## 7. Documentation

- **JSDoc** on exported public functions: purpose, params, returns, throws.
- Add a brief header comment for non-obvious files explaining their role.
- Keep `docs/` as the source of truth for architecture. Update docs when design changes.
- Comment **why**, not **what**. The code already says what.
- TODOs must include context and owner/issue link: `// TODO(auth): handle revocation — see #123`.

---

## 8. Git Commit Style (Conventional Commits)

Format: `<type>(<scope>): <subject>` with optional body + footer.

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`.

Rules:
- Subject ≤ 72 chars, imperative mood, lowercase after type, no trailing period.
- Scope optional but encouraged (`feat(api):`, `feat(web):`, `feat(ai):`).
- Reference issues in the footer: `Closes #42`.
- One logical change per commit.
- Don't commit secrets or generated files (`dist/`, `node_modules/`).

Examples:
```
feat(api): add job search with filters and pagination
fix(web): correct 401 handling by refreshing token once
docs: clarify notification lifecycle in NOTIFICATION_SYSTEM.md
chore(firebase): deploy prod indexes
```

---

## 9. API Standards

- RESTful nouns, plural collection names: `/api/jobs`, `/api/applications`.
- Standard envelope (`{ data, meta }` / `{ error }`) on **every** response (see `API_SPECIFICATION.md §0`).
- Correct HTTP status codes; don't overload 200.
- Cursor pagination (`limit`, `cursor`) — never return unbounded lists.
- Validate request body/query/params with zod; use `.strict()` to reject unknown keys.
- Versioning: prefix-free for v1 (`/api/...`). If breaking changes are needed later, introduce `/api/v2`.
- Idempotency where it matters (e.g., application submit) — by composite key.
- Consistent field names: `camelCase` in JSON, ISO timestamps, money as structured objects.

---

## 10. Data & Firestore Rules

- One source of truth per fact; denormalize **display-only** fields intentionally and update via a single service method.
- Never store files in Firestore — only URLs.
- Always set `createdAt`/`updatedAt` via server timestamps.
- Use Firestore transactions for multi-document writes and counter updates.
- Define composite indexes before shipping queries that need them.
- Lowercase searchable tokens (`searchableSkills`, `requiredSkills`) for consistent matching.
- Avoid fan-out reads; design reads to hit 1 collection per screen where possible.

---

## 11. Security Hygiene
- Never trust client input (body, query, params, headers) — validate everything.
- Never derive identity from request body — always from the verified token.
- Authorization checks live in services, not only in routes/UI.
- Secrets only in env; `.env` git-ignored; CI runs a secret scan.
- Use `helmet`, CORS allowlist, rate limits.
- See `SECURITY.md` for the full checklist.

---

## 12. Testing
- **Unit tests** for services (mock repositories/clients), schemas, and utils.
- **Integration tests** for routes against the Firestore emulator with fixtures.
- **Frontend tests** for components/hooks with React Testing Library + vitest.
- Name tests `*.test.js(x)`, colocated with the code.
- Aim for meaningful coverage of business rules, not 100% blindly.
- Run `npm test` before every PR; CI enforces it.

---

## 13. Code Review Checklist

Reviewer asks:
- [ ] Does it follow the layering rules (no skipped layers, no logic in controllers/components)?
- [ ] Are inputs validated with strict schemas?
- [ ] Are authorization/ownership checks present and server-side?
- [ ] No secrets committed; no PII over-logged?
- [ ] Error handling uses typed errors and the central handler?
- [ ] No unbounded queries; indexes exist for new query shapes?
- [ ] Files/functions within length limits; names are clear?
- [ ] Tests cover the new/changed behavior?
- [ ] Docs updated if architecture/API changed?
- [ ] Commit messages follow Conventional Commits?

---

## 14. Rules AI Coding Agents MUST Follow

> These are hard constraints. If a task would violate one, **stop and flag it** instead of proceeding.

1. **Backend before frontend.** Do not build frontend for features whose backend endpoints don't exist.
2. **No business logic in the frontend.** If you're tempted to compute eligibility, matching, pricing, or status transitions in a component, that belongs in a backend service.
3. **Layer discipline.** Controllers call services; services call repositories/clients. Repositories never call services. No Express objects (`req`/`res`) inside services or repositories.
4. **Single source of truth.** Do not duplicate endpoint URLs or collection logic. Use the `services/` layer and `repositories/` layer respectively.
5. **Validate everything.** Add/extend zod schemas for any new input. Use `.strict()`.
6. **Never invent endpoints or collections.** Only use what's in `API_SPECIFICATION.md` / `DATABASE_SCHEMA.md`. If something is missing, **add it to the docs first**, then implement.
7. **Authz in services.** Add ownership/role checks in services, not only in routes.
8. **No secrets in code.** Read config only via `#config`; never hardcode keys or tokens.
9. **Match local style.** Mirror naming, file placement, and idioms of nearby code.
10. **Keep files small.** Split at the limits in §4.
11. **Update docs when design changes.** Keep `docs/` accurate; out-of-date docs are a bug.
12. **Tests required.** Add or update tests for any behavioral change.
13. **Conventional Commits** for all commits; one logical change per commit.
14. **No silent failures.** Throw typed errors; never swallow.
15. **Idempotency & transactions** for multi-step writes (applications, status changes, counters).
16. **When unsure, ask or flag** rather than guessing — especially for security, data model, or API contract changes.
