import { auth, db } from '#firebase';
import { AppError, ERROR_CODES } from '#utils/httpErrors.js';
import { USER_STATUS } from '#config';
import { logger_for } from '#utils/logger.js';

const log = logger_for('auth');

/**
 * Verify the Firebase ID token from the Authorization header.
 * If valid, attach req.user = { uid, email, role, profileComplete, status }.
 */
export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthenticated());
  }
  const idToken = header.slice(7);

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Load user doc from Firestore for role / status.
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // If the user doc doesn't exist yet, create a stub (first login).
    if (!userData) {
      const stub = {
        uid,
        email: decoded.email?.toLowerCase() || '',
        emailVerified: decoded.email_verified || false,
        displayName: decoded.name || '',
        photoURL: decoded.picture || '',
        authProvider: decoded.firebase?.sign_in_provider || 'google.com',
        role: null,
        profileComplete: false,
        status: USER_STATUS.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection('users').doc(uid).set(stub);
      req.user = { ...stub };
    } else {
      if (userData.status === USER_STATUS.DISABLED) {
        return next(AppError.forbidden('Account is disabled'));
      }
      req.user = {
        uid,
        email: userData.email,
        emailVerified: userData.emailVerified,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role,
        profileComplete: userData.profileComplete,
        status: userData.status,
      };
    }
    next();
  } catch (err) {
    log.warn({ err }, 'Token verification failed');
    next(AppError.unauthenticated());
  }
}
