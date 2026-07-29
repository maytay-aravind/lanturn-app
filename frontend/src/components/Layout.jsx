import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const PUBLIC_PATHS = ['/login', '/onboarding'];

export default function Layout() {
  const { firebaseUser } = useAuth();
  const location = useLocation();
  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Only show navbar when logged in and past onboarding */}
      {firebaseUser && !isPublic && <Navbar />}
      <main className={firebaseUser && !isPublic ? 'pt-14' : ''}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}