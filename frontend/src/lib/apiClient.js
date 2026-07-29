import axios from 'axios';
import { auth } from '../firebase/client.js';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:4001/api'),
  headers: { 'Content-Type': 'application/json' },
});

// Attach the Firebase ID token to every request when signed in.
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors into a consistent shape.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const body = error.response?.data;
    const apiError = body?.error || { code: 'NETWORK_ERROR', message: error.message };
    const normalized = new Error(apiError.message || 'Request failed');
    normalized.code = apiError.code;
    normalized.details = apiError.details;
    normalized.status = error.response?.status;
    normalized.handled = true;
    return Promise.reject(normalized);
  }
);

/** Convenience: extract the `.data` payload from the standard envelope. */
export function unwrap(response) {
  return response.data?.data;
}
