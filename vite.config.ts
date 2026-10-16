import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-96x96.png',
        'apple-touch-icon.png',
      ],
      // ── The important bit ──
      workbox: {
        // Activate the new SW as soon as it's downloaded,
        // don't wait for tabs to close.
        skipWaiting: true,
        clientsClaim: true,

        // Remove caches from previous SW versions on activation.
        cleanupOutdatedCaches: true,

        // HTML navigations: hit the network first, fall back to
        // cache only if offline. This stops a stale index.html
        // from loading an old JS bundle.
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/hangfire/,
          /^\/health/,
          /^\/swagger/,
        ],

        runtimeCaching: [
          {
            // Every route navigation (address bar change, PWA launch)
            // goes network-first.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          {
            // Hashed JS/CSS bundles: safe to cache forever, they
            // have new filenames on every deploy.
            urlPattern: /\/assets\/.*\.(js|css|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Images and icons: stale-while-revalidate.
            urlPattern: /\.(png|jpg|jpeg|svg|webp|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],

        // Don't try to serve the HTML through the SW cache during
        // dev — makes debugging painful.
        globIgnores: ['**/index.html'],
      },
      manifest: {
        name: 'MOVA',
        short_name: 'MOVA',
        description: 'Control when and how your money becomes available.',
        theme_color: '#0F172A',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})