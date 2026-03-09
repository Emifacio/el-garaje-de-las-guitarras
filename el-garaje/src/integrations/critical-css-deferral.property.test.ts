import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Critters from 'critters';

describe('Property 8: Non-Critical CSS Deferral', () => {
  it('should defer non-critical CSS loading when stylesheet is above inline threshold', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          className: fc.stringMatching(/^[a-z]{1,10}$/)
        }),
        async ({ className }) => {
          const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'critters-test-'));
          const astroDir = path.join(tmpDir, '_astro');
          await fs.mkdir(astroDir, { recursive: true });

          const cssFileName = 'big.css';
          const cssPath = path.join(astroDir, cssFileName);

          const filler = '.x{padding:0;margin:0;}'.repeat(500);
          const css = `.${className}{color:#123456;}${filler}`;
          await fs.writeFile(cssPath, css);

          const html = `<!doctype html><html><head><link rel="stylesheet" href="/_astro/${cssFileName}"></head><body><div class="${className}">x</div></body></html>`;

          const critters = new Critters({
            path: tmpDir,
            publicPath: '/',
            inlineThreshold: 1,
            preload: 'media',
            pruneSource: true,
            noscriptFallback: true
          });

          const processed = await critters.process(html);

          const hasMediaDeferral =
            processed.includes('media="print"') &&
            (processed.includes("onload=\"this.media='all'\"") || processed.includes("onload=\"this.media=&#39;all&#39;\""));

          const hasPreloadDeferral =
            processed.includes('rel="preload"') && processed.includes('as="style"');

          expect(hasMediaDeferral || hasPreloadDeferral).toBe(true);

          await fs.rm(tmpDir, { recursive: true, force: true });
        }
      ),
      { numRuns: 100 }
    );
  }, 30_000);
});
