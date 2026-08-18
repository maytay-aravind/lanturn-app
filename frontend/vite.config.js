import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // Split vendors into cacheable chunks — browser loads only what's needed
    rollupOptions: {
      output: {
        manualChunks: {
          // React core (rarely changes → cached long-term)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase Auth SDK (heavy, ~200KB)
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
          // UI utilities
          'vendor-ui': ['react-hot-toast', 'axios'],
        },
      },
    },
    // Increase warning threshold since we've manually split
    chunkSizeWarningLimit: 300,
  },
});
