# LanTURN — Firebase Setup

> How Firebase is configured for **Auth**, **Firestore**, **Storage**, **Security Rules**, **Indexes**, and **Environment Variables**.
> See `SECURITY.md` for the threat model and `DATABASE_SCHEMA.md` for field-level design.

---

## 1. Project Layout

| Env | Firebase Project | Purpose |
|-----|------------------|---------|
| Local dev | `lanturn-dev` **or** Emulator Suite | Per-developer testing. |
| Integration | `lanturn-dev` (shared) | Shared backend/frontend integration. |
| Production | `lanturn-prod` | Live data; locked down. |

> Use **separate projects** for dev and prod. Never run dev code against prod data.

### Enable products
In each project, enable:
- **Authentication** → sign-in provider: **Google**.
- **Cloud Firestore** → location: `asia-south1 (Mumbai)` or nearest; production mode.
- **Cloud Storage** → same region.

### Billing
- **Spark (free)** is fine for dev.
- **Blaze (pay-as-you-go)** is recommended for prod but **stays within free-tier allowances** at low traffic. Set budget alerts.

---

## 2. Authentication

### 2.1 Provider
- Enable **Google** sign-in.
- Configure **authorized domains** in Auth settings:
  - `localhost` (dev)
  - `<your-app>.vercel.app`
  - custom domain (prod)

### 2.2 Service accounts
- **Backend** uses a **service account** (JSON) via Admin SDK → env vars (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
- **Frontend** uses the **public web config** (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `appId`) — these are not secret.

### 2.3 Token verification
- Frontend mints an **ID token** after Google sign-in.
- Backend verifies it on every protected request via `admin.auth().verifyIdToken()`.
- ID tokens live ~1 hour; client refreshes silently via Firebase SDK.

### 2.4 User → Firestore profile sync
On first login the backend ensures a `users/{uid}` document exists (created in a Firestore transaction to avoid races). The Google profile fields are stored for display only; **the canonical profile is the role-specific subcollection**.

---

## 3. Firestore

### 3.1 Data model
See `DATABASE_SCHEMA.md`. Collections: `users`, `students`, `employers`, `jobs`, `applications`, `notifications`, `chat_threads`, `chat_messages`, `ai_usage`, `analytics_events`, `platform_config`.

### 3.2 Indexes
Defined via `firestore.indexes.json` (deploy with `firebase deploy --only firestore:indexes`). Summary in `DATABASE_SCHEMA.md §12`.

Example entry:
```jsonc
{
  "collectionGroup": "jobs",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### 3.3 Real-time
The web client subscribes to `notifications` (per-user) and optionally `chat_messages` (per-thread) using `onSnapshot`.

---

## 4. Storage

### 4.1 Bucket layout
```
gs://<bucket>/
├─ resumes/<uid>/<resumeId>.pdf
├─ photos/<uid>/<photoId>.{jpg|png|webp}
└─ logos/<uid>/<logoId>.{jpg|png|webp}
```

### 4.2 Upload strategy (recommended)
- **Sign + PUT:** Frontend requests a signed upload URL from `POST /api/uploads/sign`, uploads bytes directly, then calls `POST /api/uploads/commit`. The backend validates MIME/size, persists the resulting public/signed download URL into the right document.
- (Alternative) Frontend uploads via Firebase Client SDK to a `pending/<uid>/` prefix; backend "commits" by validating and moving the file. Either is acceptable.

### 4.3 Limits
- Resume: `application/pdf`, max **5 MB**.
- Photo/Logo: `image/png|jpeg|webp`, max **2 MB**.
- Enforced on both client (UX) and backend (authoritative).

---

## 5. Security Rules

**Principle:** deny by default. The backend uses the **Admin SDK**, which **bypasses** these rules — so rules primarily protect against direct client access (web/PWA, mobile). The intended access pattern is: clients read/write **through the API**, not directly to Firestore. Rules are a defense-in-depth backstop.

### 5.1 `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
    function hasRole(r)  { return isSignedIn()
                           && exists(/databases/$(database)/documents/users/$(request.auth.uid))
                           && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == r; }

    // Base user profile: each user may read & write their own minimal identity doc.
    // Role/status changes are NOT allowed from clients (handled by backend/Admin SDK).
    match /users/{uid} {
      allow read: if isSignedIn();
      allow create: if isOwner(uid);
      allow update: if isOwner(uid)
                     && request.resource.data.role == resource.data.role
                     && request.resource.data.status == resource.data.status;
      allow delete: if false;
    }

    // Role profiles: owner read/write only. Most writes happen via Admin SDK.
    match /students/{uid} {
      allow read: if isSignedIn();
      allow write: if isOwner(uid);
    }
    match /employers/{uid} {
      allow read: if isSignedIn();   // company profiles are visible to signed-in users
      allow write: if isOwner(uid);
    }

    // Jobs: clients read active jobs; no direct writes (backend only).
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if false;
    }

    // Applications: owner student may read; no direct writes.
    match /applications/{applicationId} {
      allow read: if isSignedIn();
      allow write: if false;
    }

    // Notifications: owner only.
    match /notifications/{id} {
      allow read, update: if isOwner(request.resource.data.userId);
      allow create, delete: if false;
    }

    // Chat: owner of thread only.
    match /chat_threads/{threadId} {
      allow read, update: if isOwner(resource.data.userId);
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow delete: if false;
    }
    match /chat_messages/{id} {
      allow read: if isSignedIn();   // further restricted by thread ownership in app
      allow write: if false;         // backend writes all messages
    }

    // AI usage: owner read only.
    match /ai_usage/{uid} {
      allow read: if isOwner(uid);
      allow write: if false;
    }

    // Analytics & config: admin only (read), backend writes.
    match /analytics_events/{id} {
      allow read: if hasRole('admin');
      allow write: if false;
    }
    match /platform_config/{id} {
      allow read: if isSignedIn();
      allow write: if false;
    }
  }
}
```

> Keep the rules in version control (`firebase/firestore.rules`) and deploy via the Firebase CLI. The Admin SDK bypasses rules, so business writes go through the API; rules protect against any stray direct client access.

### 5.2 `storage.rules`

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() { return request.auth != null; }
    function isOwnerUidInPath() {
      // paths must be of form <kind>/<uid>/<file>
      return isSignedIn()
        && request.resource.name.split('/')[1] == request.auth.uid;
    }

    match /resumes/{uid}/{fileName} {
      allow read: if true; // URLs are unguessable; tighten if needed
      allow write: if isOwnerUidInPath()
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType == 'application/pdf';
    }
    match /photos/{uid}/{fileName} {
      allow read: if true;
      allow write: if isOwnerUidInPath()
                   && request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/(png|jpeg|webp)');
    }
    match /logos/{uid}/{fileName} {
      allow read: if true;
      allow write: if isOwnerUidInPath()
                   && request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/(png|jpeg|webp)');
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 6. Indexes (`firestore.indexes.json`)

```jsonc
{
  "indexes": [
    { "collectionGroup": "users", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ] },
    { "collectionGroup": "jobs", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "jobs", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "jobType", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "jobs", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "industry", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "jobs", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "employerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "applications", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "studentId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "applications", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "jobId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "applications", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "jobId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "notifications", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "notifications", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "chat_threads", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ] },
    { "collectionGroup": "chat_messages", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "threadId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ] },
    { "collectionGroup": "analytics_events", "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ] }
  ]
}
```

Add array-contains single-field exemptions (auto-created by Firestore) for `jobs.requiredSkills`, `students.searchableSkills`.

---

## 7. Environment Variables

### 7.1 Backend (`backend/.env`)
```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=           # \n escaped; keep quotes
FIREBASE_STORAGE_BUCKET=

GEMINI_API_KEY=
EMAIL_PROVIDER=resend
EMAIL_API_KEY=
EMAIL_FROM="LanTURN <no-reply@lanturn.app>"

CORS_ORIGINS=http://localhost:5173,https://lanturn.vercel.app
UPLOAD_MAX_BYTES=5242880
AI_RATE_LIMIT_PER_DAY=20
```

### 7.2 Frontend (`frontend/.env`)
```bash
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
```

> Frontend values are **public** (they're in the bundle). Only the **backend service-account key** and **Gemini/email keys** are secret.

---

## 8. Local Emulator Setup

`firebase.json`:
```jsonc
{
  "firestore": { "rules": "firebase/firestore.rules", "indexes": "firebase/firestore.indexes.json" },
  "storage":   { "rules": "firebase/storage.rules" },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 },
    "singleProjectMode": true
  }
}
```

Run with `firebase emulators:start`. Point backend env to `FIRESTORE_EMULATOR_HOST=localhost:8080` and `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099` during tests.

---

## 9. Deployment Workflow
1. Configure CLI: `firebase use --add` (alias `dev`, `prod`).
2. Deploy rules/indexes: `firebase deploy --only firestore:rules,firestore:indexes,storage`.
3. Functions are **not** used in v1 (all logic in Express on Render/Oracle) — Firebase is purely data layer + auth + storage.
4. Verify with a smoke test after each deploy.

---

## 10. Checklist
- [ ] Create dev + prod Firebase projects.
- [ ] Enable Auth (Google), Firestore, Storage.
- [ ] Set authorized domains in Auth.
- [ ] Deploy `firestore.rules` + `firestore.indexes.json` + `storage.rules`.
- [ ] Generate backend service account; place in env (not in repo).
- [ ] Wire frontend web config via `VITE_FIREBASE_*`.
- [ ] Set up local emulator + seed scripts.
- [ ] Add budget alerts on the prod project.
