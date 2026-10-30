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
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,

        // ── The fix ──
        // Default is 2 MiB. Our bundle is 2.1 MB. Raise to 3 MiB for headroom.
        // If the bundle ever exceeds 3 MiB, split it further rather than
        // raising this again — an oversized precache hurts install time.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,

        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/hangfire/,
          /^\/health/,
          /^\/swagger/,
        ],

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          {
            urlPattern: /\/assets\/.*\.(js|css|woff2?)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
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

  build: {
    // Silence the 500 kB chunk warning; we've split the biggest offenders,
    // anything left is a legitimately large single chunk.
    chunkSizeWarningLimit: 800,

    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            },
            {
              name: 'ui-vendor',
              test: /node_modules[\\/](lucide-react|framer-motion|@radix-ui)[\\/]/,
            },
            {
              name: 'query-vendor',
              test: /node_modules[\\/](@tanstack|axios|zustand|immer)[\\/]/,
            },
            {
              name: 'form-vendor',
              test: /node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/,
            },
            {
              name: 'date-vendor',
              test: /node_modules[\\/](date-fns|dayjs|luxon|moment)[\\/]/,
            },
          ],
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})