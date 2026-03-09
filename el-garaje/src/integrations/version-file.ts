import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

/**
 * Astro integration that writes a version.json file to public/ (for dev)
 * and to the build output directory (for production).
 * The client polls this file to detect new deployments.
 */
export default function versionFile(version: string): AstroIntegration {
  return {
    name: 'version-file',
    hooks: {
      'astro:config:setup': ({ config }) => {
        // Write to public/ so it's available during dev
        const publicDir = fileURLToPath(config.publicDir);
        writeFileSync(
          join(publicDir, 'version.json'),
          JSON.stringify({ version, generatedAt: new Date().toISOString() }),
        );
      },
      'astro:build:done': ({ dir }) => {
        // Write to build output to ensure the latest version is deployed
        const outDir = fileURLToPath(dir);
        writeFileSync(
          join(outDir, 'version.json'),
          JSON.stringify({ version, generatedAt: new Date().toISOString() }),
        );
      },
    },
  };
}
