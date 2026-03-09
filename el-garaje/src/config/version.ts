// Build version — evaluated once at build start, baked into the code by Vite's define.
export const APP_VERSION = (import.meta.env.BUILD_VERSION as string) || 'dev-' + Date.now().toString(36);
