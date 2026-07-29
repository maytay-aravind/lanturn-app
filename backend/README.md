# LanTURN Backend

Node.js + Express + Firebase Admin. See `docs/` for the full architecture.

## Prerequisites

- Node.js 18+
- Firebase CLI (for the local emulator): `npm install -g firebase-tools`

## Quick start (local dev with emulator)

```bash
cd backend
cp .env.example .env        # defaults target the emulator
npm install
firebase emulators:start    # from repo root — starts Auth/Firestore/Storage emulators
# in another terminal:
npm run seed                # populate demo data
npm run dev                 # http://localhost:8080/api
```

Health check: <http://localhost:8080/api/health>

## Demo users (after `npm run seed`)

| Role     | UID          | Email                  |
|----------|--------------|------------------------|
| Admin    | demo-admin   | admin@lanturn.dev      |
| Employer | demo-emp-1   | hr@acme.dev            |
| Employer | demo-emp-2   | careers@globex.dev     |
| Student  | demo-stu-1   | asha@lanturn.dev       |
| Student  | demo-stu-2   | rahul@lanturn.dev      |
| Student  | demo-stu-3   | neha@lanturn.dev       |

> In the emulator, mint a dev token with the Firebase CLI:
> `firebase auth:print-access-token demo-stu-1` (when signed in) — or use the
> frontend, which signs in via the Auth emulator.

## Auth model

Every protected route expects `Authorization: Bearer <firebase-id-token>`.
The backend verifies the token via the Admin SDK and loads the user's role/profile.

## Project layout

See `docs/BACKEND_STRUCTURE.md`. Layering: routes → controllers → services → repositories/clients.

## Environment

All configuration is validated in `src/config/env.js`. Copy `.env.example` to `.env`.
Set `GEMINI_API_KEY` to enable AI endpoints (they return 422 otherwise).

## Production

Set `FIREBASE_USE_EMULATOR=false` and provide real `FIREBASE_*` service-account env
vars + `GEMINI_API_KEY`. Deploy to Render/Oracle. See `docs/FIREBASE_SETUP.md` and
`docs/SECURITY.md`.
