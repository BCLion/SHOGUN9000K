// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs18.x'  // Ensures Node.js env for server routes
    }),
    preprocess: vitePreprocess(),
    // CRITICAL FIX — Exclude server-only modules from client bundling
    vite: {
      ssr: {
        noExternal: undefined,  // Default
        external: [
          'postgres',          // Our DB driver — server-only
          'drizzle-orm',       // ORM — server-only
          '@vercel/postgres',  // Vercel wrapper — server-only
          'pg'                 // Fallback driver
        ]
      },
      define: {
        // Ensure Node.js globals are available in server code
        global: 'globalThis'
      }
    }
  }
};