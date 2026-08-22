import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { RequireAuth, RequireOnboarded, RequireRole } from './hooks/useAuth.jsx';

// Eager-load: login page (first thing users see)
import LoginPage from './pages/LoginPage.jsx';

// Lazy-load everything else — each becomes its own chunk
const OnboardingPage = lazy(() => import('./pages/OnboardingPage.jsx'));

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
    <div className="space-y-6 animate-pulse">
      {/* Heading skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-56 bg-slate-200 rounded-lg" />
        <div className="h-4 w-80 bg-slate-100 rounded-lg" />
      </div>
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <div className="h-10 w-10 bg-slate-100 rounded-xl" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-6 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-28 w-full bg-slate-50 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-28 w-full bg-slate-50 rounded-xl" />
        </div>
      </div>
      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-100 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-slate-200 rounded" />
              <div className="h-3 w-32 bg-slate-100 rounded" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />

          {/* Auth required */}
          <Route element={<RequireAuth />}>
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Onboarded users only */}
            <Route element={<RequireOnboarded />}>
              {/* Student routes */}
              <Route element={<RequireRole roles={['student']}>
                <Outlet />
              </RequireRole>}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/job-search" element={<Navigate to="/jobs" replace />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/profile" element={<StudentProfilePage />} />
                <Route path="/ai" element={<AIAssistantPage />} />
                <Route path="/career-aisle" element={<CareerAIslePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>

              {/* Employer routes */}
              <Route element={<RequireRole roles={['employer']}>
                <Outlet />
              </RequireRole>}>
                <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                <Route path="/employer/jobs" element={<EmployerJobsPage />} />
                <Route path="/employer/jobs/:jobId/applicants" element={<JobApplicantsPage />} />
                <Route path="/employer/ai-assistant" element={<AIHiringAssistantPage />} />
                <Route path="/employer/profile" element={<EmployerProfilePage />} />
                <Route path="/employer/notifications" element={<EmployerNotificationsPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<RequireRole roles={['admin']}>
                <Outlet />
              </RequireRole>}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}