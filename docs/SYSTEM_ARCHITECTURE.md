# LanTURN — System Architecture

> Companion to `PROJECT_OVERVIEW.md` and `DATABASE_SCHEMA.md`.

---

## 1. Overall Architecture

LanTURN is a **backend-first, API-driven** platform. A single Node.js/Express backend owns all business logic and is the only component allowed to talk to Firebase Admin SDK and Gemini. The web frontend is a thin React SPA that consumes REST APIs.

```mermaid
flowchart TB
    subgraph Clients
        Web[Web SPA\nReact + Vite + Tailwind]
        Mobile[Future Mobile\nReact Native or PWA]
    end

    subgraph Backend[Node.js + Express API]
        MW[Middleware\nAuth, RBAC, Validation, RateLimit, Error]
        Routes[Routes]
        Ctl[Controllers]
        Svc[Services\nBusiness Logic]
        Repos[Repositories\nFirestore/Storage/Gemini/Email]
    end

    Web -- HTTPS + Firebase ID Token --> MW
    Mobile -- HTTPS + Firebase ID Token --> MW
    MW --> Routes --> Ctl --> Svc --> Repos
    Repos -- Admin SDK --> Firestore[(Firestore)]
    Repos -- Admin SDK --> Storage[(Firebase Storage)]
    Repos -- HTTPS --> Gemini[Google Gemini]
    Repos -- SMTP/API --> Mail[Email Provider]

    Web -- Firebase Client SDK --> AuthFb[Firebase Auth\nsign-in / token mint]
    AuthFb -. token used in header .-> MW
```

### Why this shape

- **Single source of truth for rules:** Putting logic in services keeps it reusable across clients.
- **Secret safety:** Firebase Admin SDK and Gemini keys live only on the server.
- **Stateless backend:** No session state in memory → horizontally scalable, easy to deploy on Render/Oracle free tier.

---

## 2. Backend-First Approach

```
1. Design data model (DATABASE_SCHEMA.md)
2. Design API contract (API_SPECIFICATION.md)
3. Build backend: routes → controllers → services → repositories
4. Verify backend with tests / Postman / curl
5. Build frontend that consumes the verified API
6. (Later) build mobile client that consumes the same API
```

**Rules:**
- The frontend MUST NOT implement business rules (e.g., eligibility, pricing, matching). It only displays and submits.
- The frontend MAY perform light UI validation (required fields, format hints), but the backend is the source of truth.

---

## 3. Logical Component Diagram

```mermaid
flowchart LR
    subgraph Presentation
        Pages[Pages / Routes]
        Components[UI Components]
        Contexts[Auth + UI Context]
    end
    subgraph ClientServices
        ApiClient[HTTP Client\naxios/fetch wrapper]
        FbClient[Firebase Client SDK\nAuth, Storage uploads]
    end
    subgraph ApplicationServer
        Express[Express App]
        ServicesDomain[Domain Services]
    end
    subgraph Infrastructure
        Firestore
        Storage
        Gemini
        Email
    end

    Pages --> Components
    Pages --> Contexts
    Pages --> ApiClient
    Pages --> FbClient
    ApiClient --> Express
    Express --> ServicesDomain
    ServicesDomain --> Firestore
    ServicesDomain --> Storage
    ServicesDomain --> Gemini
    ServicesDomain --> Email
```

---

## 4. Data Flow

### 4.1 Typical Authenticated Read/Write

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant W as Web SPA
    participant FB as Firebase Auth
    participant API as Express API
    participant FS as Firestore

    U->>W: Open app
    W->>FB: signInWithPopup(Google)
    FB-->>W: ID Token + user
    W->>API: GET /api/jobs (Authorization: Bearer <token>)
    API->>API: verifyIdToken(token)
    API->>FS: query jobs
    FS-->>API: docs
    API-->>W: 200 JSON
    W-->>U: Render list
```

### 4.2 File Upload (Resume / Photo / Logo)

Direct-to-storage upload using a **signed URL / Firebase Storage client SDK**; the resulting download URL is then stored in Firestore via the API. The backend never proxies large files.

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web SPA
    participant API as Express API
    participant ST as Firebase Storage
    participant FS as Firestore

    U->>W: Choose file
    W->>API: POST /api/uploads/sign\n{kind: 'resume'}
    API->>API: verify + authorize + validate quota
    API->>ST: create signed upload URL
    API-->>W: signed URL + object path
    W->>ST: PUT file bytes
    ST-->>W: ok
    W->>API: PATCH /api/profile {resumeUrl}
    API->>FS: update profile
    API-->>W: 200
```

> Alternative: use the Firebase Client SDK to upload directly to a `pending/<uid>/` prefix, then call the API to "commit" the upload (validate, move, persist URL). Either approach is acceptable as long as Firestore stores only URLs.

---

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web SPA
    participant FB as Firebase Auth
    participant API as Express API
    participant FS as Firestore

    U->>W: Click "Sign in with Google"
    W->>FB: signInWithPopup(GoogleAuthProvider)
    FB-->>W: {uid, email, displayName, photoURL, idToken}
    W->>API: POST /api/auth/session  (Authorization: Bearer idToken)
    API->>FB: verifyIdToken(idToken)
    API->>FS: get users/{uid}
    alt No profile yet
        API-->>W: 200 {profileComplete:false, role:null}
        W-->>U: Redirect to /onboarding
    else Profile exists
        API-->>W: 200 {profileComplete:true, role, profile}
        W-->>U: Redirect to role dashboard
    end
```

**Key points:**
- Identity comes from Firebase Auth; **profile** lives in Firestore `users/{uid}`.
- The ID token is sent on every API call as `Authorization: Bearer <idToken>`.
- Backend middleware verifies the token and loads the user document, attaching `req.user`.

---

## 6. Notification Flow

See `NOTIFICATION_SYSTEM.md` for the full design. Summary:

```mermaid
flowchart LR
    E[Domain Event\napply / accept / reject] --> NS[Notification Service]
    NS --> FS[(Firestore\nnotifications/)]
    NS --> MAIL[Email Service]
    FS -. realtime listener .-> W[Web SPA]
    MAIL --> USER[User Inbox]
```

Two channels: in-app (Firestore) + email (transactional). The web client subscribes to `notifications` for the current user with a Firestore `onSnapshot` listener for near-real-time updates.

---

## 7. AI Flow (Gemini)

See `GEMINI_INTEGRATION.md` for details. The frontend never calls Gemini.

```mermaid
sequenceDiagram
    participant U as Student
    participant W as Web SPA
    participant API as Express API
    participant ST as Storage
    participant G as Gemini

    U->>W: Click "Review my resume"
    W->>API: POST /api/ai/resume-review\n{resumeUrl, targetRoleId?}
    API->>API: verify + authorize + rate-limit
    API->>ST: download resume text (or cached)
    API->>G: structured prompt
    G-->>API: suggestions JSON
    API->>API: validate / sanitize output
    API-->>W: 200 {suggestions, score}
    W-->>U: Render review
```

- Long-running: AI endpoints have a longer timeout and graceful degradation.
- Output is validated/sanitized before being returned to the client.

---

## 8. Mobile Architecture

Detailed in `MOBILE_PLAN.md`. Recommendation: **PWA first**, native later.

- The mobile client reuses the **same REST API** — no separate backend.
- Auth uses Firebase Auth (React Native Firebase / Expo).
- Push notifications can later use Firebase Cloud Messaging (FCM).

---

## 9. Deployment Topology (Free Tier)

```mermaid
flowchart LR
    GH[GitHub] --> Vercel[Vercel Build\nWeb SPA]
    GH --> Render[Render / Oracle\nExpress API]
    Vercel --> User[End User]
    Render --> User
    Render --> Firebase[(Firebase\nProject)]
    Vercel --> Firebase
```

| Component | Host | Notes |
|-----------|------|-------|
| Web SPA | Vercel | Static build; env vars point to API + Firebase client config. |
| Express API | Render **or** Oracle Cloud Always Free | Docker or Node service; expose HTTPS. |
| Firebase | Google | Single project; separate dev/prod projects recommended. |
| Email | Resend / Brevo / SendGrid | Free tier SMTP/API. |

---

## 10. Environments

| Env | Purpose | Data |
|-----|---------|------|
| `local` | Developer machine | Emulator suite or dev Firebase project. |
| `dev` | Shared integration | Separate Firebase project; seed data. |
| `prod` | Live | Locked-down Firebase project; strict rules. |

> Use distinct Firebase projects for dev and prod. Never point dev code at prod data.

---

## 11. Cross-Cutting Concerns

| Concern | Strategy |
|---------|----------|
| **Logging** | Structured JSON logs (`pino` or `winston`); request id per request. |
| **Errors** | Central error-handling middleware; consistent error envelope. |
| **Validation** | Per-route schema validation (`zod` or `joi`). |
| **Configuration** | Validated `env` module; fail-fast on missing vars. |
| **Rate limiting** | In-memory for single instance; Redis if scaled. |
| **CORS** | Allowlist of origins from env. |
| **Secrets** | Environment variables only; never in repo. |

---

## 12. Trade-offs & Alternatives Considered

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Architecture style | REST over HTTP | GraphQL / tRPC | REST is simplest for multi-client reuse and AI-agent comprehension. |
| Where logic lives | Backend services | Frontend | Required by project rules; enables client reuse. |
| AI calls | Server-side only | Client-side | Secret safety, quota control, prompt governance. |
| File uploads | Direct-to-storage + URL in Firestore | Proxy through API | Avoids loading large files through Node; free-tier friendly. |
| Real-time | Firestore `onSnapshot` | WebSocket server | Avoids extra infra on free tier. |
| Mobile | PWA first | React Native first | Cheapest path to mobile; reuse 100% of web. |
| DB | Firestore | Postgres | Required by stack; fits real-time notifications and free tier. |
