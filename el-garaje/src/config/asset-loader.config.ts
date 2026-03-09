/**
 * Asset Loader Configuration
 * Defines settings for CSS/JS optimization and resource hints
 */

import type { AssetLoaderConfig } from '../types/performance';

export const assetLoaderConfig: AssetLoaderConfig = {
  criticalCSS: {
    enabled: true,
    inlineThreshold: 14336 // 14KB in bytes
  },
  bundling: {
    minify: true,
    sourcemap: false, // Disable in production for smaller files
    chunkSizeLimit: 200 // 200KB
  },
  resourceHints: {
    preload: [
      '/logo.jpg'
    ],
    prefetch: [
      // Likely next pages
      '/catalogo',
      '/contacto',
      '/consignaciones'
    ],
    dnsPrefetch: [
      // Third-party domains
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://player.vimeo.com',
      'https://www.instagram.com',
      'https://www.facebook.com',
      'https://wa.me'
    ]
  }
};

/**
 * Third-party script configuration
 */
export const thirdPartyScripts = {
  analytics: {
    src: 'https://analytics.example.com/script.js',
    async: true,
    defer: false
  }
};

/**
 * Font loading configuration
 */
export const fontConfig = {
  display: 'swap' as const,
  preload: true
};
