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
const JobSearchPage = lazy(() => import('./pages/student/JobSearchPage.jsx'));
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

// Lightweight spinner shown while lazy chunks load
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
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
                <Route path="/job-search" element={<JobSearchPage />} />
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