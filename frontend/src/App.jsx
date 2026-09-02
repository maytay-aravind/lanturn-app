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

// Skeleton shell shown while lazy page chunks load
function PageLoader() {
  return (
    <div className="space-y-6 animate-pulse" style={{ minHeight: '60vh' }}>
      {/* Heading skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-56 bg-white/50 rounded-lg" />
        <div className="h-4 w-80 bg-white/40 rounded-lg" />
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/60 rounded-lg p-5 space-y-3 border border-white/30">
            <div className="h-10 w-10 bg-white/40 rounded-lg" />
            <div className="h-3 w-20 bg-white/30 rounded" />
            <div className="h-6 w-16 bg-white/40 rounded" />
          </div>
        ))}
      </div>
      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/60 rounded-lg p-6 space-y-4 border border-white/30">
          <div className="h-4 w-40 bg-white/40 rounded" />
          <div className="h-28 w-full bg-white/30 rounded-lg" />
        </div>
        <div className="bg-white/60 rounded-lg p-6 space-y-4 border border-white/30">
          <div className="h-4 w-36 bg-white/40 rounded" />
          <div className="h-28 w-full bg-white/30 rounded-lg" />
        </div>
      </div>
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