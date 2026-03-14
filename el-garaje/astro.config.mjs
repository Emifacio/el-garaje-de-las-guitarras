// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';
import criticalCssIntegration from './src/integrations/critical-css';
import lollapaloozaModal from './src/integrations/lollapalooza-modal';
import versionFile from './src/integrations/version-file';
import { assetLoaderConfig } from './src/config/asset-loader.config';

const buildVersion = Date.now().toString(36);

// https://astro.build/config
export default defineConfig({
  site: 'https://www.elgarajedelasguitarras.com',
  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.BUILD_VERSION': JSON.stringify(buildVersion)
    }
  },
  integrations: [
    sitemap(),
    criticalCssIntegration({
      inlineThreshold: assetLoaderConfig.criticalCSS.inlineThreshold
    }),
    lollapaloozaModal(),
    versionFile(buildVersion),
  ],
  output: 'static',
  adapter: vercel(),
  redirects: {
    '/index.html': '/'
  },
  security: {
    checkOrigin: false // Fixes "Cross-site POST form submissions are forbidden" in Astro on Vercel Edge Server
  },
  image: {
    service: {
      entrypoint: './src/lib/image-service'
    },
    remotePatterns: [{ protocol: 'https' }]
  }
});
