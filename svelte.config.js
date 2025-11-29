// svelte.config.js — SVELTEKIT 2.0 CANONICAL (No kit.vite — that's the killer)
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};