/**
 * Type definitions for website performance optimization
 */

/**
 * Image Optimizer Configuration
 */
export interface ImageOptimizerConfig {
  formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
  widths: number[];
  quality: {
    webp: number;
    avif: number;
    jpeg: number;
  };
  loading: 'lazy' | 'eager';
}

/**
 * Optimized Image Output
 */
export interface OptimizedImage {
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Image Asset Data
 */
export interface ImageAsset {
  id: string;
  originalPath: string;
  optimizedVariants: {
    format: 'webp' | 'avif' | 'jpeg' | 'png';
    width: number;
    url: string;
    size: number; // bytes
  }[];
  dimensions: {
    width: number;
    height: number;
  };
  compressionRatio: number;
}

/**
 * Asset Loader Configuration
 */
export interface AssetLoaderConfig {
  criticalCSS: {
    enabled: boolean;
    inlineThreshold: number; // bytes
  };
  bundling: {
    minify: boolean;
    sourcemap: boolean;
    chunkSizeLimit: number; // KB
  };
  resourceHints: {
    preload: string[];
    prefetch: string[];
    dnsPrefetch: string[];
  };
}

/**
 * Loaded Asset
 */
export interface LoadedAsset {
  type: 'css' | 'js' | 'font';
  url: string;
  priority: 'high' | 'low';
  loading: 'sync' | 'async' | 'defer';
}

/**
 * Asset Bundle Data
 */
export interface AssetBundle {
  id: string;
  type: 'css' | 'js';
  route: string;
  files: {
    path: string;
    size: number;
    hash: string;
  }[];
  totalSize: number;
  critical: boolean;
}

/**
 * Cache Configuration
 */
export interface CacheConfig {
  static: {
    maxAge: number; // seconds
    immutable: boolean;
  };
  html: {
    maxAge: number;
    staleWhileRevalidate: number;
  };
  api: {
    maxAge: number;
    staleWhileRevalidate: number;
  };
}

/**
 * Cache Headers
 */
export interface CacheHeaders {
  'Cache-Control': string;
  'CDN-Cache-Control'?: string;
  'Vercel-CDN-Cache-Control'?: string;
}

/**
 * Cache Rule
 */
export interface CacheRule {
  pattern: string; // URL pattern
  headers: {
    'Cache-Control': string;
    'CDN-Cache-Control'?: string;
  };
  priority: number;
}

/**
 * Cache Manifest
 */
export interface CacheManifest {
  rules: CacheRule[];
  version: string;
  lastUpdated: Date;
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  lcp: number; // ms
  fid: number; // ms
  cls: number; // score
  ttfb: number; // ms
  tti: number; // ms
  pageType: 'home' | 'catalog' | 'product' | 'admin' | 'contact';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  region: string;
  timestamp: number;
}

/**
 * Performance Alert
 */
export interface PerformanceAlert {
  metric: string;
  threshold: number;
  actual: number;
  degradation: number; // percentage
}

/**
 * Performance Record
 */
export interface PerformanceRecord {
  id: string;
  timestamp: Date;
  url: string;
  metrics: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    tti: number;
  };
  context: {
    pageType: string;
    deviceType: string;
    connectionType: string;
    region: string;
  };
  userAgent: string;
}

/**
 * Database Query Configuration
 */
export interface QueryConfig {
  cache: {
    enabled: boolean;
    ttl: number; // seconds
  };
  pagination: {
    pageSize: number;
    maxPages: number;
  };
  indexes: string[]; // field names
}

/**
 * Product Query
 */
export interface ProductQuery {
  select: string[]; // field names
  filters: Record<string, any>;
  limit: number;
  offset: number;
}
