# LanTURN — TODO

> Prioritized checklist of **every feature**, grouped by milestone (see `DEVELOPMENT_ROADMAP.md`).
> Check items off as they are completed. Items follow the docs; do not implement anything undefined here without first updating the relevant doc.

Legend: **[P0]** must-have for v1 · **[P1]** should-have for v1 · **[P2]** stretch / post-launch

---

## M0 — Foundations & Repo Setup
- [ ] **[P0]** Create GitHub repo; branch protection on `main`.
- [ ] **[P0]** Scaffold `frontend/` (Vite+React+TS/JSX) and `backend/` (Node+Express) per `BACKEND_STRUCTURE.md`/`FRONTEND_STRUCTURE.md`.
- [ ] **[P0]** ESLint + Prettier + EditorConfig in both apps.
- [ ] **[P0]** `.gitignore` (node_modules, dist, .env).
- [ ] **[P0]** `.env.example` for both apps.
- [ ] **[P0]** Create Firebase **dev** project; enable Auth (Google), Firestore, Storage.
- [ ] **[P0]** Configure Firebase emulators + `firebase.json`.
- [ ] **[P0]** CI workflow: lint + test on PRs.
- [ ] **[P1]** Pre-commit secret scan (`gitleaks`).

## M1 — Backend Skeleton & Auth
- [ ] **[P0]** `app.js`/`server.js` with helmet, CORS allowlist, JSON body, requestId, request logger.
- [ ] **[P0]** `config/` validated env (zod) + constants; no `process.env` elsewhere.
- [ ] **[P0]** Firebase Admin SDK init (singleton) + `db`/`auth`/`bucket` handles.
- [ ] **[P0]** Middlewares: `authenticate`, `requireRole`, `requireProfileComplete`, `validate`, `rateLimit`, `error`, `notFound`.
- [ ] **[P0]** `AppError` + standard error envelope.
- [ ] **[P0]** Provision `users/{uid}` on first login (transaction).
- [ ] **[P0]** `GET /api/health`, `GET /api/health/ready`, `GET /api/version`.
- [ ] **[P0]** `POST /api/auth/session`, `POST /api/auth/onboarding`, `POST /api/auth/logout`.
- [ ] **[P0]** zod schemas: auth, onboarding.
- [ ] **[P0]** Unit tests for auth + onboarding.

## M2 — Profiles & File Uploads
- [ ] **[P0]** Student profile: `GET/PUT/PATCH /api/students/me`.
- [ ] **[P0]** Public-limited `GET /api/students/:uid`.
- [ ] **[P0]** Employer profile: `GET/PUT/PATCH /api/employers/me`, public `GET /api/employers/:uid`.
- [ ] **[P0]** `POST /api/uploads/sign` + `POST /api/uploads/commit` with MIME/size validation.
- [ ] **[P0]** Resume text extraction + `resumeText` caching.
- [ ] **[P0]** Storage path layout (`resumes|photos|logos/<uid>/...`) + short-lived signed URLs.
- [ ] **[P1]** Ownership/isolation tests.

## M3 — Jobs
- [ ] **[P0]** `POST /api/jobs` (employer), `PUT/PATCH /api/jobs/:id` (owner).
- [ ] **[P0]** `DELETE /api/jobs/:id` soft delete (`status=removed`).
- [ ] **[P0]** `GET /api/jobs` browse + search + filters + cursor pagination.
- [ ] **[P0]** `GET /api/jobs/:id`.
- [ ] **[P0]** `GET /api/employers/me/jobs` (any status).
- [ ] **[P0]** Deploy composite indexes for jobs.
- [ ] **[P1]** Salary range + experience-level filtering.

## M4 — Applications
- [ ] **[P0]** `POST /api/jobs/:id/applications` (unique per student/job; snapshot resume/skills).
- [ ] **[P0]** `GET /api/applications` (student tracker).
- [ ] **[P0]** `GET /api/jobs/:id/applications` (employer applicants).
- [ ] **[P0]** `GET /api/applications/:id` (owner/employer/admin).
- [ ] **[P0]** `PATCH /api/applications/:id/status` (employer/admin) + statusHistory.
- [ ] **[P0]** `DELETE /api/applications/:id` (withdraw).
- [ ] **[P0]** Transactional `jobs.applicationCount` updates.
- [ ] **[P0]** Deadline/inactive-job guards.
- [ ] **[P1]** Optional `matchScore` caching from AI.

## M5 — Notifications
- [ ] **[P0]** `notifications` collection + repository.
- [ ] **[P0]** `notification.service` (create + dispatch email).
- [ ] **[P0]** Email client + templates: `application_received`, `application_status`, `job_removed`, `system`.
- [ ] **[P0]** Wire events: apply → employer; status change → student.
- [ ] **[P0]** `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/read-all`, `GET /api/notifications/unread-count`.
- [ ] **[P0]** Email retry + status (`sent`/`failed`).
- [ ] **[P1]** Idempotency per event key.
- [ ] **[P2]** Per-user email preferences.

## M6 — AI (Gemini)
- [ ] **[P0]** `gemini.client` (model, safety, timeout, retry, token accounting).
- [ ] **[P0]** `ai.service` + `aiQuota.service` + `ai_usage` ledger.
- [ ] **[P0]** `POST /api/ai/resume-review`.
- [ ] **[P0]** `POST /api/ai/resume-match`.
- [ ] **[P1]** `POST /api/ai/skill-gap`.
- [ ] **[P1]** `POST /api/ai/interview-questions`.
- [ ] **[P1]** `POST /api/ai/cover-letter`.
- [ ] **[P1]** `POST /api/ai/career-chat` + threads (`GET /api/ai/threads`, `GET /api/ai/threads/:id/messages`).
- [ ] **[P0]** zod validation on all AI outputs; prompt-injection defenses.
- [ ] **[P0]** Per-user daily quota (429 on excess).
- [ ] **[P2]** RAG over jobs for "Jobs for you".

## M7 — Admin & Analytics
- [ ] **[P0]** Admin role bootstrap (cloud console / existing admin).
- [ ] **[P0]** `GET /api/admin/users`; `PATCH /api/admin/users/:uid/status` (enable/disable).
- [ ] **[P1]** `PATCH /api/admin/users/:uid/role` (within policy).
- [ ] **[P0]** `GET /api/admin/jobs`; `PATCH /api/admin/jobs/:id/status` (moderate).
- [ ] **[P1]** `GET /api/admin/analytics/summary` + `/series`.
- [ ] **[P1]** `GET/PATCH /api/platform/config`.
- [ ] **[P0]** `analytics_events` writes on key actions.

## M8 — Frontend: Auth, Onboarding, Layout
- [ ] **[P0]** Vite + React + Tailwind + TanStack Query + react-router + firebase client.
- [ ] **[P0]** `apiClient` with auth interceptor + envelope parsing + 401 refresh.
- [ ] **[P0]** `AuthContext` + `GET /api/auth/session` hydration.
- [ ] **[P0]** Login page (Google) + Landing + NotFound.
- [ ] **[P0]** Onboarding: role select → student/employer forms.
- [ ] **[P0]** App shell (navbar, role-based sidebar, notification bell, footer).
- [ ] **[P0]** Route guards (`RequireAuth`, `RequireRole`, `RequireProfileComplete`).
- [ ] **[P1]** Light/dark theme (optional).

## M9 — Frontend: Profiles, Uploads, Jobs
- [ ] **[P0]** Student profile page + resume/photo uploaders.
- [ ] **[P0]** Employer company profile page + logo uploader.
- [ ] **[P0]** Jobs browse (search/filter) + job detail + apply button.
- [ ] **[P0]** Employer "my jobs" + create/edit job form.
- [ ] **[P0]** Loading/empty/error states for all screens.

## M10 — Frontend: Applications, Notifications, AI
- [ ] **[P0]** Student application tracker.
- [ ] **[P0]** Employer applicants list + status actions (accept/reject/shortlist).
- [ ] **[P0]** Real-time notification bell + toast + `/notifications` page.
- [ ] **[P0]** AI assistant chat UI (threaded).
- [ ] **[P1]** Resume review + match panels.
- [ ] **[P1]** Skill-gap, interview questions, cover-letter panels.

## M11 — Admin Frontend & Polish
- [ ] **[P1]** Admin dashboard + users moderation.
- [ ] **[P1]** Admin jobs moderation.
- [ ] **[P2]** Admin analytics views.
- [ ] **[P1]** Platform config page.
- [ ] **[P1]** Responsive + WCAG 2.1 AA pass.
- [ ] **[P1]** Internationalization-ready labels file.

## M12 — Hardening & Deploy
- [ ] **[P0]** Deploy frontend → Vercel; backend → Render/Oracle.
- [ ] **[P0]** Prod Firebase project + strict rules + indexes.
- [ ] **[P0]** Complete `SECURITY.md §12` checklist.
- [ ] **[P0]** Structured logging in prod; no PII.
- [ ] **[P0]** Secret rotation runbook.
- [ ] **[P0]** E2E smoke test: signup → profile → post → apply → accept/reject → notify.
- [ ] **[P1]** Error monitoring/alerting.

## M13 — PWA & Mobile-Ready
- [ ] **[P1]** `vite-plugin-pwa` + manifest + icons + offline shell.
- [ ] **[P1]** Cache `GET /api/jobs` (stale-while-revalidate).
- [ ] **[P1]** FCM web push: token registration + `POST /api/devices/register`.
- [ ] **[P2]** React Native + Expo (only if store/native needs arise).

---

## Backlog (post-v1)
- [ ] **[P2]** Real-time 1:1 student↔employer chat.
- [ ] **[P2]** Video/voice interviews.
- [ ] **[P2]** Referrals & endorsements.
- [ ] **[P2]** Multi-stage ATS pipelines.
- [ ] **[P2]** Notification retention cleanup job.
- [ ] **[P2]** Audit log endpoint (`/api/admin/audit-log`).
- [ ] **[P2]** Multi-language (i18n) support.
- [ ] **[P2]** Right-to-be-forgotten hard-delete flow.

---

## Notes
- **Sequence is mandatory** where milestones depend on each other (see `DEVELOPMENT_ROADMAP.md`).
- Always keep `docs/` in sync: if a feature here changes the API or schema, update `API_SPECIFICATION.md` / `DATABASE_SCHEMA.md` first.
- Mark items complete with the date/PR link in the body when useful.
