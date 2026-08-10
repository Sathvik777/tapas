import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works when served from any URL path
  // (Vercel previews, GitHub Pages subpaths, local preview).
  base: './',
  build: {
    chunkSizeWarningLimit: 1600,
  },
  server: {
    host: true,
  },
});
