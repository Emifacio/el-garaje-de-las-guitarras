import { defineConfig, type Plugin } from 'vite';
import { promises as fs } from 'node:fs';
import path from 'node:path';

function bundleSizeGuard(options: { maxChunkSizeBytes: number; reportFileName: string }): Plugin {
  let outDir = 'dist';

  return {
    name: 'bundle-size-guard',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    async generateBundle(_outputOptions, bundle) {
      const entries = Object.entries(bundle)
        .filter(([, item]) => item.type === 'chunk' && item.fileName.endsWith('.js'))
        .map(([fileName, item]) => {
          const chunk = item as any;
          const size = Buffer.byteLength(chunk.code ?? '', 'utf8');
          return {
            fileName,
            size,
            isEntry: Boolean(chunk.isEntry),
            isDynamicEntry: Boolean(chunk.isDynamicEntry)
          };
        })
        .sort((a, b) => b.size - a.size);

      const report = {
        maxChunkSizeBytes: options.maxChunkSizeBytes,
        generatedAt: new Date().toISOString(),
        chunks: entries
      };

      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(path.join(outDir, options.reportFileName), JSON.stringify(report, null, 2), 'utf-8');

      const offenders = entries.filter((e) => e.size > options.maxChunkSizeBytes);
      if (offenders.length > 0) {
        const details = offenders
          .map((o) => `${o.fileName} (${Math.round(o.size / 1024)}KB)`)
          .join(', ');
        throw new Error(
          `[bundle-size-guard] Bundle size limit exceeded (>${Math.round(options.maxChunkSizeBytes / 1024)}KB): ${details}`
        );
      }
    }
  };
}

export default defineConfig({
  css: {
    devSourcemap: false
  },
  plugins: [
    bundleSizeGuard({
      maxChunkSizeBytes: 200 * 1024,
      reportFileName: 'bundle-report.json'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase/supabase-js') || id.includes('@supabase/ssr')) {
              return 'vendor-supabase';
            }

            return 'vendor';
          }

          // Keep admin-only modules out of public bundles
          if (
            id.includes('/src/pages/admin/') ||
            id.includes('\\src\\pages\\admin\\') ||
            id.includes('/src/components/admin/') ||
            id.includes('\\src\\components\\admin\\')
          ) {
            return 'admin';
          }

          return undefined;
        },
        // Add content hash to filenames for cache busting + clearer chunk naming
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'admin') return 'assets/admin/[name].[hash].js';
          if (chunkInfo.name.startsWith('vendor')) return 'assets/vendor/[name].[hash].js';
          return 'assets/[name].[hash].js';
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'admin') return 'assets/admin/[name].[hash].js';
          if (chunkInfo.name.startsWith('vendor')) return 'assets/vendor/[name].[hash].js';
          return 'assets/chunks/[name].[hash].js';
        },
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    },
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Enable CSS minification
    cssMinify: 'esbuild',
    // Enable minification
    minify: 'esbuild',
    // Generate source maps for debugging
    sourcemap: false,
    // Set chunk size warning limit to 200KB
    chunkSizeWarningLimit: 200
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', '@supabase/ssr']
  }
});
