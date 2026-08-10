import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Sparkles, Loader2, Mail, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const {
    loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword,
    setupRecaptcha, requestPhoneOtp, verifyPhoneOtp,
    logout, firebaseUser, role, isOnboarded, loading,
  } = useAuth();
  const navigate = useNavigate();

  const [signingIn, setSigningIn] = useState(false);
  const [mode, setMode] = useState('signin');           // 'signin' | 'signup'
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const confirmationRef = useRef(null);

  // ── Redirect authenticated users ──────────────────────────────────────
  useEffect(() => {
    if (!loading && firebaseUser && !signingIn) {
      if (isOnboarded && role) {
        if (role === 'student')       navigate('/dashboard',           { replace: true });
        else if (role === 'employer') navigate('/employer/dashboard',  { replace: true });
        else if (role === 'admin')    navigate('/admin',               { replace: true });
      }
    }
  }, [loading, firebaseUser, role, isOnboarded, navigate, signingIn]);

  // Reset form when switching modes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setOtp('');
    setOtpSent(false);
    confirmationRef.current = null;
  }, [mode, authMethod]);

  // ── Helpers ────────────────────────────────────────────────────────────
  function mapFirebaseError(err) {
    const map = {
      'auth/user-not-found':          'No account found with this email.',
      'auth/wrong-password':          'Incorrect password.',
      'auth/invalid-credential':      'Invalid email or password.',
      'auth/email-already-in-use':    'This email is already registered. Try signing in.',
      'auth/weak-password':           'Password must be at least 6 characters.',
      'auth/invalid-email':           'Please enter a valid email address.',
      'auth/too-many-requests':       'Too many attempts. Please try again later.',
      'auth/invalid-phone-number':    'Please enter a valid phone number (e.g. +91…).',
      'auth/invalid-verification-code': 'Invalid OTP code. Please try again.',
      'auth/code-expired':            'OTP has expired. Please request a new one.',
      'auth/operation-not-allowed':   'SMS is not available for this region. Please contact the admin or use email sign-in.',
      'auth/popup-closed-by-user':    null, // silent
      'auth/cancelled-popup-request': null, // silent
    };
    return map[err.code] ?? (err.code?.startsWith('auth/') ? 'Authentication failed. Please try again.' : null);
  }

  // ── Google handlers (unchanged logic) ─────────────────────────────────
  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      const { session } = await loginWithGoogle();
      if (!session?.role) {
        toast.error('No account found. Please sign up first.');
        await logout();
        return;
      }
      toast.success('Welcome back!');
    } catch (err) {
      const msg = mapFirebaseError(err);
      if (msg === null) return;
      toast.error(msg || 'Something went wrong. Please try again.');
      console.error('Sign-in error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setSigningIn(true);
    try {
      const { session } = await loginWithGoogle();
      if (session?.role) {
        toast.success('You already have an account! Taking you to your dashboard.');
        return;
      }
      navigate('/onboarding', { replace: true });
    } catch (err) {
      const msg = mapFirebaseError(err);
      if (msg === null) return;
      toast.error(msg || 'Something went wrong. Please try again.');
      console.error('Sign-up error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  // ── Forgot Password handler ───────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address to reset password.');
      return;
    }
    setSigningIn(true);
    try {
      await resetPassword(email);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      const msg = mapFirebaseError(err);
      if (msg === null) return;
      toast.error(msg || 'Failed to send password reset email. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  // ── Email handlers ────────────────────────────────────────────────────
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter both email and password.');
    setSigningIn(true);
    try {
      const { session } = await loginWithEmail(email, password);
      if (!session?.role) {
        toast.error('No account found. Please sign up first.');
        await logout();
        return;
      }
      toast.success('Welcome back!');
    } catch (err) {
      const msg = mapFirebaseError(err);
      if (msg === null) return;
      toast.error(msg || 'Sign-in failed. Please try again.');
      console.error('Email sign-in error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter both email and password.');
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');
    setSigningIn(true);
    try {
      const { session } = await registerWithEmail(email, password);
      if (session?.role) {
        toast.success('You already have an account! Taking you to your dashboard.');
        return;
      }
      navigate('/onboarding', { replace: true });
    } catch (err) {
      const msg = mapFirebaseError(err);
      if (msg === null) return;
      toast.error(msg || 'Sign-up failed. Please try again.');
      console.error('Email sign-up error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  // ── Phone handlers ────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return toast.error('Please enter your phone number.');
    if (!/^\+\d{10,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
      return toast.error('Enter a valid phone number with country code (e.g. +91XXXXXXXXXX).');
    }
    setSigningIn(true);
    try {
      const appVerifier = setupRecaptcha('recaptcha-container');
      const confirmation = await requestPhoneOtp(phoneNumber, appVerifier);
      confirmationRef.current = confirmation;
      setOtpSent(true);
      toast.success('OTP sent! Check your phone.');
    } catch (err) {
      const msg = mapFirebaseError(err);
      if (msg === null) return;
      toast.error(msg || 'Failed to send OTP. Please try again.');
      console.error('OTP send error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP code.');
    setSigningIn(true);
    try {
      const { session } = await verifyPhoneOtp(confirmationRef.current, otp);

      if (mode === 'signin') {
        if (!session?.role) {
          toast.error('No account found. Please sign up first.');
          await logout();
          return;
        }
        toast.success('Welcome back!');
      } else {
        // signup
        if (session?.role) {
          toast.success('You already have an account! Taking you to your dashboard.');
          return;
        }
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      const msg = mapFirebaseError(err);
      if (msg === null) return;
      toast.error(msg || 'OTP verification failed. Please try again.');
      console.error('OTP verify error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex items-center justify-center min-h-[85vh]">
      <div className="w-full max-w-md">

        {/* Logo + brand */}
        <div className="text-center mb-8 animate-fade-in">
          <img src="/logo.jpeg" alt="LanTURN Logo" className="mx-auto h-32 w-auto object-contain mix-blend-multiply keep-color" style={{ imageRendering: '-webkit-optimize-contrast', clipPath: 'inset(8%)', margin: '-10px 0' }} />
          <h1 className="text-3xl font-extrabold gradient-text mt-4 mb-2 tracking-tight">LanTURN</h1>
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

          {/* Heading */}
          <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-slate-500 mb-6 text-center">
            {mode === 'signin'
              ? 'Sign in to continue to your dashboard'
              : 'Join lanTURN to kick-start your career journey'}
          </p>

          {/* Google button */}
          <button
            id={mode === 'signin' ? 'btn-google-signin' : 'btn-google-signup'}
            onClick={mode === 'signin' ? handleGoogleSignIn : handleGoogleSignUp}
            disabled={signingIn}
            className={`w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
                       transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
              mode === 'signin'
                ? 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:ring-slate-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {signingIn && authMethod === 'email' ? null : (
              signingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleLogo white={mode === 'signup'} />
            )}
            {mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
          </button>

          {/* OR divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Email / Phone toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200 mb-5 p-0.5 bg-slate-50 gap-0.5">
            <button
              id="toggle-email"
              onClick={() => setAuthMethod('email')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
                authMethod === 'email'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </button>
            <button
              id="toggle-phone"
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${
                authMethod === 'phone'
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              Phone
            </button>
          </div>

          {/* ── Email form ─────────────────────────────────────────── */}
          {authMethod === 'email' && (
            <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-slate-700 mb-1">
                  Email address
                </label>
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900
                             placeholder:text-slate-400 outline-none
                             focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                             transition-all duration-200"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password-input" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password (min. 6 chars)'}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900
                               placeholder:text-slate-400 outline-none
                               focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                               transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
              <button
                id={mode === 'signin' ? 'btn-email-signin' : 'btn-email-signup'}
                type="submit"
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold
                           bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]
                           transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Phone form ─────────────────────────────────────────── */}
          {authMethod === 'phone' && (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label htmlFor="phone-input" className="block text-sm font-medium text-slate-700 mb-1">
                      Phone number
                    </label>
                    <input
                      id="phone-input"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900
                                 placeholder:text-slate-400 outline-none
                                 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                                 transition-all duration-200"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">Include country code (e.g. +91 for India)</p>
                  </div>
                  <button
                    id="btn-send-otp"
                    type="submit"
                    disabled={signingIn}
                    className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold
                               bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]
                               transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signingIn ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label htmlFor="otp-input" className="block text-sm font-medium text-slate-700 mb-1">
                      Enter OTP
                    </label>
                    <input
                      id="otp-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900
                                 placeholder:text-slate-400 outline-none text-center tracking-[0.3em] font-mono text-lg
                                 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                                 transition-all duration-200"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">
                      Code sent to <span className="font-medium text-slate-600">{phoneNumber}</span>
                      {' · '}
                      <button
                        type="button"
                        onClick={() => { setOtpSent(false); setOtp(''); confirmationRef.current = null; }}
                        className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                      >
                        Change number
                      </button>
                    </p>
                  </div>
                  <button
                    id="btn-verify-otp"
                    type="submit"
                    disabled={signingIn}
                    className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold
                               bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]
                               transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signingIn ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Verify & {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Invisible reCAPTCHA container — required by Firebase Phone Auth */}
          <div id="recaptcha-container" />

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