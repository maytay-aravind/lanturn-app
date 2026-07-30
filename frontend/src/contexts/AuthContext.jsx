import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  googleProvider,
} from '../firebase/client.js';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
    setSession(null);
    setFirebaseUser(null);
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
