import { describe, it, expect } from 'vitest';

async function loadViteConfig(): Promise<any> {
  const mod = await import('../../vite.config');
  return mod.default;
}

describe('Property 26: Admin/Public Bundle Separation', () => {
  it('should place admin-origin modules into an admin chunk', async () => {
    const viteConfig = await loadViteConfig();

    const manualChunks = viteConfig?.build?.rollupOptions?.output?.manualChunks;
    expect(typeof manualChunks).toBe('function');

    expect(manualChunks('/src/pages/admin/productos/nuevo.astro')).toBe('admin');
    expect(manualChunks('/src/pages/admin/login.astro')).toBe('admin');
  });

  it('should keep public pages out of the admin chunk', async () => {
    const viteConfig = await loadViteConfig();

    const manualChunks = viteConfig?.build?.rollupOptions?.output?.manualChunks;
    expect(typeof manualChunks).toBe('function');

    expect(manualChunks('/src/pages/catalogo.astro')).toBeUndefined();
    expect(manualChunks('/src/pages/index.astro')).toBeUndefined();
  });
});
