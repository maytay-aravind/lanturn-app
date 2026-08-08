import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { RequireAuth, RequireOnboarded, RequireRole } from './hooks/useAuth.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';

import StudentDashboard from './pages/student/DashboardPage.jsx';
import JobsPage from './pages/student/JobsPage.jsx';
import JobSearchPage from './pages/student/JobSearchPage.jsx';
import ApplicationsPage from './pages/student/ApplicationsPage.jsx';
import StudentProfilePage from './pages/student/ProfilePage.jsx';
import AIAssistantPage from './pages/student/AIAssistantPage.jsx';
import NotificationsPage from './pages/student/NotificationsPage.jsx';
import CareerAIslePage from './pages/student/CareerAIslePage.jsx';

// Employer pages
import EmployerDashboard from './pages/employer/DashboardPage.jsx';
import EmployerJobsPage from './pages/employer/JobsPage.jsx';
import JobApplicantsPage from './pages/employer/JobApplicantsPage.jsx';
import EmployerProfilePage from './pages/employer/ProfilePage.jsx';
import EmployerNotificationsPage from './pages/employer/NotificationsPage.jsx';
import AIHiringAssistantPage from './pages/employer/AIHiringAssistantPage.jsx';

// Admin
import AdminPage from './pages/admin/AdminPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />

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
  );
}