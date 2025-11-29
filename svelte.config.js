// svelte.config.js — SVELTEKIT 2.0+ BULLETPROOF (Top-level preprocess — fixes the error forever)
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),  // ← TOP-LEVEL, NOT UNDER kit
  kit: {
    adapter: adapter()
  }
};