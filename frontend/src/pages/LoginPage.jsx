import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, firebaseUser, role, isOnboarded, loading } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && firebaseUser) {
      if (!isOnboarded || !role) {
        navigate('/onboarding', { replace: true });
      } else if (role === 'student') {
        navigate('/dashboard', { replace: true });
      } else if (role === 'employer') {
        navigate('/employer/dashboard', { replace: true });
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [loading, firebaseUser, role, isOnboarded, navigate]);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in successfully!');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Login failed. Please try again.');
        console.error('Login error:', err);
      }
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh]">
      <div className="w-full max-w-md">
        {/* Logo + brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
               style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text mb-2">lanTURN</h1>
          <p className="text-slate-500 text-sm">AI-powered career platform for students & recruiters</p>
        </div>

        {/* Login card */}
        <div className="card p-8 animate-slide-up">
          <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6 text-center">Sign in to continue to your dashboard</p>

          <button
            onClick={handleGoogleLogin}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
                       bg-white text-slate-700 ring-1 ring-inset ring-slate-200
                       hover:bg-slate-50 hover:ring-slate-300 active:scale-[0.98]
                       transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signingIn ? (
              <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {signingIn ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="divider my-6" />

          <p className="text-xs text-center text-slate-400 leading-relaxed">
            By continuing, you agree to lanTURN's Terms of Service and Privacy Policy.
            <br />
            New users will be guided through onboarding after sign-in.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} lanTURN · Built for placement excellence
        </p>
      </div>
    </div>
  );
}