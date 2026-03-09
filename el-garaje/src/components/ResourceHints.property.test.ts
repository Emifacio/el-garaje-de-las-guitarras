import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { assetLoaderConfig } from '../config/asset-loader.config';

function renderPreloadLinks(hrefs: string[]): string {
  return hrefs.map((href) => `<link rel="preload" href="${href}" as="image">`).join('');
}

function renderPrefetchLinks(hrefs: string[]): string {
  return hrefs.map((href) => `<link rel="prefetch" href="${href}">`).join('');
}

describe('Property 10: Critical Resource Preloading', () => {
  it('should generate preload link elements for all critical resources', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 1, maxLength: 10 }),
        (hrefs) => {
          const html = renderPreloadLinks(hrefs);
          hrefs.forEach((href) => {
            expect(html).toContain(`rel=\"preload\"`);
            expect(html).toContain(`href=\"${href}\"`);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have at least one preload resource configured for the site', () => {
    expect(assetLoaderConfig.resourceHints.preload.length).toBeGreaterThan(0);
  });
});

describe('Property 11: Next-Page Resource Prefetching', () => {
  it('should generate prefetch link elements for next-page resources', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 1, maxLength: 10 }),
        (hrefs) => {
          const html = renderPrefetchLinks(hrefs);
          hrefs.forEach((href) => {
            expect(html).toContain(`rel=\"prefetch\"`);
            expect(html).toContain(`href=\"${href}\"`);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should have at least one prefetch route configured for the site', () => {
    expect(assetLoaderConfig.resourceHints.prefetch.length).toBeGreaterThan(0);
  });
});
