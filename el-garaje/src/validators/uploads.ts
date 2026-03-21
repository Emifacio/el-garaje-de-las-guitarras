/**
 * Upload Validation Module
 * 
 * Provides server-side validation for uploaded files.
 * Security: Do not trust client-side validation alone.
 */

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'jfif', 'png', 'webp'] as const;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_REQUEST = 20;
const MIN_FILE_SIZE_BYTES = 100; // Reject ghost/empty files

export interface UploadValidationError {
    file?: string;
    message: string;
}

export interface UploadValidationResult {
    valid: boolean;
    errors: UploadValidationError[];
    validFiles: File[];
}

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate a single file's MIME type.
 * More secure than checking extension alone.
 */
export function validateFileMimeType(file: File): FileValidationResult {
    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
        return {
            valid: false,
            error: `Tipo de archivo no permitido: ${file.type}. Solo se aceptan JPG, PNG y WEBP.`,
        };
    }
    return { valid: true };
}

/**
 * Validate a single file's extension.
 * Used as secondary check.
 */
export function validateFileExtension(file: File): FileValidationResult {
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';
    
    if (!ALLOWED_EXTENSIONS.includes(extension as typeof ALLOWED_EXTENSIONS[number])) {
        return {
            valid: false,
            error: `Extensión no permitida: .${extension}. Solo se aceptan JPG, JFIF, PNG y WEBP.`,
        };
    }
    return { valid: true };
}

/**
 * Validate a single file's size.
 */
export function validateFileSize(file: File): FileValidationResult {
    if (file.size < MIN_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `El archivo "${file.name}" está vacío o es demasiado pequeño.`,
        };
    }
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `El archivo "${file.name}" excede el tamaño máximo de ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
        };
    }
    return { valid: true };
}

/**
 * Validate a single file comprehensively.
 */
export function validateSingleFile(file: File): FileValidationResult {
    // Check MIME type first (most secure)
    const mimeResult = validateFileMimeType(file);
    if (!mimeResult.valid) return mimeResult;

    // Check extension as secondary validation
    const extResult = validateFileExtension(file);
    if (!extResult.valid) return extResult;

    // Check size
    const sizeResult = validateFileSize(file);
    if (!sizeResult.valid) return sizeResult;

    return { valid: true };
}

/**
 * Validate multiple files for upload.
 * Filters out empty ghost files and validates each.
 */
export function validateUploadFiles(files: File[]): UploadValidationResult {
    const errors: UploadValidationError[] = [];
    const validFiles: File[] = [];

    // Filter out empty ghost files that browsers sometimes submit
    const nonEmptyFiles = files.filter(file => file.size > 0 && file.name);
    
    if (nonEmptyFiles.length > MAX_FILES_PER_REQUEST) {
        errors.push({
            message: `Se permiten máximo ${MAX_FILES_PER_REQUEST} imágenes por solicitud. Se seleccionaron ${nonEmptyFiles.length}.`,
        });
        return { valid: false, errors, validFiles: [] };
    }

    for (const file of nonEmptyFiles) {
        const result = validateSingleFile(file);
        if (result.valid) {
            validFiles.push(file);
        } else {
            errors.push({
                file: file.name,
                message: result.error || 'Archivo no válido.',
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        validFiles,
    };
}

/**
 * Get upload limits for UI display.
 */
export function getUploadLimits() {
    return {
        maxFiles: MAX_FILES_PER_REQUEST,
        maxFileSizeMb: MAX_FILE_SIZE_BYTES / (1024 * 1024),
        minFileSizeBytes: MIN_FILE_SIZE_BYTES,
        allowedTypes: [...ALLOWED_MIME_TYPES],
        allowedExtensions: [...ALLOWED_EXTENSIONS],
    };
}
