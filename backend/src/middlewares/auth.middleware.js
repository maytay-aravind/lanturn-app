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

    // Step 3: First login — create stub user record in Supabase.
    // Use UPSERT with ignoreDuplicates so that concurrent requests for the
    // same new user (race condition) never fail with a unique-key violation.
    // If the row already existed, the upsert is a no-op and we re-fetch it.
    if (!userData) {
      const signInProvider = decoded.firebase?.sign_in_provider || 'unknown';
      const stub = {
        uid,
        email: decoded.email?.toLowerCase() || '',
        email_verified: decoded.email_verified || false,
        display_name: decoded.name || '',
        photo_url: decoded.picture || '',
        auth_provider: signInProvider,
        role: null,
        profile_complete: false,
        status: USER_STATUS.ACTIVE,
      };

      const { data: upserted, error: upsertErr } = await supabase
        .from('users')
        .upsert(stub, { onConflict: 'uid', ignoreDuplicates: true })
        .select()
        .maybeSingle();

      if (upsertErr) {
        log.error({ err: upsertErr, uid }, 'Failed to upsert new user stub');
        throw upsertErr;
      }

      // If ignoreDuplicates silently skipped the insert (row already existed),
      // upserted will be null — fetch the real row so we return accurate data.
      let resolvedUser = upserted;
      if (!resolvedUser) {
        const { data: existing, error: fetchErr } = await supabase
          .from('users')
          .select('*')
          .eq('uid', uid)
          .maybeSingle();
        if (fetchErr) throw fetchErr;
        resolvedUser = existing;
      }

      if (resolvedUser?.status === USER_STATUS.DISABLED) {
        return next(AppError.forbidden('Account is disabled'));
      }

      req.user = {
        uid,
        email:           resolvedUser?.email            ?? stub.email,
        emailVerified:   resolvedUser?.email_verified   ?? stub.email_verified,
        displayName:     resolvedUser?.display_name     ?? stub.display_name,
        photoURL:        resolvedUser?.photo_url        ?? stub.photo_url,
        role:            resolvedUser?.role             ?? null,
        profileComplete: resolvedUser?.profile_complete ?? false,
        status:          resolvedUser?.status           ?? USER_STATUS.ACTIVE,
      };
    } else {
      if (userData.status === USER_STATUS.DISABLED) {
        return next(AppError.forbidden('Account is disabled'));
      }

      // Refresh Google profile fields (display name / photo) if they changed.
      const nameChanged  = decoded.name    && decoded.name    !== userData.display_name;
      const photoChanged = decoded.picture && decoded.picture !== userData.photo_url;
      if (nameChanged || photoChanged) {
        const profileUpdate = {};
        if (nameChanged)  profileUpdate.display_name = decoded.name;
        if (photoChanged) profileUpdate.photo_url    = decoded.picture;
        // Fire-and-forget: don't block the request on this non-critical update.
        supabase.from('users').update(profileUpdate).eq('uid', uid).then(({ error: updErr }) => {
          if (updErr) log.warn({ err: updErr, uid }, 'Failed to refresh Google profile fields');
        });
      }

      req.user = {
        uid,
        email:           userData.email,
        emailVerified:   userData.email_verified,
        displayName:     nameChanged  ? decoded.name    : userData.display_name,
        photoURL:        photoChanged ? decoded.picture : userData.photo_url,
        role:            userData.role,
        profileComplete: userData.profile_complete,
        status:          userData.status,
      };
    }

    next();
  } catch (err) {
    log.warn({ err }, 'Token verification failed');
    next(AppError.unauthenticated());
  }
}
