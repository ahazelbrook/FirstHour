import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png', 'pwa-maskable-512.png'],
      manifest: {
        name: 'First Hour',
        short_name: 'First Hour',
        description:
          'First Hour — guided morning movement. Ten or twenty minutes, voice-coached, before the day starts.',
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0F0E16',
        theme_color: '#0F0E16',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Full precache — fonts AND the generated voice clips + manifest — so
        // the app (and recorded voice) run fully offline after the first load.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,json}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            // Fallback for any voice clip not in the precache (e.g. audio added
            // after this build): cache it on first play.
            urlPattern: ({ url }) => url.pathname.includes('/audio/') && url.pathname.endsWith('.mp3'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'voice-audio',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
