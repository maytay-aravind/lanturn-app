import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

/**
 * Firebase is used for Authentication (Google, Email/Password, Phone).
 * All database and storage operations go through the backend API (Supabase).
 */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Re-export commonly used auth functions so callers can import from one place.
export {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  // Email/Password auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  // Phone auth
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';

