import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { mkdirSync, writeFileSync } from 'node:fs';
function verifyProductionModules(): Plugin {
  return {
    name: 'verify-test-tools-excluded',
    generateBundle(_options, bundle) {
      const modules = Object.values(bundle).flatMap(chunk => chunk.type === 'chunk' ? Object.keys(chunk.modules) : []);
      const packages = [...new Set(modules.flatMap(id => [...id.replaceAll('\\', '/').matchAll(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/g)].map(match => match[1])))].sort();
      const testPackages = ['vitest', '@vitest/mocker', 'tinypool'];
      if (packages.some(name => testPackages.includes(name))) throw new Error('A vulnerable test tool entered the production bundle.');
      mkdirSync('artifacts', { recursive: true });
      writeFileSync('artifacts/bundle-modules.json', JSON.stringify({ bundledPackages: packages, excludedTestPackages: testPackages, moduleCount: modules.length }, null, 2) + '\n');
    }
  };
}
export default defineConfig({
  base: process.env.BASE_PATH || './',
  build: { target: 'safari16.4', assetsInlineLimit: 0 },
  plugins: [verifyProductionModules(), VitePWA({
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
