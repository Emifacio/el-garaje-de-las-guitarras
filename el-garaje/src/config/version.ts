// Build version — evaluated once at server/build start, stays constant for the entire lifecycle.
// Used by the meta tag and version.json to detect new deployments.
export const APP_VERSION = Date.now().toString(36);
