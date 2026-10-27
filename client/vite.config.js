import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the built game works on GitHub Pages project URLs
  // (…github.io/climate-action-school/) as well as on Vercel later.
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' }
  },
  preview: { port: 4173 }
});
