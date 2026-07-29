# LanTURN — Requirements

> Companion to `PROJECT_OVERVIEW.md`. Uses the convention **SHALL** (mandatory) vs **SHOULD** (recommended).

---

## 1. Functional Requirements

### 1.1 Authentication & Identity

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | The system SHALL allow sign-in via Google through Firebase Authentication. |
| FR-AUTH-02 | The system SHALL capture `uid`, `email`, `displayName`, `photoURL` from Google on first login. |
| FR-AUTH-03 | The system SHALL require **profile completion** before a user can perform role-specific actions. |
| FR-AUTH-04 | The user SHALL choose a role (**student** or **employer**) during profile completion. |
| FR-AUTH-05 | Admin role SHALL be assignable only by an existing admin (never self-assigned). |
| FR-AUTH-06 | The backend SHALL verify the Firebase ID token on every protected request. |
| FR-AUTH-07 | The system SHALL allow the user to sign out and revoke sessions. |
| FR-AUTH-08 | The system SHALL never rely solely on Google profile data — profile data lives in Firestore. |

### 1.2 Student Profile

| ID | Requirement |
|----|-------------|
| FR-SP-01 | The student profile SHALL support personal fields: name, profile photo, phone, city, state, country. |
| FR-SP-02 | The student profile SHALL support academic fields: college, degree, branch, graduation year, CGPA. |
| FR-SP-03 | The student profile SHALL support professional fields: skills, resume, projects, experience, certifications. |
| FR-SP-04 | The student profile SHALL support social fields: GitHub, LinkedIn, portfolio. |
| FR-SP-05 | The system SHALL allow the student to upload a profile photo and a resume (PDF). |
| FR-SP-06 | The student SHALL be able to edit their profile at any time. |

### 1.3 Employer Profile

| ID | Requirement |
|----|-------------|
| FR-EP-01 | The employer profile SHALL support: company name, logo, website, description, location, industry, HR contact. |
| FR-EP-02 | The employer SHALL be able to upload a company logo. |
| FR-EP-03 | The employer SHALL be able to edit the company profile at any time. |

### 1.4 Jobs

| ID | Requirement |
|----|-------------|
| FR-JOB-01 | The employer SHALL be able to create a job post. |
| FR-JOB-02 | The employer SHALL be able to edit and delete **only their own** job posts. |
| FR-JOB-03 | Any authenticated user SHALL be able to browse active jobs. |
| FR-JOB-04 | The system SHALL support job search by keyword. |
| FR-JOB-05 | The system SHALL support job filtering (e.g., location, job type, industry, salary range). |
| FR-JOB-06 | The job model SHALL capture title, description, requirements, location, type, salary, deadline, status. |

### 1.5 Applications

| ID | Requirement |
|----|-------------|
| FR-APP-01 | A student SHALL be able to apply to a job (one active application per job per student). |
| FR-APP-02 | The application SHALL reference the student's profile snapshot/resume at the time of applying. |
| FR-APP-03 | The student SHALL be able to track the status of their applications. |
| FR-APP-04 | The employer SHALL be able to view applicants for their jobs. |
| FR-APP-05 | The employer SHALL be able to accept or reject an application. |
| FR-APP-06 | Each status change SHALL trigger the appropriate notification. |

### 1.6 Notifications

| ID | Requirement |
|----|-------------|
| FR-NOTIF-01 | The system SHALL provide in-app notifications stored in Firestore. |
| FR-NOTIF-02 | The system SHALL provide email notifications triggered by backend events. |
| FR-NOTIF-03 | A new application SHALL notify the employer (in-app + email). |
| FR-NOTIF-04 | A status change (accepted/rejected) SHALL notify the student (in-app + email). |
| FR-NOTIF-05 | The user SHALL be able to mark notifications as read. |

### 1.7 AI Assistant (Gemini)

| ID | Requirement |
|----|-------------|
| FR-AI-01 | The system SHALL provide resume review with improvement suggestions. |
| FR-AI-02 | The system SHALL provide resume-vs-job match scoring. |
| FR-AI-03 | The system SHALL provide skill-gap analysis relative to a job. |
| FR-AI-04 | The system SHALL generate interview practice questions. |
| FR-AI-05 | The system SHALL provide career guidance chat. |
| FR-AI-06 | The system SHALL generate cover letters tailored to a job. |
| FR-AI-07 | All Gemini calls SHALL happen server-side — keys never reach the client. |

### 1.8 Admin

| ID | Requirement |
|----|-------------|
| FR-ADM-01 | The admin SHALL be able to view and moderate users (disable, change role in defined cases). |
| FR-ADM-02 | The admin SHALL be able to moderate jobs (take down). |
| FR-ADM-03 | The admin SHALL be able to view platform analytics (users, jobs, applications over time). |
| FR-ADM-04 | The admin SHALL be able to manage platform-wide configuration. |

---

## 2. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-PERF-01 | Performance | P95 API response time SHALL be < 800 ms excluding AI endpoints. |
| NFR-PERF-02 | Performance | AI endpoints SHALL return within the Gemini timeout (target < 20 s) and degrade gracefully. |
| NFR-SCAL-01 | Scalability | The backend SHALL be stateless so it can scale horizontally. |
| NFR-SCAL-02 | Scalability | Firestore composite indexes SHALL be defined for all list/filter queries. |
| NFR-SEC-01 | Security | All inputs SHALL be validated (see `SECURITY.md`). |
| NFR-SEC-02 | Security | Secrets SHALL never be committed to the repo. |
| NFR-SEC-03 | Security | Firestore rules SHALL deny by default. |
| NFR-SEC-04 | Security | File uploads SHALL be validated by MIME type and size. |
| NFR-AVAIL-01 | Availability | The frontend SHALL degrade gracefully when the API is unreachable. |
| NFR-MAINT-01 | Maintainability | No single file SHALL exceed ~400 lines without justification. |
| NFR-MAINT-02 | Maintainability | Code SHALL follow `CODING_GUIDELINES.md`. |
| NFR-ACC-01 | Accessibility | The web UI SHOULD meet WCAG 2.1 AA. |
| NFR-I18N-01 | Internationalization | v1 targets English; the UI SHOULD be structured for future i18n. |
| NFR-OBS-01 | Observability | The backend SHALL log structured request logs. |
| NFR-COST-01 | Cost | The system SHALL run on free-tier services for v1. |

---

## 3. Future Scope (Out of v1)

- Native Android/iOS app (see `MOBILE_PLAN.md`).
- Real-time 1:1 chat between student and employer.
- Video/voice interviews.
- Referral and endorsement system.
- ATS-style multi-stage pipelines.
- RAG-based AI assistant over the platform's own job corpus (see `GEMINI_INTEGRATION.md`).
- Premium/paid employer tiers.
- Multi-language support.

---

## 4. Constraints

| ID | Constraint |
|----|-----------|
| CON-01 | Must use only **free-tier** services for v1. |
| CON-02 | Frontend: React + Vite + Tailwind. |
| CON-03 | Backend: Node.js + Express. |
| CON-04 | Data layer: Firebase (Auth + Firestore + Storage). |
| CON-05 | AI: Google Gemini API only. |
| CON-06 | Backend built before frontend; frontend contains no business logic. |
| CON-07 | Must be backend-API driven so mobile/desktop clients can reuse it. |
| CON-08 | Single primary role per user (student / employer / admin). |
| CON-09 | No payment processing in v1. |
| CON-10 | Files must live in Firebase Storage — never in Firestore. |

---

## 5. Assumptions

1. Users have a Google account.
2. Firebase Spark (free) tier is sufficient for early launch; Blaze plan's free allowance is acceptable since it stays within free limits at low traffic.
3. A transactional email provider's free tier (e.g., Resend, Brevo, SendGrid) covers email volume at launch.
4. Gemini free-tier quota covers AI feature usage at launch; rate limiting protects the budget.

---

## 6. Acceptance Criteria (Definition of Done for v1)

- All **FR-AUTH**, **FR-SP**, **FR-EP**, **FR-JOB**, **FR-APP**, **FR-NOTIF** items implemented and verified.
- At least resume review + resume-vs-job match + cover letter generation from **FR-AI** shipped.
- Admin moderation (FR-ADM-01/02) functional.
- Firestore security rules deployed and tested.
- Frontend deployed to Vercel, backend deployed to Render/Oracle.
- End-to-end signup → profile → post job → apply → accept/reject → notification flow works.
