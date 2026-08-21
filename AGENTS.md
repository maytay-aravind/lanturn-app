# AGENTS.md — LanTURN

## Repo Structure

This is a monorepo with two independent projects:

- **`backend/`** — Node.js + Express + Firebase Admin + Supabase. Entry: `src/server.js`. Routes → controllers → services → repositories/clients.
- **`frontend/`** — React 18 + Vite + Tailwind CSS. Entry: `src/main.jsx`. Uses Firebase Auth client-side, React Query for data fetching.
- **`docs/`** — Architecture, schema, and planning docs.
- **`free-claude-code/`** — Nested git repo (separate project). Has its own `AGENTS.md` and `CLAUDE.md`. Ignore it for LanTURN work.

## Quick Start (Local Dev)

```bash
# 1. Start Firebase emulators (from repo root)
firebase emulators:start

# 2. In separate terminals:
cd backend && cp .env.example .env && npm install && npm run seed && npm run dev
cd frontend && cp .env.example .env && npm install && npm run dev
```

Or on Windows: run `start-dev.bat` from the repo root.

- Backend API: `http://localhost:8080/api`
- Frontend dev server: `http://localhost:5173`
- Health check: `http://localhost:8080/api/health`

## Ports & Services

| Service | Port | Notes |
|---------|------|-------|
| Backend API | 8080 | Configurable via `PORT` in `backend/.env` |
| Frontend Vite | 5173 | |
| Firestore Emulator | 8081 | |
| Auth Emulator | 9099 | |
| Storage Emulator | 9199 | |

## Environment Setup

- **Backend**: Copy `backend/.env.example` → `backend/.env`. Emulator defaults work out of the box.
- **Frontend**: Copy `frontend/.env.example` → `frontend/.env`. Set `VITE_USE_FIREBASE_EMULATOR=true` for local dev.
- Firebase Auth emulator is required. Tokens are minted via the frontend or `firebase auth:print-access-token <uid>`.

## Key Commands

| Command | Where | What |
|---------|-------|------|
| `npm run dev` | `backend/` | Start backend with `--watch` (auto-restart) |
| `npm run dev` | `frontend/` | Start Vite dev server |
| `npm run seed` | `backend/` | Populate demo users and data |
| `npm run lint` | `backend/` or `frontend/` | ESLint |
| `npm run build` | `frontend/` | Production build |
| `npm test` | `backend/` | Node.js built-in test runner (`node --test tests/`) |
| `firebase emulators:start` | root | Start all emulators |

## Backend Layering

Follow this call chain: **routes → controllers → services → repositories/clients**.

- `src/config/env.js` — Zod-validated env vars (custom `.env` loader, no dotenv dep).
- `src/firebase/` — Firebase Admin SDK init.
- `src/supabase/` — Supabase client init (database + storage).
- Subpath imports via `#config`, `#services/*`, `#repositories/*`, etc. (see `package.json` `imports` field).

## Auth Model

Every protected route expects `Authorization: Bearer <firebase-id-token>`. Backend verifies via Admin SDK and loads user role/profile. Three roles: Student, Employer, Admin.

## Frontend Stack

- React 18 + React Router v6 + React Query (TanStack)
- Tailwind CSS + PostCSS
- Firebase Auth (client SDK) — switchable to emulator via `VITE_USE_FIREBASE_EMULATOR`
- Framer Motion for animations
- Deployed on Vercel (see `vercel.json` SPA rewrite)

## Gotchas

- Backend `.env` is gitignored. Always copy from `.env.example`.
- The `free-claude-code/` subfolder is a separate git repo — do not mix changes.
- Backend uses ES modules (`"type": "module"`). No CommonJS `require()`.
- Firebase emulator tokens expire. Re-auth via frontend or CLI as needed.
- The `cors.json` at root is for Firebase Storage CORS configuration (apply with `gsutil`).
