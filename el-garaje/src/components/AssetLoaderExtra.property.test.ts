import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { transform } from 'esbuild';
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function findFilesRecursive(dir: string, predicate: (filePath: string) => boolean): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await findFilesRecursive(full, predicate)));
    } else if (entry.isFile() && predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

describe('Property 14: Unused CSS Removal (Proxy)', () => {
  it('should produce smaller CSS after minification on typical stylesheets', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          className: fc.stringMatching(/^[a-z]{1,10}$/),
          unusedClassName: fc.stringMatching(/^[a-z]{1,10}$/),
          repeat: fc.integer({ min: 10, max: 80 })
        }),
        async ({ className, unusedClassName, repeat }) => {
          const css = `/* header */\n.${className}{padding:10px 20px; margin: 0px  0px; color: #ffffff;}\n` +
            `.${unusedClassName}{display:block; border: 1px solid #000000;}\n`.repeat(repeat);

          const result = await transform(css, { loader: 'css', minify: true });
          expect(result.code.length).toBeLessThan(css.length);
        }
      ),
      { numRuns: 100 }
    );
  }, 30_000);
});

describe('Property 15: Font Display Swap', () => {
  it('should ensure Google Fonts stylesheets use display=swap', async () => {
    const baseHeadPath = path.join(process.cwd(), 'src', 'components', 'layout', 'BaseHead.astro');
    const contents = await fs.readFile(baseHeadPath, 'utf-8');

    const googleFontsLinks = contents
      .split('\n')
      .filter((l) => l.includes('fonts.googleapis.com/css2'));

    expect(googleFontsLinks.length).toBeGreaterThan(0);
    googleFontsLinks.forEach((l) => {
      expect(l).toContain('display=swap');
    });
  });
});

describe('Property 23: Third-Party Script Deferral', () => {
  it('should ensure any external scripts are async/defer/module', async () => {
    const srcDir = path.join(process.cwd(), 'src');
    const files = await findFilesRecursive(
      srcDir,
      (p) => p.endsWith('.astro') || p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js')
    );

    for (const filePath of files) {
      const contents = await fs.readFile(filePath, 'utf-8');

      const externalScriptTags = contents.match(/<script[^>]*\ssrc=\"https?:\/\/[^\"]+\"[^>]*>/g) ?? [];
      for (const tag of externalScriptTags) {
        const lower = tag.toLowerCase();
        const ok = lower.includes(' type="module"') || lower.includes(' async') || lower.includes(' defer');
        expect(ok).toBe(true);
      }
    }
  });
});
