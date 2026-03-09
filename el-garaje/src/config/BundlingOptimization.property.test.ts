import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

async function loadViteConfig(): Promise<any> {
  const mod = await import('../../vite.config');
  return mod.default;
}

describe('Property 12: JavaScript Minification', () => {
  it('should enable JavaScript minification for production builds', async () => {
    const viteConfig = await loadViteConfig();

    fc.assert(
      fc.property(fc.constant(true), () => {
        expect(viteConfig.build).toBeDefined();
        expect(viteConfig.build.minify).toBeDefined();
        expect(viteConfig.build.minify).toBe('esbuild');
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 13: CSS Minification', () => {
  it('should enable CSS minification for production builds', async () => {
    const viteConfig = await loadViteConfig();

    fc.assert(
      fc.property(fc.constant(true), () => {
        expect(viteConfig.build).toBeDefined();
        expect(viteConfig.build.cssMinify).toBeDefined();
        expect(viteConfig.build.cssMinify).toBe('esbuild');
      }),
      { numRuns: 100 }
    );
  });
});
