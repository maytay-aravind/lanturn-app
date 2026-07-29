# LanTURN — API Specification

> REST API over HTTPS. Base URL: `https://<api-host>/api`. JSON only.
> **Auth:** `Authorization: Bearer <Firebase ID Token>` unless noted.
> Roles: `student`, `employer`, `admin`. Some endpoints are public.
> This document defines the contract. **Implementation lives in the backend.**

---

## 0. Conventions

### 0.1 Standard Response Envelope

```jsonc
// success
{ "data": { /* payload */ }, "meta": { "requestId": "uuid" } }

// error
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [ ... ] } }
```

### 0.2 Standard Error Codes

| HTTP | code | Meaning |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | Body/query failed schema validation. |
| 401 | `UNAUTHENTICATED` | Missing/invalid token. |
| 403 | `FORBIDDEN` | Authenticated but role/scope not allowed. |
| 404 | `NOT_FOUND` | Resource doesn't exist or not visible to caller. |
| 409 | `CONFLICT` | e.g. duplicate application, duplicate slug. |
| 422 | `UNPROCESSABLE` | Valid shape, business rule violation. |
| 429 | `RATE_LIMITED` | Too many requests / AI quota exhausted. |
| 500 | `INTERNAL` | Unexpected server error. |
| 502 | `UPSTREAM_ERROR` | Gemini/email/storage upstream failure. |

### 0.3 Pagination

List endpoints use cursor pagination:
- Query: `?limit=20&cursor=<opaque>`
- Response: `{ "items": [...], "nextCursor": "<opaque>|null" }`

### 0.4 Common Headers
- Request: `Authorization`, `X-Request-Id` (optional, server generates if absent).
- Response: `X-Request-Id`.

### 0.5 Dates & Money
- Timestamps: ISO 8601 UTC strings.
- Money: `{ amount: number, currency: "INR"|"USD"|..., period: "monthly"|"yearly"|"one-time" }`.

---

## 1. Auth & Session

### 1.1 `POST /api/auth/session`
Exchange Firebase ID token for a session view of the current user.

- **Auth:** Bearer token required.
- **Body:** none.
- **200:**
```jsonc
{
  "data": {
    "uid": "abc123",
    "email": "asha@example.com",
    "role": "student",
    "profileComplete": true,
    "profile": { /* role profile or null */ }
  }
}
```
- **Errors:** 401 `UNAUTHENTICATED`.

### 1.2 `POST /api/auth/onboarding`
Complete onboarding: choose role + initial role profile.

- **Auth:** Bearer token.
- **Body:**
```jsonc
{ "role": "student" | "employer", "profile": { /* role-specific initial fields */ } }
```
- **200:** updated `users` summary + role profile.
- **Errors:** 400 `VALIDATION_ERROR`; 409 `CONFLICT` (role already chosen).

### 1.3 `POST /api/auth/logout`
- **Auth:** Bearer token.
- **200:** `{ "data": { "ok": true } }`.

### 1.4 `GET /api/auth/health-check` *(optional debug)*
Returns whether the user doc exists. Public-read with token.

---

## 2. Student Profile

| # | Method | Route | Auth | Role | Description |
|---|--------|-------|------|------|-------------|
| 2.1 | GET | `/api/students/me` | ✅ | student | Get own profile. |
| 2.2 | PUT | `/api/students/me` | ✅ | student | Replace editable profile fields. |
| 2.3 | PATCH | `/api/students/me` | ✅ | student | Partial update. |
| 2.4 | GET | `/api/students/:uid` | ✅ | any (limited) | Public candidate view (restricted fields). |

### 2.2/2.3 Request body (PUT/PATCH `/api/students/me`)
```jsonc
{
  "personal": { "name": "Asha Rao", "phone": "+91…", "city": "Bengaluru", "state": "Karnataka", "country": "India" },
  "academic": { "college": "XYZ", "degree": "B.E.", "branch": "CSE", "graduationYear": 2026, "cgpa": 8.7 },
  "professional": { "skills": ["react","node"], "projects": [], "experience": [], "certifications": [] },
  "social": { "github": "asha", "linkedin": "asha-rao", "portfolio": "" }
}
```
- **200:** full profile document.
- **Errors:** 400 `VALIDATION_ERROR`; 403 `FORBIDDEN`.

---

## 3. Employer Profile

| # | Method | Route | Auth | Role | Description |
|---|--------|-------|------|------|-------------|
| 3.1 | GET | `/api/employers/me` | ✅ | employer | Get own company profile. |
| 3.2 | PUT | `/api/employers/me` | ✅ | employer | Replace profile. |
| 3.3 | PATCH | `/api/employers/me` | ✅ | employer | Partial update. |
| 3.4 | GET | `/api/employers/:uid` | ❌ | public | Public company profile. |

### Body (PUT/PATCH `/api/employers/me`)
```jsonc
{
  "companyName": "Acme",
  "website": "https://acme.example",
  "description": "…",
  "location": { "city": "Bengaluru", "state": "Karnataka", "country": "India" },
  "industry": "Software",
  "hrContact": { "name": "HR", "email": "hr@acme.example", "phone": "+91…" }
}
```

---

## 4. File Uploads (Storage)

| # | Method | Route | Auth | Description |
|---|--------|-------|------|-------------|
| 4.1 | POST | `/api/uploads/sign` | ✅ | Request a signed upload URL. |
| 4.2 | POST | `/api/uploads/commit` | ✅ | Confirm upload + persist URL on the relevant doc. |

### 4.1 Request body
```jsonc
{ "kind": "resume" | "profilePhoto" | "companyLogo", "mimeType": "application/pdf", "sizeBytes": 523000 }
```
### 4.1 Response
```jsonc
{ "data": { "uploadUrl": "https://…signed…", "objectPath": "uploads/<uid>/resume-<id>.pdf", "expiresAt": "…" } }
```
### 4.2 Request body
```jsonc
{ "kind": "resume", "objectPath": "uploads/<uid>/resume-<id>.pdf" }
```
### 4.2 Response
```jsonc
{ "data": { "url": "https://firebasestorage…/…/resume-<id>.pdf", "attachedTo": "students.me.resumeUrl" } }
```
- **Errors:** 400 invalid MIME/size; 413 too large; 415 unsupported type.

> Allowed MIME: `application/pdf` (resume), `image/png|jpeg|webp` (photo/logo). Max sizes enforced by `kind`.

---

## 5. Jobs

| # | Method | Route | Auth | Role | Description |
|---|--------|-------|------|------|-------------|
| 5.1 | GET | `/api/jobs` | ❌* | public* | List/search/filter active jobs. |
| 5.2 | GET | `/api/jobs/:jobId` | ❌* | public* | Get one job. |
| 5.3 | POST | `/api/jobs` | ✅ | employer | Create job. |
| 5.4 | PUT | `/api/jobs/:jobId` | ✅ | employer(owner) | Replace job. |
| 5.5 | PATCH | `/api/jobs/:jobId` | ✅ | employer(owner) | Partial update. |
| 5.6 | DELETE | `/api/jobs/:jobId` | ✅ | employer(owner)/admin | Soft delete (`status=removed`). |
| 5.7 | GET | `/api/employers/me/jobs` | ✅ | employer | List own jobs (any status). |

\* Public listing may require sign-in per product decision; keep configurable.

### 5.1 Query params
`q`, `jobType`, `industry`, `country`, `remote`, `skill`, `experienceLevel`, `salaryMin`, `sort`, `limit`, `cursor`.

### 5.3 Request body (create)
```jsonc
{
  "title": "Frontend Engineer",
  "description": "…",
  "requirements": ["3+ years React", "CI/CD"],
  "requiredSkills": ["react", "typescript"],
  "location": { "city": "Bengaluru", "state": "Karnataka", "country": "India", "remote": true },
  "jobType": "full-time",
  "industry": "Software",
  "salary": { "min": 800000, "max": 1200000, "currency": "INR", "period": "yearly" },
  "experienceLevel": "junior",
  "openings": 2,
  "deadline": "2026-09-30T23:59:59Z",
  "status": "active"
}
```
### 5.1/5.2 Response example
```jsonc
{
  "data": {
    "jobId": "job_001",
    "employerId": "emp_9",
    "companyName": "Acme",
    "companyLogoURL": "https://…",
    "title": "Frontend Engineer",
    "requiredSkills": ["react","typescript"],
    "location": { "city": "Bengaluru", "country": "India", "remote": true },
    "jobType": "full-time",
    "salary": { "min": 800000, "max": 1200000, "currency": "INR", "period": "yearly" },
    "status": "active",
    "deadline": "2026-09-30T23:59:59Z",
    "applicationCount": 12,
    "createdAt": "2026-07-28T10:00:00Z"
  },
  "meta": { "requestId": "…" }
}
```
- **Errors:** 403 `FORBIDDEN` (not owner); 404 `NOT_FOUND`; 422 invalid status transition.

---

## 6. Applications

| # | Method | Route | Auth | Role | Description |
|---|--------|-------|------|------|-------------|
| 6.1 | GET | `/api/applications` | ✅ | student | List my applications. |
| 6.2 | GET | `/api/jobs/:jobId/applications` | ✅ | employer(owner)/admin | List applicants for a job. |
| 6.3 | POST | `/api/jobs/:jobId/applications` | ✅ | student | Apply to a job. |
| 6.4 | GET | `/api/applications/:applicationId` | ✅ | student(owner)/employer(owner)/admin | Get one application. |
| 6.5 | PATCH | `/api/applications/:applicationId/status` | ✅ | employer(owner)/admin | Update status. |
| 6.6 | DELETE | `/api/applications/:applicationId` | ✅ | student(owner) | Withdraw. |

### 6.3 Request body
```jsonc
{ "coverLetter": "…", "resumeUrl": "https://…optional override…" }
```
### 6.3 Response (201)
```jsonc
{ "data": { "applicationId": "abc123_job001", "jobId": "job001", "status": "submitted", "createdAt": "…" } }
```
### 6.5 Request body
```jsonc
{ "status": "shortlisted" | "accepted" | "rejected" | "reviewed" }
```
- **Errors:** 409 `CONFLICT` (already applied); 422 deadline passed / job not active; 403 not owner.

---

## 7. Notifications

| # | Method | Route | Auth | Role | Description |
|---|--------|-------|------|------|-------------|
| 7.1 | GET | `/api/notifications` | ✅ | any | List my notifications (paginated). |
| 7.2 | PATCH | `/api/notifications/:id/read` | ✅ | any | Mark one as read. |
| 7.3 | POST | `/api/notifications/read-all` | ✅ | any | Mark all as read. |
| 7.4 | GET | `/api/notifications/unread-count` | ✅ | any | Unread count (fast). |

---

## 8. AI (Gemini) — server-side only

| # | Method | Route | Auth | Role | Description |
|---|--------|-------|------|------|-------------|
| 8.1 | POST | `/api/ai/resume-review` | ✅ | student | Review own resume. |
| 8.2 | POST | `/api/ai/resume-match` | ✅ | student | Match resume vs job. |
| 8.3 | POST | `/api/ai/skill-gap` | ✅ | student | Skill gap vs job. |
| 8.4 | POST | `/api/ai/interview-questions` | ✅ | student | Generate practice questions. |
| 8.5 | POST | `/api/ai/cover-letter` | ✅ | student | Generate cover letter. |
| 8.6 | POST | `/api/ai/career-chat` | ✅ | student | Career guidance chat turn. |
| 8.7 | GET | `/api/ai/threads` | ✅ | student | List chat threads. |
| 8.8 | GET | `/api/ai/threads/:threadId/messages` | ✅ | student(owner) | Thread messages. |

### 8.2 Request example
```jsonc
{ "jobId": "job001", "resumeUrl": "https://…optional…" }
```
### 8.2 Response example
```jsonc
{
  "data": {
    "matchScore": 78,
    "matchedSkills": ["react","typescript"],
    "missingSkills": ["aws"],
    "summary": "Strong on frontend; add cloud basics."
  }
}
```
### 8.6 Request (chat turn)
```jsonc
{ "threadId": "thr_1", "message": "How do I prepare for a React interview?", "mode": "interview_prep" }
```
- **Errors:** 429 `RATE_LIMITED` (AI quota); 502 `UPSTREAM_ERROR`.

---

## 9. Admin

| # | Method | Route | Auth | Role | Description |
|---|--------|-------|------|------|-------------|
| 9.1 | GET | `/api/admin/users` | ✅ | admin | List/search users. |
| 9.2 | PATCH | `/api/admin/users/:uid/status` | ✅ | admin | Enable/disable user. |
| 9.3 | PATCH | `/api/admin/users/:uid/role` | ✅ | admin | Change role (within policy). |
| 9.4 | GET | `/api/admin/jobs` | ✅ | admin | List all jobs (any status). |
| 9.5 | PATCH | `/api/admin/jobs/:jobId/status` | ✅ | admin | Moderate job (`removed`). |
| 9.6 | GET | `/api/admin/analytics/summary` | ✅ | admin | KPI summary. |
| 9.7 | GET | `/api/admin/analytics/series` | ✅ | admin | Time series. |
| 9.8 | GET | `/api/platform/config` | ✅ | admin | Read platform config. |
| 9.9 | PATCH | `/api/platform/config` | ✅ | admin | Update platform config. |

### 9.6 Response example
```jsonc
{ "data": { "users": 1234, "students": 1100, "employers": 130, "activeJobs": 88, "applications": 4521 } }
```

---

## 10. Health & Meta

| # | Method | Route | Auth | Description |
|---|--------|-------|------|-------------|
| 10.1 | GET | `/api/health` | ❌ | Liveness (no deps). |
| 10.2 | GET | `/api/health/ready` | ❌ | Readiness (Firebase reachable). |
| 10.3 | GET | `/api/version` | ❌ | Build/version info. |

---

## 11. Open questions / TBD
- Exact public-vs-auth policy for `GET /api/jobs` (product decision).
- Whether employers can download resumes (probably yes, only for their jobs).
- Whether to add `/api/admin/audit-log` (recommended post-v1).
- Email provider choice (see `NOTIFICATION_SYSTEM.md`).
