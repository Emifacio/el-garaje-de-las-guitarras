/**
 * Unit tests for validators and utilities
 */

import { describe, it, expect } from 'vitest';
import { normalizeSlug, isValidSlug, resolveSlug, sanitizeSlugInput } from '../lib/slug';
import { parseSoldDate, formatSoldDateForDisplay, determineSoldDate } from '../lib/dates';
import { validateSingleFile, validateUploadFiles, getUploadLimits } from '../validators/uploads';
import { validateProductFormData, isValidProductStatus, getSupportedStatuses } from '../validators/product';

describe('Slug Utilities', () => {
    describe('normalizeSlug', () => {
        it('converts to lowercase', () => {
            expect(normalizeSlug('Gibson Les Paul')).toBe('gibson-les-paul');
        });

        it('replaces spaces with hyphens', () => {
            expect(normalizeSlug('guitar hero')).toBe('guitar-hero');
        });

        it('removes special characters', () => {
            expect(normalizeSlug('Guitar 100%!')).toBe('guitar-100');
        });

        it('removes leading/trailing hyphens', () => {
            expect(normalizeSlug('  -guitar-  ')).toBe('guitar');
        });

        it('handles diacritics', () => {
            expect(normalizeSlug('Fender Stratoçaster')).toBe('fender-stratocaster');
        });

        it('handles empty string', () => {
            expect(normalizeSlug('')).toBe('');
        });

        it('limits length to 200 characters', () => {
            const longSlug = 'a'.repeat(250);
            const result = normalizeSlug(longSlug);
            expect(result.length).toBe(200);
        });
    });

    describe('isValidSlug', () => {
        it('accepts valid slugs', () => {
            expect(isValidSlug('gibson-les-paul')).toBe(true);
            expect(isValidSlug('fender-stratocaster-1957')).toBe(true);
            expect(isValidSlug('ibanez')).toBe(true);
        });

        it('rejects uppercase', () => {
            expect(isValidSlug('Gibson')).toBe(false);
        });

        it('rejects spaces', () => {
            expect(isValidSlug('gibson les paul')).toBe(false);
        });

        it('rejects invalid characters', () => {
            expect(isValidSlug('gibson_les_paul')).toBe(false);
            expect(isValidSlug('gibson.les.paul')).toBe(false);
        });

        it('rejects empty string', () => {
            expect(isValidSlug('')).toBe(false);
        });

        it('rejects slugs over 200 characters', () => {
            expect(isValidSlug('a'.repeat(201))).toBe(false);
        });
    });

    describe('resolveSlug', () => {
        it('uses provided slug if valid', () => {
            expect(resolveSlug('custom-slug', 'Some Title')).toBe('custom-slug');
        });

        it('generates from title if slug is empty', () => {
            expect(resolveSlug('', 'Gibson Les Paul')).toBe('gibson-les-paul');
        });

        it('generates from title if slug is invalid', () => {
            expect(resolveSlug('Invalid Slug', 'Fender Strat')).toBe('fender-strat');
        });

        it('trims whitespace from provided slug', () => {
            expect(resolveSlug('  trim-me  ', 'Title')).toBe('trim-me');
        });
    });
});

describe('Date Utilities', () => {
    describe('parseSoldDate', () => {
        it('parses valid DD/MM/YYYY format', () => {
            const result = parseSoldDate('25/12/2024');
            expect(result).toBeTruthy();
            expect(new Date(result!).toISOString()).toContain('2024-12-25');
        });

        it('returns null for empty input', () => {
            expect(parseSoldDate('')).toBeNull();
            expect(parseSoldDate(null)).toBeNull();
            expect(parseSoldDate(undefined)).toBeNull();
        });

        it('returns null for invalid format', () => {
            expect(parseSoldDate('2024-12-25')).toBeNull();
            expect(parseSoldDate('25-12-2024')).toBeNull();
            expect(parseSoldDate('abc')).toBeNull();
        });

        it('returns null for invalid date values', () => {
            expect(parseSoldDate('32/12/2024')).toBeNull();
            expect(parseSoldDate('25/13/2024')).toBeNull();
        });

        it('trims whitespace', () => {
            const result = parseSoldDate('  01/01/2024  ');
            expect(result).toBeTruthy();
        });
    });

    describe('formatSoldDateForDisplay', () => {
        it('formats ISO date to DD/MM/YYYY', () => {
            const result = formatSoldDateForDisplay('2024-12-25T12:00:00.000Z');
            expect(result).toBe('25/12/2024');
        });

        it('returns empty string for null', () => {
            expect(formatSoldDateForDisplay(null)).toBe('');
        });

        it('returns empty string for undefined', () => {
            expect(formatSoldDateForDisplay(undefined)).toBe('');
        });

        it('pads single digit day/month', () => {
            const result = formatSoldDateForDisplay('2024-01-05T12:00:00.000Z');
            expect(result).toBe('05/01/2024');
        });
    });

    describe('determineSoldDate', () => {
        it('returns current date when status is vendido', () => {
            const result = determineSoldDate(null, 'vendido');
            expect(result).toBeTruthy();
        });

        it('returns null when status is disponible', () => {
            expect(determineSoldDate(null, 'disponible')).toBeNull();
        });

        it('returns null when status is reservado', () => {
            expect(determineSoldDate(null, 'reservado')).toBeNull();
        });

        it('keeps existing sold_date when transitioning to vendido', () => {
            const existingDate = '2024-06-15T12:00:00.000Z';
            const result = determineSoldDate(existingDate, 'vendido');
            expect(result).toBe(existingDate);
        });
    });
});

describe('Upload Validation', () => {
    const limits = getUploadLimits();

    describe('validateSingleFile', () => {
        it('accepts valid image files', () => {
            const jpegContent = 'x'.repeat(200);
            const pngContent = 'x'.repeat(200);
            const webpContent = 'x'.repeat(200);
            
            const jpegFile = new File([jpegContent], 'test.jpg', { type: 'image/jpeg' });
            const pngFile = new File([pngContent], 'test.png', { type: 'image/png' });
            const webpFile = new File([webpContent], 'test.webp', { type: 'image/webp' });

            expect(validateSingleFile(jpegFile).valid).toBe(true);
            expect(validateSingleFile(pngFile).valid).toBe(true);
            expect(validateSingleFile(webpFile).valid).toBe(true);
        });

        it('rejects non-image files', () => {
            const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
            const result = validateSingleFile(pdfFile);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Tipo de archivo no permitido');
        });

        it('rejects files over size limit', () => {
            // Create a mock file-like object with large size
            const largeFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
            Object.defineProperty(largeFile, 'size', { value: limits.maxFileSizeMb * 1024 * 1024 + 1 });
            
            const result = validateSingleFile(largeFile);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('excede el tamaño máximo');
        });

        it('rejects empty files', () => {
            const emptyFile = new File([''], 'empty.jpg', { type: 'image/jpeg' });
            Object.defineProperty(emptyFile, 'size', { value: 50 });
            
            const result = validateSingleFile(emptyFile);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('vacío');
            expect(result.error).toContain('demasiado pequeño');
        });
    });

    describe('validateUploadFiles', () => {
        it('validates multiple files', () => {
            const files = [
                new File(['x'.repeat(200)], 'test1.jpg', { type: 'image/jpeg' }),
                new File(['x'.repeat(200)], 'test2.png', { type: 'image/png' }),
            ];
            
            const result = validateUploadFiles(files);
            expect(result.valid).toBe(true);
            expect(result.validFiles.length).toBe(2);
        });

        it('returns errors for invalid files', () => {
            const files = [
                new File(['x'.repeat(200)], 'valid.jpg', { type: 'image/jpeg' }),
                new File(['pdf content here'], 'invalid.pdf', { type: 'application/pdf' }),
            ];
            
            const result = validateUploadFiles(files);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBe(1);
            expect(result.errors[0].file).toBe('invalid.pdf');
        });

        it('respects max files limit', () => {
            const files = Array(limits.maxFiles + 1)
                .fill(null)
                .map((_, i) => new File([`x`.repeat(200) + i], `test${i}.jpg`, { type: 'image/jpeg' }));
            
            const result = validateUploadFiles(files);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.message.includes('máximo'))).toBe(true);
        });

        it('filters out empty ghost files', () => {
            const ghostFile = new File([''], '', { type: 'image/jpeg' });
            const validFile = new File(['x'.repeat(200)], 'valid.jpg', { type: 'image/jpeg' });
            
            const result = validateUploadFiles([ghostFile, validFile]);
            expect(result.valid).toBe(true);
            expect(result.validFiles.length).toBe(1);
        });
    });
});

describe('Product Validation', () => {
    describe('validateProductFormData', () => {
        function createFormData(data: Record<string, string | null>): FormData {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.set(key, value || '');
            });
            return formData;
        }

        it('validates required fields', () => {
            const formData = createFormData({
                title: '',
                category_id: '',
            });
            
            const result = validateProductFormData(formData);
            expect(result.success).toBe(false);
            expect(result.errors.some(e => e.field === 'title')).toBe(true);
            expect(result.errors.some(e => e.field === 'category_id')).toBe(true);
        });

        it('accepts valid product data', () => {
            const formData = createFormData({
                title: 'Gibson Les Paul',
                slug: 'gibson-les-paul',
                category_id: 'cat-123',
                status: 'disponible',
            });
            
            const result = validateProductFormData(formData);
            expect(result.success).toBe(true);
            expect(result.data?.title).toBe('Gibson Les Paul');
        });

        it('validates price as non-negative', () => {
            const formData = createFormData({
                title: 'Test',
                slug: 'test',
                category_id: 'cat-123',
                status: 'disponible',
                price: '-100',
            });
            
            const result = validateProductFormData(formData);
            expect(result.success).toBe(false);
            expect(result.errors.some(e => e.field === 'price')).toBe(true);
        });

        it('validates YouTube URL hostname', () => {
            const formData = createFormData({
                title: 'Test',
                slug: 'test',
                category_id: 'cat-123',
                status: 'disponible',
                youtube_url: 'https://vimeo.com/video/123',
            });
            
            const result = validateProductFormData(formData);
            expect(result.success).toBe(false);
            expect(result.errors.some(e => e.field === 'youtube_url')).toBe(true);
        });

        it('accepts valid YouTube URLs', () => {
            const formData = createFormData({
                title: 'Test',
                slug: 'test',
                category_id: 'cat-123',
                status: 'disponible',
                youtube_url: 'https://www.youtube.com/watch?v=abc123',
            });
            
            const result = validateProductFormData(formData);
            expect(result.success).toBe(true);
        });

        it('accepts youtu.be URLs', () => {
            const formData = createFormData({
                title: 'Test',
                slug: 'test',
                category_id: 'cat-123',
                status: 'disponible',
                youtube_url: 'https://youtu.be/abc123',
            });
            
            const result = validateProductFormData(formData);
            expect(result.success).toBe(true);
        });

        it('validates year range', () => {
            const formData = createFormData({
                title: 'Test',
                slug: 'test',
                category_id: 'cat-123',
                status: 'disponible',
                year: '1800',
            });
            
            const result = validateProductFormData(formData);
            expect(result.success).toBe(true);
            
            // Out of range
            const formData2 = createFormData({
                title: 'Test',
                slug: 'test',
                category_id: 'cat-123',
                status: 'disponible',
                year: '1700',
            });
            
            const result2 = validateProductFormData(formData2);
            expect(result2.success).toBe(false);
            expect(result2.errors.some(e => e.field === 'year')).toBe(true);
        });
    });

    describe('isValidProductStatus', () => {
        it('accepts valid statuses', () => {
            expect(isValidProductStatus('disponible')).toBe(true);
            expect(isValidProductStatus('reservado')).toBe(true);
            expect(isValidProductStatus('vendido')).toBe(true);
        });

        it('rejects invalid statuses', () => {
            expect(isValidProductStatus('pending')).toBe(false);
            expect(isValidProductStatus('sold')).toBe(false);
            expect(isValidProductStatus('')).toBe(false);
        });
    });

    describe('getSupportedStatuses', () => {
        it('returns all supported statuses', () => {
            const statuses = getSupportedStatuses();
            expect(statuses).toContain('disponible');
            expect(statuses).toContain('reservado');
            expect(statuses).toContain('vendido');
            expect(statuses.length).toBe(3);
        });
    });
});
