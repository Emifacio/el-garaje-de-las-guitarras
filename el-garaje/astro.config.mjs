// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  output: 'static',
  adapter: vercel(),
  redirects: {
    '/index.html': '/'
  },
  security: {
    checkOrigin: false // Fixes "Cross-site POST form submissions are forbidden" in Astro on Vercel Edge Server
  }
});