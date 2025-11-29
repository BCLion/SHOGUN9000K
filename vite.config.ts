// vite.config.js — ALL VITE STUFF LIVES HERE NOW (Fixes the "kit.vite" error forever)
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: undefined,
    external: ['postgres', 'drizzle-orm']  // Server-only — fixes "performance not exported"
  },
  define: {
    global: 'globalThis'  // Node.js compat
  }
});