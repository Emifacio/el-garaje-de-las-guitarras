/**
 * Product Validation Module
 * 
 * Provides server-side validation for product form data.
 * Returns structured errors for clear user feedback.
 */

import type { ProductStatus } from '../lib/types';

const SUPPORTED_STATUSES: ProductStatus[] = ['disponible', 'reservado', 'vendido'];

const MAX_TITLE_LENGTH = 200;
const MAX_SLUG_LENGTH = 200;
const MAX_BRAND_LENGTH = 100;
const MAX_BADGE_LENGTH = 50;
const MAX_PRICE_DISPLAY_LENGTH = 100;
const MAX_YEAR = 2100;
const MIN_YEAR = 1800;
const MAX_SORT_ORDER = 999999;
const MAX_SHORT_DESC_LENGTH = 500;
const MAX_LONG_DESC_LENGTH = 10000;

const ACCEPTED_YOUTUBE_HOSTNAMES = ['www.youtube.com', 'youtube.com', 'youtu.be'];

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult<T = unknown> {
    success: boolean;
    errors: ValidationError[];
    data?: T;
}

function createError(field: string, message: string): ValidationError {
    return { field, message };
}

function validateRequired(value: unknown, fieldName: string): ValidationError | null {
    if (value === null || value === undefined || value === '') {
        return createError(fieldName, `El campo "${fieldName}" es obligatorio.`);
    }
    return null;
}

function validateStringLength(value: string | null | undefined, fieldName: string, maxLength: number): ValidationError | null {
    if (value && value.length > maxLength) {
        return createError(fieldName, `${fieldName} no puede exceder ${maxLength} caracteres.`);
    }
    return null;
}

export interface ProductFormData {
    title: string;
    slug: string;
    category_id: string;
    price: number | null;
    status: ProductStatus;
    brand: string | null;
    year: number | null;
    short_description: string | null;
    long_description: string | null;
    badge: string | null;
    youtube_url: string | null;
    is_featured: boolean;
    sort_order: number;
    price_display: string | null;
    sold_date: string | null;
}

/**
 * Validate product form data for create/update operations.
 */
export function validateProductFormData(formData: FormData): ValidationResult<ProductFormData> {
    const errors: ValidationError[] = [];

    // Title validation
    const rawTitle = formData.get('title')?.toString().trim();
    if (!rawTitle) {
        errors.push(createError('title', 'El título es obligatorio.'));
    } else if (rawTitle.length > MAX_TITLE_LENGTH) {
        errors.push(createError('title', `El título no puede exceder ${MAX_TITLE_LENGTH} caracteres.`));
    }

    // Slug validation
    const rawSlug = formData.get('slug')?.toString().trim();
    if (!rawSlug) {
        // Slug can be auto-generated from title, but we'll track if it was explicitly provided empty
        // This is handled separately in the service
    } else {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug)) {
            errors.push(createError('slug', 'El slug debe contener solo minúsculas, números y guiones (kebab-case).'));
        } else if (rawSlug.length > MAX_SLUG_LENGTH) {
            errors.push(createError('slug', `El slug no puede exceder ${MAX_SLUG_LENGTH} caracteres.`));
        }
    }

    // Category validation
    const categoryId = formData.get('category_id')?.toString();
    if (!categoryId) {
        errors.push(createError('category_id', 'La categoría es obligatoria.'));
    }

    // Price validation
    const priceStr = formData.get('price')?.toString();
    let price: number | null = null;
    if (priceStr && priceStr.trim() !== '') {
        const parsedPrice = parseFloat(priceStr);
        if (isNaN(parsedPrice)) {
            errors.push(createError('price', 'El precio debe ser un número válido.'));
        } else if (!isFinite(parsedPrice)) {
            errors.push(createError('price', 'El precio no es válido.'));
        } else if (parsedPrice < 0) {
            errors.push(createError('price', 'El precio no puede ser negativo.'));
        } else {
            price = parsedPrice;
        }
    }

    // Status validation
    const statusStr = formData.get('status')?.toString() as ProductStatus;
    if (!statusStr || !SUPPORTED_STATUSES.includes(statusStr)) {
        errors.push(createError('status', 'Estado de venta no válido.'));
    }

    // Year validation
    const yearStr = formData.get('year')?.toString();
    let year: number | null = null;
    if (yearStr && yearStr.trim() !== '') {
        const parsedYear = parseInt(yearStr, 10);
        if (isNaN(parsedYear)) {
            errors.push(createError('year', 'El año debe ser un número entero.'));
        } else if (parsedYear < MIN_YEAR || parsedYear > MAX_YEAR) {
            errors.push(createError('year', `El año debe estar entre ${MIN_YEAR} y ${MAX_YEAR}.`));
        } else {
            year = parsedYear;
        }
    }

    // Sort order validation
    const sortOrderStr = formData.get('sort_order')?.toString();
    let sortOrder = 0;
    if (sortOrderStr && sortOrderStr.trim() !== '') {
        const parsedSortOrder = parseInt(sortOrderStr, 10);
        if (isNaN(parsedSortOrder)) {
            errors.push(createError('sort_order', 'El orden debe ser un número entero.'));
        } else if (parsedSortOrder < 0 || parsedSortOrder > MAX_SORT_ORDER) {
            errors.push(createError('sort_order', `El orden debe estar entre 0 y ${MAX_SORT_ORDER}.`));
        } else {
            sortOrder = parsedSortOrder;
        }
    }

    // Optional string fields with length validation
    const brand = formData.get('brand')?.toString().trim() || null;
    const brandError = validateStringLength(brand, 'brand', MAX_BRAND_LENGTH);
    if (brandError) errors.push(brandError);

    const badge = formData.get('badge')?.toString().trim() || null;
    const badgeError = validateStringLength(badge, 'badge', MAX_BADGE_LENGTH);
    if (badgeError) errors.push(badgeError);

    const priceDisplay = formData.get('price_display')?.toString().trim() || null;
    const priceDisplayError = validateStringLength(priceDisplay, 'price_display', MAX_PRICE_DISPLAY_LENGTH);
    if (priceDisplayError) errors.push(priceDisplayError);

    const shortDesc = formData.get('short_description')?.toString().trim() || null;
    const shortDescError = validateStringLength(shortDesc, 'short_description', MAX_SHORT_DESC_LENGTH);
    if (shortDescError) errors.push(shortDescError);

    const longDesc = formData.get('long_description')?.toString().trim() || null;
    const longDescError = validateStringLength(longDesc, 'long_description', MAX_LONG_DESC_LENGTH);
    if (longDescError) errors.push(longDescError);

    // YouTube URL validation
    const youtubeUrl = formData.get('youtube_url')?.toString().trim() || null;
    if (youtubeUrl) {
        try {
            const url = new URL(youtubeUrl);
            if (!ACCEPTED_YOUTUBE_HOSTNAMES.includes(url.hostname.toLowerCase())) {
                errors.push(createError('youtube_url', 'Solo se permiten enlaces de YouTube.'));
            }
        } catch {
            errors.push(createError('youtube_url', 'La URL de YouTube no es válida.'));
        }
    }

    // Boolean fields
    const isFeatured = formData.get('is_featured') === 'on';

    // Sold date validation (for update only)
    const soldDateStr = formData.get('sold_date')?.toString().trim() || null;

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return {
        success: true,
        errors: [],
        data: {
            title: rawTitle!,
            slug: rawSlug || '',
            category_id: categoryId!,
            price,
            status: statusStr,
            brand,
            year,
            short_description: shortDesc,
            long_description: longDesc,
            badge,
            youtube_url: youtubeUrl,
            is_featured: isFeatured,
            sort_order: sortOrder,
            price_display: priceDisplay,
            sold_date: soldDateStr,
        },
    };
}

/**
 * Validate product status value.
 */
export function isValidProductStatus(value: string): value is ProductStatus {
    return SUPPORTED_STATUSES.includes(value as ProductStatus);
}

/**
 * Get supported status values.
 */
export function getSupportedStatuses(): ProductStatus[] {
    return [...SUPPORTED_STATUSES];
}
