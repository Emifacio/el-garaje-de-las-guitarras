/**
 * Cache Configuration
 * Defines caching strategies for different resource types
 */

import type { CacheConfig, CacheRule } from '../types/performance';

export const cacheConfig: CacheConfig = {
  static: {
    maxAge: 31536000, // 1 year in seconds
    immutable: true
  },
  html: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 86400 // 24 hours
  },
  api: {
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 300 // 5 minutes
  }
};

/**
 * Cache rules for different URL patterns
 * Higher priority rules are evaluated first
 */
export const cacheRules: CacheRule[] = [
  {
    pattern: '/assets/*',
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    priority: 1
  },
  {
    pattern: '/*.{js,css,woff2,woff,ttf,eot}',
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    priority: 2
  },
  {
    pattern: '/*.{jpg,jpeg,png,gif,webp,avif,svg,ico}',
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    priority: 3
  },
  {
    pattern: '/api/*',
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
    },
    priority: 4
  },
  {
    pattern: '/*.html',
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400, must-revalidate'
    },
    priority: 5
  },
  {
    pattern: '/*',
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400, must-revalidate'
    },
    priority: 6
  }
];

/**
 * Generate Cache-Control header string from config
 */
export function generateCacheControlHeader(
  maxAge: number,
  options: {
    immutable?: boolean;
    staleWhileRevalidate?: number;
    mustRevalidate?: boolean;
  } = {}
): string {
  const parts = ['public', `max-age=${maxAge}`];
  
  if (options.immutable) {
    parts.push('immutable');
  }
  
  if (options.staleWhileRevalidate) {
    parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }
  
  if (options.mustRevalidate) {
    parts.push('must-revalidate');
  }
  
  return parts.join(', ');
}
