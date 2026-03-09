import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { inlineScriptArbitrary, renderScriptTag } from '../test-utils/html-arbitraries';

function isDeferredScriptTag(html: string): boolean {
  const lower = html.toLowerCase();
  const isModule = lower.includes('type="module"') || lower.includes("type='module'");
  const hasDefer = lower.includes(' defer') || lower.includes(' defer=');
  const hasAsync = lower.includes(' async') || lower.includes(' async=');
  return isModule || hasDefer || hasAsync;
}

describe('Property 9: JavaScript Deferral', () => {
  it('should ensure non-critical scripts are deferred or async', () => {
    fc.assert(
      fc.property(inlineScriptArbitrary, (script) => {
        const html = renderScriptTag(script);

        if (script.isModule || script.isAsync || script.isDefer) {
          expect(isDeferredScriptTag(html)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
