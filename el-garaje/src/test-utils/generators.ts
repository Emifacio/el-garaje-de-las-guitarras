/**
 * Property-based testing generators using fast-check
 * These generators create random test data for property tests
 */

import * as fc from 'fast-check';

/**
 * Generate random image configuration
 */
export const imageArbitrary = fc.record({
  path: fc.string({ minLength: 1, maxLength: 100 }),
  format: fc.constantFrom('jpg', 'jpeg', 'png', 'gif', 'webp'),
  width: fc.integer({ min: 100, max: 5000 }),
  height: fc.integer({ min: 100, max: 5000 }),
  size: fc.integer({ min: 1000, max: 10000000 }) // bytes
});

/**
 * Generate random viewport dimensions
 */
export const viewportArbitrary = fc.record({
  width: fc.integer({ min: 320, max: 3840 }),
  height: fc.integer({ min: 568, max: 2160 })
});

/**
 * Generate random page types
 */
export const pageTypeArbitrary = fc.constantFrom(
  'home',
  'catalog',
  'product',
  'admin',
  'contact'
);

/**
 * Generate random device types
 */
export const deviceTypeArbitrary = fc.constantFrom(
  'mobile',
  'tablet',
  'desktop'
);

/**
 * Generate random performance metrics
 */
export const metricsArbitrary = fc.record({
  lcp: fc.integer({ min: 0, max: 10000 }),
  fid: fc.integer({ min: 0, max: 1000 }),
  cls: fc.float({ min: 0, max: 1, noNaN: true }),
  ttfb: fc.integer({ min: 0, max: 5000 }),
  tti: fc.integer({ min: 0, max: 15000 })
});

/**
 * Generate random cache configuration
 */
export const cacheConfigArbitrary = fc.record({
  maxAge: fc.integer({ min: 0, max: 31536000 }),
  staleWhileRevalidate: fc.integer({ min: 0, max: 86400 }),
  immutable: fc.boolean()
});

/**
 * Generate random file content for hash testing
 */
export const fileContentArbitrary = fc.string({ minLength: 1, maxLength: 10000 });

/**
 * Generate random URL paths
 */
export const urlPathArbitrary = fc.array(
  fc.string({ minLength: 1, maxLength: 20 }),
  { minLength: 1, maxLength: 5 }
).map(parts => '/' + parts.join('/'));

/**
 * Generate random CSS content
 */
export const cssContentArbitrary = fc.string({ minLength: 100, maxLength: 10000 });

/**
 * Generate random JavaScript content
 */
export const jsContentArbitrary = fc.string({ minLength: 100, maxLength: 10000 });
