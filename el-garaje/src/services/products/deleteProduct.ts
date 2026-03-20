/**
 * Delete Product Service
 * 
 * Handles product deletion including associated images from storage.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'product-images';

export interface DeleteProductResult {
    success: boolean;
    error?: string;
}

/**
 * Delete a product by ID.
 * Also removes associated images from storage.
 */
export async function deleteProduct(
    supabase: SupabaseClient,
    productId: string
): Promise<DeleteProductResult> {
    // 1. Get product images to delete from storage
    const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('storage_path')
        .eq('product_id', productId);

    if (imagesError) {
        console.error('[DeleteProduct] Failed to fetch images:', imagesError);
        return {
            success: false,
            error: `Error al buscar imágenes del producto: ${imagesError.message}`,
        };
    }

    // 2. Delete images from storage
    if (images && images.length > 0) {
        const storagePaths = images.map(img => img.storage_path);
        const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(storagePaths);

        if (storageError) {
            console.warn('[DeleteProduct] Failed to delete some storage files:', storageError);
            // Continue anyway - storage cleanup is best-effort
        }
    }

    // 3. Delete product record (cascades to product_images via DB foreign key)
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (deleteError) {
        console.error('[DeleteProduct] Failed to delete product:', deleteError);
        return {
            success: false,
            error: `Error al eliminar el producto: ${deleteError.message}`,
        };
    }

    return { success: true };
}
