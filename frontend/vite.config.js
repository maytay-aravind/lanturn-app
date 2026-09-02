import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-192x192-maskable.png', 'pwa-512x512-maskable.png'],
      manifest: {
        name: 'LanTURN — AI-Powered Placement Platform',
        short_name: 'LanTURN',
        description: 'AI-powered placement platform connecting students with employers based on skills and potential.',
        theme_color: '#1A1A1A',
        background_color: '#FFC107',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['education', 'business', 'productivity'],
        lang: 'en',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 8, expiration: { maxEntries: 80, maxAgeSeconds: 60 * 5 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
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
