import * as fc from 'fast-check';

export const inlineScriptArbitrary = fc.record({
  isModule: fc.boolean(),
  isAsync: fc.boolean(),
  isDefer: fc.boolean(),
  body: fc.string({ minLength: 0, maxLength: 200 })
});

export function renderScriptTag(input: {
  isModule: boolean;
  isAsync: boolean;
  isDefer: boolean;
  body: string;
}): string {
  const attrs: string[] = [];
  if (input.isModule) attrs.push('type="module"');
  if (input.isAsync) attrs.push('async');
  if (input.isDefer) attrs.push('defer');
  return `<script ${attrs.join(' ')}>${input.body}</script>`;
}
