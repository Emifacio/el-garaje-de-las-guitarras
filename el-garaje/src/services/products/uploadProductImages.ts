/**
 * Product Image Upload Service
 * 
 * Handles image upload orchestration with validation and error handling.
 * 
 * PARTIAL FAILURE STRATEGY:
 * - If product insert succeeds but image upload fails, we KEEP the product
 *   and report the partial failure to the admin.
 * - This is intentional: deleting the product would lose the data entry work.
 * - Admin can manually delete the product or retry image uploads if needed.
 * - We log upload errors for debugging but don't compensate automatically.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { validateUploadFiles } from '../../validators/uploads';

export interface UploadedImage {
    product_id: string;
    storage_path: string;
    sort_order: number;
}

export interface UploadResult {
    success: boolean;
    uploadedImages: UploadedImage[];
    errors: string[];
    partialFailure: boolean;
}

const BUCKET_NAME = 'product-images';
const SORT_ORDER_INTERVAL = 10;

/**
 * Upload product images to Supabase storage and record in database.
 * 
 * @param supabase - Supabase client
 * @param productId - Product ID to attach images to
 * @param files - Files to upload (from FormData)
 * @param startSortOrder - Starting sort order (for appending to existing images)
 */
export async function uploadProductImages(
    supabase: SupabaseClient,
    productId: string,
    files: File[],
    startSortOrder: number = 0
): Promise<UploadResult> {
    const errors: string[] = [];
    const uploadedImages: UploadedImage[] = [];

    // Validate files first
    const validation = validateUploadFiles(files);
    
    if (!validation.valid) {
        const errorMessages = validation.errors.map(e => 
            e.file ? `${e.file}: ${e.message}` : e.message
        );
        return {
            success: false,
            uploadedImages: [],
            errors: errorMessages,
            partialFailure: false,
        };
    }

    if (validation.validFiles.length === 0) {
        return {
            success: true,
            uploadedImages: [],
            errors: [],
            partialFailure: false,
        };
    }

    let sortOrderCounter = startSortOrder;

    // Upload sequentially to prevent serverless timeout issues
    for (const file of validation.validFiles) {
        try {
            const fileExt = getFileExtension(file);
            const fileName = `${productId}/${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError, data } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fileName, file);

            if (uploadError) {
                console.error(`[ImageUpload] Failed to upload ${file.name}:`, uploadError);
                errors.push(`Error al subir "${file.name}": ${uploadError.message}`);
                continue;
            }

            if (data?.path) {
                uploadedImages.push({
                    product_id: productId,
                    storage_path: data.path,
                    sort_order: sortOrderCounter,
                });
                sortOrderCounter += SORT_ORDER_INTERVAL;
            }
        } catch (err) {
            console.error(`[ImageUpload] Unexpected error uploading ${file.name}:`, err);
            errors.push(`Error inesperado al subir "${file.name}".`);
        }
    }

    // Record uploaded images in database
    if (uploadedImages.length > 0) {
        const { error: dbError } = await supabase
            .from('product_images')
            .insert(uploadedImages);

        if (dbError) {
            console.error('[ImageUpload] Failed to record images in database:', dbError);
            
            // Cleanup uploaded files since we couldn't link them
            await cleanupUploadedFiles(supabase, uploadedImages);
            
            return {
                success: false,
                uploadedImages: [],
                errors: [...errors, `Los archivos se subieron pero no pudieron vincularse: ${dbError.message}`],
                partialFailure: false,
            };
        }
    }

    return {
        success: errors.length === 0,
        uploadedImages,
        errors,
        partialFailure: errors.length > 0 && uploadedImages.length > 0,
    };
}

/**
 * Get the file extension from a file, defaulting to webp.
 */
function getFileExtension(file: File): string {
    const parts = file.name.split('.');
    const ext = parts.pop()?.toLowerCase() || 'webp';
    
    // Ensure we have a valid extension
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        return ext;
    }
    return 'webp';
}

/**
 * Clean up uploaded files when database linking fails.
 * This is a best-effort cleanup.
 */
async function cleanupUploadedFiles(
    supabase: SupabaseClient,
    images: UploadedImage[]
): Promise<void> {
    for (const image of images) {
        try {
            await supabase.storage
                .from(BUCKET_NAME)
                .remove([image.storage_path]);
        } catch (err) {
            console.warn(`[ImageUpload] Failed to cleanup ${image.storage_path}:`, err);
        }
    }
}

/**
 * Get the next sort order for appending images to a product.
 */
export async function getNextSortOrder(
    supabase: SupabaseClient,
    productId: string
): Promise<number> {
    const { data } = await supabase
        .from('product_images')
        .select('sort_order')
        .eq('product_id', productId)
        .order('sort_order', { ascending: false })
        .limit(1);

    if (data && data.length > 0) {
        return data[0].sort_order + SORT_ORDER_INTERVAL;
    }
    return 0;
}
