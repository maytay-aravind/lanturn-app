# LanTURN — Frontend Structure

> React + Vite + Tailwind CSS. A **thin client**: renders API data, contains **no business logic**.
> See `BACKEND_STRUCTURE.md` and `API_SPECIFICATION.md`. Match conventions in `CODING_GUIDELINES.md`.

---

## 1. Principles

1. **Backend is the source of truth.** The frontend never computes eligibility, prices, or matches.
2. **Typed API layer.** A single `services/` module owns all HTTP calls. Components never call `fetch` directly.
3. **Feature-based folders** with shared UI primitives. Avoid premature abstraction.
4. **State:** minimal global state (auth + theme + toast). Everything else is server state via React Query (TanStack Query) or local component state.
5. **Routing:** `react-router-dom`. Route guards for auth + role + profile-complete.

---

## 2. Tech Additions (on top of React/Vite/Tailwind)

| Concern | Library | Why |
|---------|---------|-----|
| Server state / data fetching | TanStack Query | Caching, retries, invalidation, loading states. |
| HTTP client | axios or `fetch` wrapper | Consistent base URL, auth header injection, error envelope parsing. |
| Routing | react-router-dom v6 | Nested routes, loaders optional. |
| Forms | react-hook-form + zod | Schema-shared with backend where possible. |
| Firebase client SDK | firebase | Google sign-in + direct Storage uploads. |
| Notifications UI | custom + Firestore `onSnapshot` | Real-time inbox. |
| Toasts | sonner / react-hot-toast | Feedback. |
| Icons | lucide-react | Lightweight. |
| Date utils | date-fns | Formatting. |
| Markdown renderer | (optional) for AI responses | Career chat / resume review. |

> Avoid heavy UI kits. Use Tailwind + a small set of custom components for consistency.

---

## 3. Folder Layout

```
frontend/
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ main.jsx                  # entry: ReactDOM + providers
│  ├─ App.jsx                   # routes + layout shell
│  ├─ index.css                 # Tailwind directives + base styles
│  ├─ config/
│  │  ├─ env.js                 # VITE_API_URL, VITE_FIREBASE_* (validated)
│  │  └─ constants.js           # roles, routes, query keys
│  ├─ firebase/
│  │  └─ client.js              # initialize App (auth, storage) for browser
│  ├─ lib/
│  │  ├─ apiClient.js           # axios/fetch instance: baseURL, auth interceptor, error envelope
│  │  ├─ queryClient.js         # TanStack Query client + defaults
│  │  ├─ queryKeys.js           # centralized query key factories
│  │  ├─ storage.js             # upload helpers (signed URL PUT / Firebase SDK)
│  │  └─ utils.js               # cn(), formatters, debounce
│  ├─ services/                 # one file per resource → calls apiClient
│  │  ├─ auth.service.js
│  │  ├─ student.service.js
│  │  ├─ employer.service.js
│  │  ├─ upload.service.js
│  │  ├─ job.service.js
│  │  ├─ application.service.js
│  │  ├─ notification.service.js
│  │  ├─ ai.service.js
│  │  └─ admin.service.js
│  ├─ hooks/
│  │  ├─ queries/               # TanStack Query hooks
│  │  │  ├─ useJobs.js
│  │  │  ├─ useJob.js
│  │  │  ├─ useMyApplications.js
│  │  │  ├─ useNotifications.js
│  │  │  └─ ...
│  │  │  useAuth.js             # current user + sign-in/out + role
│  │  │  useUpload.js           # sign + PUT + commit
│  │  │  useToast.js
│  │  │  useDebounce.js
│  │  │  useNotificationStream.js  # Firestore onSnapshot listener
│  │  ├─ contexts/
│  │  │  ├─ AuthContext.jsx     # provider exposing useAuth()
│  │  │  └─ ThemeContext.jsx    # light/dark (optional)
│  ├─ components/
│  │  ├─ ui/                    # primitives: Button, Input, Modal, Badge, Spinner, Card, Avatar, EmptyState
│  │  ├─ layout/                # AppShell, Navbar, Sidebar, Footer, RoleSwitcher (dev only)
│  │  ├─ feedback/              # ErrorBoundary, ErrorState, ToastHost
│  │  ├─ job/                   # JobCard, JobFilters, JobList, JobDetailHeader
│  │  ├─ application/           # ApplicationStatusBadge, ApplicantRow, ApplyForm
│  │  ├─ profile/               # StudentProfileForm, EmployerProfileForm, ResumeUploader, PhotoUploader
│  │  ├─ ai/                    # ResumeReviewPanel, MatchScoreRing, ChatMessage, ChatInput, ChatThread
│  │  └─ notification/          # NotificationBell, NotificationItem
│  ├─ pages/
│  │  ├─ public/                # Landing, Login, NotFound
│  │  ├─ onboarding/            # RoleSelect, StudentOnboarding, EmployerOnboarding
│  │  ├─ student/               # StudentDashboard, JobsBrowse, JobDetailStudent, ApplicationsTracker, ProfileStudent, AIAssistant, ResumeReview
│  │  ├─ employer/              # EmployerDashboard, MyJobs, JobForm, Applicants, ApplicantDetail, ProfileEmployer
│  │  ├─ admin/                 # AdminDashboard, AdminUsers, AdminJobs, AdminAnalytics
│  │  └─ shared/                # Settings, NotificationsPage
│  ├─ routes/
│  │  ├─ index.jsx              # route tree
│  │  ├─ guards.jsx             # <RequireAuth/>, <RequireRole/>, <RequireProfileComplete/>
│  │  └─ paths.js               # path constants
│  └─ types/                    # JSDoc/TS types mirroring backend DTOs
├─ tests/                       # vitest + React Testing Library
├─ .env.example
├─ .eslintrc.cjs
├─ .prettierrc
├─ tailwind.config.js
├─ postcss.config.js
├─ vite.config.js
├─ index.html
├─ package.json
└─ README.md
```

---

## 4. Routing Plan

| Path | Component | Guard |
|------|-----------|-------|
| `/` | Landing | public |
| `/login` | Login | public (redirect if authed) |
| `/onboarding` | RoleSelect → Student/Employer | authed + !profileComplete |
| `/student` | StudentDashboard | student + profileComplete |
| `/student/jobs` | JobsBrowse | student |
| `/student/jobs/:jobId` | JobDetailStudent | student |
| `/student/applications` | ApplicationsTracker | student |
| `/student/assistant` | AIAssistant | student |
| `/student/assistant/:threadId` | chat thread | student |
| `/student/profile` | ProfileStudent | student |
| `/employer` | EmployerDashboard | employer |
| `/employer/jobs` | MyJobs | employer |
| `/employer/jobs/new` | JobForm | employer |
| `/employer/jobs/:jobId/edit` | JobForm | employer (owner) |
| `/employer/jobs/:jobId/applicants` | Applicants | employer (owner) |
| `/employer/profile` | ProfileEmployer | employer |
| `/admin` | AdminDashboard | admin |
| `/admin/users` | AdminUsers | admin |
| `/admin/jobs` | AdminJobs | admin |
| `/admin/analytics` | AdminAnalytics | admin |
| `/notifications` | NotificationsPage | authed |
| `/settings` | Settings | authed |
| `*` | NotFound | public |

---

## 5. State Management

- **Server state:** TanStack Query owns all API-derived state (jobs, applications, notifications list). Use `queryKeys` factories for invalidation.
- **Real-time:** `useNotificationStream` subscribes to Firestore `notifications` via `onSnapshot` and updates the bell badge + toast.
- **Auth state:** `AuthContext` holds `{ user, profile, role, status }` from `GET /api/auth/session`. Token is minted via Firebase client SDK and attached to `apiClient` by an interceptor.
- **UI state:** local component state + a tiny toast store. No Redux needed.

---

## 6. Services Layer Pattern

```js
// services/job.service.js
import { apiClient } from '#lib/apiClient';

export const jobService = {
  list: (params) => apiClient.get('/jobs', { params }).then(r => r.data.data),
  get:  (jobId) => apiClient.get(`/jobs/${jobId}`).then(r => r.data.data),
  create: (body) => apiClient.post('/jobs', body).then(r => r.data.data),
  update: (jobId, body) => apiClient.patch(`/jobs/${jobId}`, body).then(r => r.data.data),
  remove: (jobId) => apiClient.delete(`/jobs/${jobId}`).then(r => r.data.data),
};
```

```js
// hooks/queries/useJobs.js
export function useJobs(filters) {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: ({ pageParam }) => jobService.list({ ...filters, cursor: pageParam }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
```

---

## 7. Auth + Token Flow

1. `Login` page → `signInWithPopup(GoogleAuthProvider)` → get `idToken`.
2. Store token in memory (and optionally `sessionStorage`).
3. `apiClient` request interceptor sets `Authorization: Bearer <idToken>`.
4. Response interceptor:
   - On 401 → refresh token via Firebase, retry once; else sign out.
   - On standard error envelope → throw `ApiError(code, message, details)`.
5. On app boot, `AuthProvider` calls `GET /api/auth/session` to hydrate role/profile.

> **Never** put the Firebase ID token in `localStorage` long-term if avoidable; prefer in-memory + `sessionStorage`.

---

## 8. Error & Loading UX

- Global `<ErrorBoundary>` for render crashes.
- Per-query loading/error states with shared `<Spinner/>`, `<ErrorState/>`, `<EmptyState/>`.
- Toasts for mutations (success/failure) via TanStack Query `onSuccess`/`onError`.

---

## 9. Accessibility & i18n Readiness

- Use semantic HTML, labels, `aria-*` on interactive components.
- Keyboard-navigable modals and dropdowns.
- Keep visible strings in a single `constants/labels.js` file to ease future i18n.

---

## 10. Environment Variables (`.env.example`)

```bash
VITE_API_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
```

---

## 11. Build & Deploy

- `npm run dev` (Vite dev server on :5173)
- `npm run build` → `dist/`
- Deploy `dist/` to **Vercel** (Git integration). Set env vars in the Vercel dashboard. Configure SPA fallback rewrite (`/.* → /index.html`).

---

## 12. Keep-It-Tidy Rules

- Components < ~250 lines; split when growing.
- No business logic in components (e.g., don't compute match scores client-side).
- One service file per resource; never duplicate endpoint URLs.
- Co-locate tests next to components (`*.test.jsx`).
- Use `cn()` utility for conditional classes; no inline Tailwind hacks beyond simple conditionals.
