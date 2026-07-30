import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, logout, firebaseUser, role, isOnboarded, loading } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'

  // Redirect users who arrive at /login while already authenticated (e.g. page
  // refresh). The signingIn guard prevents this from firing mid-handler while
  // Firebase / session state is still transitioning after a fresh sign-in.
  useEffect(() => {
    if (!loading && firebaseUser && !signingIn) {
      if (isOnboarded && role) {
        if (role === 'student')       navigate('/dashboard',           { replace: true });
        else if (role === 'employer') navigate('/employer/dashboard',  { replace: true });
        else if (role === 'admin')    navigate('/admin',               { replace: true });
      }
      // NOTE: do NOT auto-redirect to /onboarding here.
      // New users are sent there explicitly inside handleSignUp.
    }
  }, [loading, firebaseUser, role, isOnboarded, navigate, signingIn]);

  // ── SIGN IN ──────────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      const { session } = await loginWithGoogle();

      if (!session?.role) {
        // Google auth succeeded but no lanTURN account exists for this user.
        toast.error('No account found. Please sign up first.');
        // Clean up the Firebase session so the app returns to a logged-out state.
        await logout();
        return;
      }

      toast.success('Welcome back!');
      // useEffect fires when signingIn becomes false → redirects to dashboard.
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      if (err.code?.startsWith('auth/')) {
        toast.error('Google sign-in failed. Please try again.');
        console.error('Firebase auth error:', err.code, err.message);
        return;
      }
      toast.error('Something went wrong. Please try again.');
      console.error('Sign-in error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  // ── SIGN UP ──────────────────────────────────────────────────────────────
  const handleSignUp = async () => {
    setSigningIn(true);
    try {
      const { session } = await loginWithGoogle();

      if (session?.role) {
        // This Google account is already registered on lanTURN.
        toast.success('You already have an account! Taking you to your dashboard.');
        // useEffect handles the redirect once signingIn becomes false.
        return;
      }

      // Genuinely new user — send to onboarding.
      navigate('/onboarding', { replace: true });
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      if (err.code?.startsWith('auth/')) {
        toast.error('Google sign-up failed. Please try again.');
        console.error('Firebase auth error:', err.code, err.message);
        return;
      }
      toast.error('Something went wrong. Please try again.');
      console.error('Sign-up error:', err);
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
          <div
            className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
          >
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold gradient-text mb-2">lanTURN</h1>
          <p className="text-slate-500 text-sm">AI-powered career platform for students &amp; recruiters</p>
        </div>

        {/* Card */}
        <div className="card p-8 animate-slide-up">

          {/* Sign In / Sign Up tab toggle */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-6 p-1 bg-slate-50 gap-1">
            <button
              id="tab-signin"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === 'signin'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-signup"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Heading + action button — switches by mode */}
          {mode === 'signin' ? (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">Welcome back</h2>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Sign in to continue to your dashboard
              </p>
              <button
                id="btn-google-signin"
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
                           bg-white text-slate-700 ring-1 ring-inset ring-slate-200
                           hover:bg-slate-50 hover:ring-slate-300 active:scale-[0.98]
                           transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingIn ? <Loader2 className="h-5 w-5 animate-spin text-brand-600" /> : <GoogleLogo />}
                {signingIn ? 'Signing in\u2026' : 'Continue with Google'}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">Create your account</h2>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Join lanTURN to kick-start your career journey
              </p>
              <button
                id="btn-google-signup"
                onClick={handleSignUp}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
                           bg-indigo-600 text-white
                           hover:bg-indigo-700 active:scale-[0.98]
                           transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingIn ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <GoogleLogo white />}
                {signingIn ? 'Creating account\u2026' : 'Sign up with Google'}
              </button>
            </>
          )}

          <div className="divider my-6" />

          <p className="text-xs text-center text-slate-400 leading-relaxed">
            By continuing, you agree to lanTURN's Terms of Service and Privacy Policy.
            {mode === 'signup' && (
              <><br />New users will be guided through a short onboarding after sign-up.</>
            )}
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; {new Date().getFullYear()} lanTURN &middot; Built for placement excellence
        </p>
      </div>
    </div>
  );
}

/** Google "G" logo — coloured by default, or all-white for filled buttons */
function GoogleLogo({ white = false }) {
  const c = white ? '#ffffff' : null;
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill={c ?? '#4285F4'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill={c ?? '#34A853'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill={c ?? '#FBBC05'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill={c ?? '#EA4335'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}