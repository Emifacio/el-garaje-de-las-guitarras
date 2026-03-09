/**
 * Tests for property-based testing generators
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  imageArbitrary,
  viewportArbitrary,
  pageTypeArbitrary,
  deviceTypeArbitrary,
  metricsArbitrary,
  cacheConfigArbitrary
} from './generators';

describe('Property-Based Testing Generators', () => {
  it('should generate valid image configurations', () => {
    fc.assert(
      fc.property(imageArbitrary, (image) => {
        expect(image.path).toBeTruthy();
        expect(['jpg', 'jpeg', 'png', 'gif', 'webp']).toContain(image.format);
        expect(image.width).toBeGreaterThanOrEqual(100);
        expect(image.width).toBeLessThanOrEqual(5000);
        expect(image.height).toBeGreaterThanOrEqual(100);
        expect(image.height).toBeLessThanOrEqual(5000);
      }),
      { numRuns: 10 }
    );
  });

  it('should generate valid viewport dimensions', () => {
    fc.assert(
      fc.property(viewportArbitrary, (viewport) => {
        expect(viewport.width).toBeGreaterThanOrEqual(320);
        expect(viewport.width).toBeLessThanOrEqual(3840);
        expect(viewport.height).toBeGreaterThanOrEqual(568);
        expect(viewport.height).toBeLessThanOrEqual(2160);
      }),
      { numRuns: 10 }
    );
  });

  it('should generate valid page types', () => {
    fc.assert(
      fc.property(pageTypeArbitrary, (pageType) => {
        expect(['home', 'catalog', 'product', 'admin', 'contact']).toContain(pageType);
      }),
      { numRuns: 10 }
    );
  });

  it('should generate valid device types', () => {
    fc.assert(
      fc.property(deviceTypeArbitrary, (deviceType) => {
        expect(['mobile', 'tablet', 'desktop']).toContain(deviceType);
      }),
      { numRuns: 10 }
    );
  });

  it('should generate valid performance metrics', () => {
    fc.assert(
      fc.property(metricsArbitrary, (metrics) => {
        expect(metrics.lcp).toBeGreaterThanOrEqual(0);
        expect(metrics.fid).toBeGreaterThanOrEqual(0);
        expect(metrics.cls).toBeGreaterThanOrEqual(0);
        expect(metrics.cls).toBeLessThanOrEqual(1);
        expect(metrics.ttfb).toBeGreaterThanOrEqual(0);
        expect(metrics.tti).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 10 }
    );
  });

  it('should generate valid cache configurations', () => {
    fc.assert(
      fc.property(cacheConfigArbitrary, (config) => {
        expect(config.maxAge).toBeGreaterThanOrEqual(0);
        expect(config.maxAge).toBeLessThanOrEqual(31536000);
        expect(config.staleWhileRevalidate).toBeGreaterThanOrEqual(0);
        expect(typeof config.immutable).toBe('boolean');
      }),
      { numRuns: 10 }
    );
  });
});
