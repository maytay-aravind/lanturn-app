import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { RequireAuth, RequireOnboarded, RequireRole } from './hooks/useAuth.jsx';

// Eager-load: login page (first thing users see)
import LoginPage from './pages/LoginPage.jsx';

// Lazy-load everything else — each becomes its own chunk
const OnboardingPage = lazy(() => import('./pages/OnboardingPage.jsx'));
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));

const StudentDashboard = lazy(() => import('./pages/student/DashboardPage.jsx'));
const JobsPage = lazy(() => import('./pages/student/JobsPage.jsx'));
const ApplicationsPage = lazy(() => import('./pages/student/ApplicationsPage.jsx'));
const StudentProfilePage = lazy(() => import('./pages/student/ProfilePage.jsx'));
const AIAssistantPage = lazy(() => import('./pages/student/AIAssistantPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/student/NotificationsPage.jsx'));
const CareerAIslePage = lazy(() => import('./pages/student/CareerAIslePage.jsx'));

const EmployerDashboard = lazy(() => import('./pages/employer/DashboardPage.jsx'));
const EmployerJobsPage = lazy(() => import('./pages/employer/JobsPage.jsx'));
const JobApplicantsPage = lazy(() => import('./pages/employer/JobApplicantsPage.jsx'));
const EmployerProfilePage = lazy(() => import('./pages/employer/ProfilePage.jsx'));
const EmployerNotificationsPage = lazy(() => import('./pages/employer/NotificationsPage.jsx'));
const AIHiringAssistantPage = lazy(() => import('./pages/employer/AIHiringAssistantPage.jsx'));

const AdminPage = lazy(() => import('./pages/admin/AdminPage.jsx'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));

// Deepam (South Indian oil lamp) loader — flame flickers while page loads
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: '60vh' }}>
      <svg width="64" height="80" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="deepam-loader">
        {/* Warm glow behind flame */}
        <circle cx="32" cy="28" r="18" fill="#FFC107" opacity="0.25" className="deepam-glow" />

        {/* Flame — outer orange */}
        <path
          d="M32 6 C28 16, 22 22, 22 30 C22 36, 26 40, 32 40 C38 40, 42 36, 42 30 C42 22, 36 16, 32 6Z"
          fill="#FF9800"
          className="deepam-flame"
        />
        {/* Flame — inner yellow */}
        <path
          d="M32 14 C30 20, 26 24, 26 30 C26 34, 28 37, 32 37 C36 37, 38 34, 38 30 C38 24, 34 20, 32 14Z"
          fill="#FFC107"
          className="deepam-flame-inner"
        />
        {/* Flame — core white */}
        <ellipse cx="32" cy="32" rx="3" ry="5" fill="#FFF8E1" opacity="0.9" />

        {/* Wick */}
        <rect x="31" y="38" width="2" height="4" rx="1" fill="#5D4037" />

        {/* Oil bowl */}
        <ellipse cx="32" cy="46" rx="14" ry="4" fill="#880E4F" />
        <ellipse cx="32" cy="45" rx="12" ry="3" fill="#AD1457" />
        <ellipse cx="32" cy="44" rx="10" ry="2" fill="#C2185B" />

        {/* Stand / base */}
        <path d="M28 50 L24 68 L40 68 L36 50Z" fill="#880E4F" />
        <ellipse cx="32" cy="68" rx="12" ry="3" fill="#6A1B4D" />
        <ellipse cx="32" cy="67" rx="10" ry="2.5" fill="#880E4F" />

        {/* Decorative dots on bowl */}
        <circle cx="24" cy="44" r="1" fill="#FFC107" opacity="0.6" />
        <circle cx="32" cy="42" r="1" fill="#FFC107" opacity="0.6" />
        <circle cx="40" cy="44" r="1" fill="#FFC107" opacity="0.6" />
      </svg>

      <p className="text-sm font-semibold text-brand-600 tracking-wide animate-pulse">Lighting the path…</p>

      <style>{`
        .deepam-flame {
          transform-origin: 32px 40px;
          animation: flameFlicker 0.8s ease-in-out infinite alternate;
        }
        .deepam-flame-inner {
          transform-origin: 32px 37px;
          animation: flameFlicker 0.6s ease-in-out 0.1s infinite alternate;
        }
        .deepam-glow {
          animation: glowPulse 1.2s ease-in-out infinite alternate;
        }
        @keyframes flameFlicker {
          0%   { transform: scaleX(1) scaleY(1); opacity: 1; }
          25%  { transform: scaleX(0.92) scaleY(1.04); opacity: 0.9; }
          50%  { transform: scaleX(1.05) scaleY(0.96); opacity: 1; }
          75%  { transform: scaleX(0.95) scaleY(1.06); opacity: 0.85; }
          100% { transform: scaleX(1.02) scaleY(0.98); opacity: 0.95; }
        }
        @keyframes glowPulse {
          0%   { r: 16; opacity: 0.2; }
          50%  { r: 22; opacity: 0.35; }
          100% { r: 18; opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

        {/* Auth required */}
        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>} />

          {/* Onboarded users only */}
          <Route element={<RequireOnboarded />}>
            {/* Student routes */}
            <Route element={<RequireRole roles={['student']}>
              <Outlet />
            </RequireRole>}>
              <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><StudentDashboard /></Suspense>} />
              <Route path="/jobs" element={<Suspense fallback={<PageLoader />}><JobsPage /></Suspense>} />
              <Route path="/job-search" element={<Navigate to="/jobs" replace />} />
              <Route path="/applications" element={<Suspense fallback={<PageLoader />}><ApplicationsPage /></Suspense>} />
              <Route path="/profile" element={<Suspense fallback={<PageLoader />}><StudentProfilePage /></Suspense>} />
              <Route path="/ai" element={<Suspense fallback={<PageLoader />}><AIAssistantPage /></Suspense>} />
              <Route path="/career-aisle" element={<Suspense fallback={<PageLoader />}><CareerAIslePage /></Suspense>} />
              <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense>} />
            </Route>

            {/* Employer routes */}
            <Route element={<RequireRole roles={['employer']}>
              <Outlet />
            </RequireRole>}>
              <Route path="/employer/dashboard" element={<Suspense fallback={<PageLoader />}><EmployerDashboard /></Suspense>} />
              <Route path="/employer/jobs" element={<Suspense fallback={<PageLoader />}><EmployerJobsPage /></Suspense>} />
              <Route path="/employer/jobs/:jobId/applicants" element={<Suspense fallback={<PageLoader />}><JobApplicantsPage /></Suspense>} />
              <Route path="/employer/ai-assistant" element={<Suspense fallback={<PageLoader />}><AIHiringAssistantPage /></Suspense>} />
              <Route path="/employer/profile" element={<Suspense fallback={<PageLoader />}><EmployerProfilePage /></Suspense>} />
              <Route path="/employer/notifications" element={<Suspense fallback={<PageLoader />}><EmployerNotificationsPage /></Suspense>} />
            </Route>

            {/* Admin routes */}
            <Route element={<RequireRole roles={['admin']}>
              <Outlet />
            </RequireRole>}>
              <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Landing page (outside Layout — has its own nav/footer) */}
      <Route path="/" element={<Suspense fallback={<PageLoader />}><LandingPage /></Suspense>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}