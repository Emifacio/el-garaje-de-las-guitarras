import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Critters from 'critters';

describe('Property 7: Critical CSS Inlining', () => {
  it('should inline critical CSS into a <style> element in <head>', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          color: fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'), { minLength: 6, maxLength: 6 }).map((a) => a.join('')),
          className: fc.stringMatching(/^[a-z]{1,10}$/)
        }),
        async ({ color, className }) => {
          const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'critters-test-'));
          const astroDir = path.join(tmpDir, '_astro');
          await fs.mkdir(astroDir, { recursive: true });

          const cssFileName = 'styles.css';
          const cssPath = path.join(astroDir, cssFileName);
          const css = `.${className}{color:#${color};}`;
          await fs.writeFile(cssPath, css);

          const html = `<!doctype html><html><head><link rel="stylesheet" href="/_astro/${cssFileName}"></head><body><div class="${className}">x</div></body></html>`;

          const critters = new Critters({
            path: tmpDir,
            publicPath: '/',
            inlineThreshold: 14_336,
            pruneSource: true,
            noscriptFallback: true
          });

          const processed = await critters.process(html);

          expect(processed).toContain('<head>');
          expect(processed).toContain('<style');
          expect(processed).toContain(`.${className}{color:#${color};}`);
          expect(processed.indexOf('<style')).toBeGreaterThan(processed.indexOf('<head>'));
          expect(processed.indexOf('<style')).toBeLessThan(processed.indexOf('</head>'));

          await fs.rm(tmpDir, { recursive: true, force: true });
        }
      ),
      { numRuns: 100 }
    );
  }, 30_000);
});
