import { auth } from '#firebase';
import { supabase } from '#supabase';
import { AppError } from '#utils/httpErrors.js';
import { USER_STATUS } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('auth');

/**
 * Verify the Firebase ID token from the Authorization header.
 * Token verification uses Firebase Admin (Google Auth stays).
 * User role/status lookup uses Supabase PostgreSQL.
 * If valid, attaches req.user = { uid, email, role, profileComplete, status }.
 */
export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthenticated());
  }
  const idToken = header.slice(7);

  try {
    // Step 1: Verify Firebase ID token (Google Auth)
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Step 2: Load user record from Supabase PostgreSQL
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .maybeSingle();

    if (error) throw error;

    // Step 3: First login — create stub user record in Supabase
    if (!userData) {
      const stub = {
        uid,
        email: decoded.email?.toLowerCase() || '',
        email_verified: decoded.email_verified || false,
        display_name: decoded.name || '',
        photo_url: decoded.picture || '',
        auth_provider: decoded.firebase?.sign_in_provider || 'google.com',
        role: null,
        profile_complete: false,
        status: USER_STATUS.ACTIVE,
      };
      const { error: insertErr } = await supabase.from('users').insert(stub);
      if (insertErr) throw insertErr;
      req.user = {
        uid,
        email: stub.email,
        displayName: stub.display_name,
        photoURL: stub.photo_url,
        role: null,
        profileComplete: false,
        status: USER_STATUS.ACTIVE,
      };
    } else {
      if (userData.status === USER_STATUS.DISABLED) {
        return next(AppError.forbidden('Account is disabled'));
      }
      req.user = {
        uid,
        email: userData.email,
        emailVerified: userData.email_verified,
        displayName: userData.display_name,
        photoURL: userData.photo_url,
        role: userData.role,
        profileComplete: userData.profile_complete,
        status: userData.status,
      };
    }

    next();
  } catch (err) {
    log.warn({ err }, 'Token verification failed');
    next(AppError.unauthenticated());
  }
}
