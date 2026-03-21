import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Critters from 'critters';

export default function criticalCssIntegration(options?: {
  inlineThreshold?: number;
}): import('astro').AstroIntegration {
  return {
    name: 'critical-css',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outDirPath = fileURLToPath(dir);
        let clientDir = path.join(outDirPath, 'client');

        try {
          await fs.access(clientDir);
        } catch {
          clientDir = outDirPath;
          try {
            await fs.access(clientDir);
          } catch {
            return;
          }
        }

        const critters = new Critters({
          path: clientDir,
          publicPath: '/',
          inlineThreshold: options?.inlineThreshold ?? 14_336,
          preload: 'media',
          pruneSource: false,
          noscriptFallback: true
        });

        const allEntries = await fs.readdir(clientDir, { recursive: true });
        const htmlFiles = allEntries
          .filter((p) => typeof p === 'string' && p.endsWith('.html'))
          .map((p) => path.join(clientDir, p as string));

        await Promise.all(
          htmlFiles.map(async (filePath) => {
            const html = await fs.readFile(filePath, 'utf-8');
            const processed = await critters.process(html);
            await fs.writeFile(filePath, processed);
          })
        );
      }
    }
  };
}
