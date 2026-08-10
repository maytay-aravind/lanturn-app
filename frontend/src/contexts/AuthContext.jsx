import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from '../firebase/client.js';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const s = await authService.session();
          setSession(s);
        } catch (err) {
          // backend may be unreachable — keep firebase user, no session
          console.error('Failed to fetch session:', err);
          setSession(null);
        }
      } else {
        setSession(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // Immediately fetch the backend session after a successful Google sign-in
    // so that state is populated before the onAuthStateChanged listener fires.
    // Return { user, session } so the caller (LoginPage) can make explicit
    // routing decisions based on the session (sign-in vs sign-up mode).
    let resolvedSession = null;
    try {
      const s = await authService.session();
      setSession(s);
      resolvedSession = s;
    } catch (err) {
      // Non-fatal: onAuthStateChanged will retry. Log for debugging.
      console.warn('Immediate post-login session fetch failed (will retry):', err);
    }
    return { user: result.user, session: resolvedSession };
  }, []);

  // ── Email/Password Auth ─────────────────────────────────────────────────

  const loginWithEmail = useCallback(async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    let resolvedSession = null;
    try {
      const s = await authService.session();
      setSession(s);
      resolvedSession = s;
    } catch (err) {
      console.warn('Post email-login session fetch failed (will retry):', err);
    }
    return { user: result.user, session: resolvedSession };
  }, []);

  const registerWithEmail = useCallback(async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    let resolvedSession = null;
    try {
      const s = await authService.session();
      setSession(s);
      resolvedSession = s;
    } catch (err) {
      console.warn('Post email-register session fetch failed (will retry):', err);
    }
    return { user: result.user, session: resolvedSession };
  }, []);

  // ── Phone Auth ──────────────────────────────────────────────────────────

  /**
   * Initialise (or re-use) an invisible reCAPTCHA verifier.
   * Call this before requestPhoneOtp. The container element must exist in the DOM.
   */
  const setupRecaptcha = useCallback((containerId) => {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => { /* reCAPTCHA solved */ },
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  }, []);

  /**
   * Send an OTP to the given phone number.
   * Returns a ConfirmationResult that the caller stores and passes to verifyPhoneOtp.
   */
  const requestPhoneOtp = useCallback(async (phoneNumber, appVerifier) => {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  }, []);

  /**
   * Verify the OTP code. If valid, the user is signed in via Firebase and we
   * immediately fetch the backend session (same pattern as Google/email auth).
   */
  const verifyPhoneOtp = useCallback(async (confirmationResult, otp) => {
    const result = await confirmationResult.confirm(otp);
    // Clean up the reCAPTCHA verifier so a fresh one is created next time
    recaptchaVerifierRef.current = null;
    let resolvedSession = null;
    try {
      const s = await authService.session();
      setSession(s);
      resolvedSession = s;
    } catch (err) {
      console.warn('Post phone-login session fetch failed (will retry):', err);
    }
    return { user: result.user, session: resolvedSession };
  }, []);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
    setSession(null);
    setFirebaseUser(null);
    recaptchaVerifierRef.current = null;
  }, []);

  const refreshSession = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const s = await authService.session();
      setSession(s);
    } catch (err) {
      console.error('Failed to refresh session:', err);
    }
  }, [firebaseUser]);

  const value = {
    firebaseUser,
    session,
    loading,
    role: session?.role ?? null,
    // isOnboarded: a user is considered onboarded when they have chosen a role
    // AND completed their profile. Previously this used `status === 'active'`
    // which is true for ALL users (even brand-new stubs), causing existing
    // users to be routed to /onboarding and getting "Role already chosen" errors.
    isOnboarded: !!(session?.role && session?.profileComplete),
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    setupRecaptcha,
    requestPhoneOtp,
    verifyPhoneOtp,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

