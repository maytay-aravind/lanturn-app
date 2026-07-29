# LanTURN — Security

> Threat model and controls for a Firebase + Express + React stack.
> Cross-references: `FIREBASE_SETUP.md` (rules), `API_SPECIFICATION.md` (envelope), `GEMINI_INTEGRATION.md` (AI safety).

---

## 1. Authentication

| Aspect | Control |
|--------|---------|
| Identity provider | Google via Firebase Authentication. |
| Token model | Firebase **ID token** (JWT) sent as `Authorization: Bearer`. Verified server-side via `admin.auth().verifyIdToken()`. |
| Token lifetime | ~1 hour; Firebase SDK refreshes silently. |
| Session | Stateless backend — no server sessions; identity derived from token each request. |
| Frontend token storage | In-memory + `sessionStorage`. Avoid long-lived `localStorage`. |
| Authorized domains | Restricted in Firebase Auth settings. |
| Disabled users | `users/{uid}.status = 'disabled'`; middleware rejects disabled users with 403. |
| Re-auth / revocation | Sign-out revokes client; rely on short token TTL + disabled flag. |

**Rules:**
- Every protected route goes through `authenticate` middleware.
- Public routes (`/api/health`, public job list) must explicitly opt out.
- Never trust client-sent `role`, `uid`, or `emailVerified` in request bodies — always derive from the verified token + Firestore user doc.

---

## 2. Authorization (RBAC)

| Role | Can access |
|------|-----------|
| `student` | own profile, browse/apply jobs, own applications, AI features, own notifications. |
| `employer` | own company profile, own jobs, applicants for own jobs, own notifications. |
| `admin` | moderation, analytics, platform config, user management. |
| (none) | unauthenticated; only public endpoints. |

**Controls:**
- `requireRole(...roles)` middleware on routes.
- `requireProfileComplete` gates role-specific actions until onboarding is done.
- **Ownership checks** in services: e.g., `jobService.update` confirms `job.employerId === req.user.uid`. Never rely on client routing alone.
- Admin role assignment is **server-controlled** only (existing admin or cloud console) — never self-service.

### Authorization matrix (excerpt)

| Resource | student | employer (owner) | admin |
|----------|---------|------------------|-------|
| `GET /api/jobs` | ✅ | ✅ | ✅ |
| `POST /api/jobs` | ❌ | ✅ | ❌ (moderation only) |
| `PATCH /api/jobs/:id` | ❌ | ✅ if owner | ✅ (status only) |
| `GET /api/jobs/:id/applications` | ❌ | ✅ if owner | ✅ |
| `PATCH /api/applications/:id/status` | ❌ | ✅ if job owner | ✅ |
| `GET /api/admin/*` | ❌ | ❌ | ✅ |

---

## 3. Input Validation

- **Every** request body, query, and path param is validated with **zod** schemas.
- Validate: required fields, types, string lengths, enums, ranges, and format (URL, ISO date, phone-ish).
- Reject unknown keys (`zod` `.strict()`) to avoid mass-assignment.
- Normalize before validation where needed (trim, lowercase email, lowercase skills).
- File uploads validated by **MIME + magic bytes** and **size** on the server (see §6).

---

## 4. Firestore Security Rules

- **Deny by default.** See `FIREBASE_SETUP.md §5.1` for full rules.
- **Admin SDK bypasses rules** — therefore the backend is the gatekeeper; rules protect against stray direct client access.
- Clients should read/write **through the API**, not directly. Allow-listed direct reads (e.g., notifications realtime, jobs list) are tightly scoped.
- Sensitive fields (`role`, `status`) cannot be changed by client writes.

---

## 5. Rate Limiting & Abuse Prevention

| Surface | Limit |
|---------|-------|
| General API | e.g., 100 req / 15 s / IP (tunable). |
| Auth/session | stricter per-IP limit to blunt brute-force/token replay. |
| AI endpoints | per-user daily quota (`AI_RATE_LIMIT_PER_DAY`) + per-IP burst limit; return 429 with `Retry-After`. |
| File upload sign/commit | per-user per-minute cap. |
| Application submit | per-student per-minute cap to prevent spam. |

- Implementation: in-memory limiter for single instance (e.g., `express-rate-limit`); switch to Redis-backed if scaling.
- Respond with 429 + standard error envelope; include `Retry-After`.

---

## 6. File Upload Security

- Allowed MIME:
  - Resume: `application/pdf`, ≤ 5 MB.
  - Photo/Logo: `image/png | jpeg | webp`, ≤ 2 MB.
- Validate on **both** client (UX) and **server** (authoritative) — check MIME from the upload metadata and, where feasible, magic bytes.
- Path layout is **per-user** (`resumes/<uid>/...`); Storage rules enforce that the path uid matches `request.auth.uid` (see `FIREBASE_SETUP.md §5.2`).
- Signed upload URLs are **short-lived** (e.g., 5–15 min) and scoped to one object path + method.
- Scan/anti-virus is out of scope for v1 (free tier); mitigate via MIME/size limits and unguessable object names.
- Download URLs stored in Firestore are public-read by design for display; avoid storing sensitive content beyond resumes/photos/logos.

---

## 7. Secrets Management

- Secrets live **only** in environment variables (host dashboard / `.env` locally, git-ignored).
- Secrets in scope: Firebase **service account** JSON fields, **Gemini API key**, **email API key**.
- **Never** commit secrets. Use `.env.example` with placeholders.
- Frontend Firebase web config is **not** secret (it's in the bundle); only the above server keys are.
- Rotate keys on personnel changes; use separate dev/prod credentials.
- Add a pre-commit/CI check for accidental secret leakage (e.g., `gitleaks`).

---

## 8. Transport & Headers

- **HTTPS everywhere.** Vercel (frontend) and Render/Oracle (backend) terminate TLS.
- Backend security headers via `helmet` (CSP, HSTS, no-sniff, frameguard).
- **CORS:** allowlist origins from env (`CORS_ORIGINS`); reflect origin only if allowlisted.
- Cookies: not used for auth (bearer token). If cookies are added later, set `HttpOnly`, `Secure`, `SameSite=Lax/Strict`.

---

## 9. OWASP Top 10 Considerations

| Risk | Mitigation |
|------|-----------|
| **A01 Broken Access Control** | Server-side ownership + role checks; deny-by-default Firestore rules; never trust client routing. |
| **A02 Cryptographic Failures** | TLS in transit; Firebase/Google managed at rest; no homemade crypto; secrets in env. |
| **A03 Injection** | NoSQL query injection: use SDK field paths, never string-interpolate user input into queries. Parameterized where possible. |
| **A04 Insecure Design** | Threat-model each feature; idempotency for notifications/applications; quotas. |
| **A05 Security Misconfiguration** | Deny-by-default rules; least privilege service account; disable X-Powered-By; error envelope hides stack in prod. |
| **A06 Vulnerable Components** | `npm audit` / Dependabot; pinned versions; regular updates. |
| **A07 Auth Failures** | Firebase Google auth; short-lived tokens; rate limits on auth endpoints; disable inactive users. |
| **A08 Data Integrity Failures** | Validate all inputs server-side; signed upload URLs; verify webhook signatures if email provider calls back. |
| **A09 Logging/Monitoring** | Structured logs with requestId/userId; log auth events, AI usage, rate-limit hits. No secret/PII logging. |
| **A10 SSRF** | No arbitrary client-supplied URLs fetched by the server; resume downloads only from our own Storage bucket; validate URLs against an allowlist host. |

### Additional
- **Prompt injection** (AI): see `GEMINI_INTEGRATION.md §5.5` — delimit user content as data; validate JSON output; cap input.
- **Mass assignment**: `.strict()` zod schemas; never spread client input into a write.
- **IDOR**: every object access checks ownership or admin role.
- **CSRF**: not applicable to bearer-token APIs; if cookie auth added, use CSRF tokens.

---

## 10. Privacy & Data Handling

- Collect only necessary PII; document purpose per field.
- Resumes/photos/logos are visible only to the owner and, for applications, to the relevant employer.
- Provide admin tools to disable users and remove jobs (soft-delete by default).
- Right-to-be-forgotten (future): hard-delete flow that removes user doc, role profile, applications, notifications, and Storage objects; anonymize analytics events.
- Do not send PII to Gemini beyond what's required (resume text). See `GEMINI_INTEGRATION.md §6`.

---

## 11. Logging & Incident Response

- Log auth outcomes (sign-in, token failures), rate-limit trips, AI usage, and errors with `requestId`.
- Never log ID tokens, service-account keys, or full resumes.
- On incident: disable user/keys, rotate secrets, review logs by `requestId`, and document a postmortem.

---

## 12. Security Checklist (release gate)
- [ ] All routes validated; strict schemas.
- [ ] RBAC + ownership checks on every mutation.
- [ ] Firestore + Storage rules deployed (deny by default).
- [ ] Helmet + CORS allowlist on backend.
- [ ] Rate limits on auth/AI/uploads.
- [ ] Secrets in env; `.env` git-ignored; secret-scan in CI.
- [ ] HTTPS enforced; HSTS on.
- [ ] Error envelope hides stack traces in prod.
- [ ] Dependency audit clean.
- [ ] File MIME/size validation enforced server-side.
