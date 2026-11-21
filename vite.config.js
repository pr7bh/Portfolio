import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Builds public/sw.js from pwa/sw.template.js with this build's files, so
// each deploy installs a fresh service worker that pre-caches the app.
function serviceWorker() {
  const PUBLIC_FILES = ['/favicon.svg', '/favicon.ico', '/manifest.json', '/icon-192.png', '/apple-touch-icon.png', '/fonts/Nippo-Bold.woff2', '/fonts/Nippo-Medium.woff2', '/fonts/Nippo-Regular.woff2', '/fonts/Nippo-Light.woff2', '/fonts/Nippo-Extralight.woff2'];
  return {
    name: 'portfolio-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle)
        // Code, styles, fonts and the hero photo; other images cache as they're viewed.
        .filter((f) => /\.(js|css|woff2|svg)$/.test(f) || /\/hero-[\w-]+\.webp$/.test(f))
        .map((f) => `/${f}`)
        .sort();
      const version = createHash('sha256').update(files.join('\n')).digest('hex').slice(0, 10);
      const source = readFileSync(new URL('./pwa/sw.template.js', import.meta.url), 'utf8')
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify([...PUBLIC_FILES, ...files], null, 2));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    serviceWorker(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/ogl')) {
            return 'vendor-ogl';
          }
          if (id.includes('node_modules/motion')) {
            return 'vendor-motion';
          }
        },
      },
    },
  },
});