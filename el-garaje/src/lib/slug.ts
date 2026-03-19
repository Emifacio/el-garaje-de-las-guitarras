/**
 * Slug Utility Module
 * 
 * Centralizes slug normalization rules.
 * Ensures consistency across create/update operations.
 */

const MAX_SLUG_LENGTH = 200;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Normalize a title or raw text into a valid slug.
 */
export function normalizeSlug(input: string): string {
    if (!input) return '';
    
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
        .replace(/(^-|-$)+/g, '')        // Remove leading/trailing hyphens
        .slice(0, MAX_SLUG_LENGTH);
}

/**
 * Validate if a string is a valid slug format.
 */
export function isValidSlug(slug: string): boolean {
    if (!slug) return false;
    return SLUG_REGEX.test(slug) && slug.length <= MAX_SLUG_LENGTH;
}

/**
 * Generate a slug from a title, ensuring it's valid.
 * If the provided slug is valid, use it directly.
 * Otherwise, generate from the title.
 */
export function resolveSlug(providedSlug: string | null | undefined, title: string): string {
    const trimmedSlug = (providedSlug || '').trim();
    
    if (trimmedSlug && isValidSlug(trimmedSlug)) {
        return trimmedSlug;
    }
    
    return normalizeSlug(title);
}

/**
 * Sanitize a slug input (trim, lowercase).
 * Does not validate format - use isValidSlug for that.
 */
export function sanitizeSlugInput(slug: string | null | undefined): string {
    if (!slug) return '';
    return slug.trim().toLowerCase();
}
