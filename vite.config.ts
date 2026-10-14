import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: process.env.BASE_PATH || './',
  build: { target: 'safari16.4', assetsInlineLimit: 0 },
  plugins: [VitePWA({
    strategies: 'generateSW', registerType: 'prompt', injectRegister: false,
    includeAssets: ['*.png', 'logo.svg', 'licenses/*.txt'],
    manifest: {
      name: '桌面时钟 Desk Clock', short_name: 'Desk Clock', description: '安静、离线、属于你的桌面时钟',
      lang: 'zh', start_url: './', scope: './', display: 'standalone', background_color: '#1C1C1E', theme_color: '#1C1C1E',
      icons: [
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest,txt}'], cleanupOutdatedCaches: true, navigateFallback: 'index.html' }
  })]
});
