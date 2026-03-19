/**
 * Delete Product Service
 * 
 * Handles product deletion with proper error handling.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface DeleteProductResult {
    success: boolean;
    error?: string;
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(
    supabase: SupabaseClient,
    productId: string
): Promise<DeleteProductResult> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('[DeleteProduct] Failed:', error);
        return {
            success: false,
            error: `Error al eliminar el producto: ${error.message}`,
        };
    }

    return { success: true };
}
