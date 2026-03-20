/**
 * List Products Service
 * 
 * Fetches products for admin listing with related data.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '../../types';

export interface ProductWithRelations {
    id: string;
    category_id: string;
    title: string;
    slug: string;
    short_description: string | null;
    long_description?: string | null;
    price: number | null;
    price_display: string | null;
    status: string;
    badge: string | null;
    brand: string | null;
    year: number | null;
    is_featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    sold_date: string | null;
    youtube_url?: string | null;
    categories?: {
        name: string;
    } | null;
    product_images?: {
        storage_path: string;
        sort_order: number;
    }[];
}

export interface ListProductsResult {
    products: ProductWithRelations[] | null;
    error: string | null;
}

/**
 * Fetch all products for admin listing.
 * Includes category name and product images.
 */
export async function listProducts(
    supabase: SupabaseClient
): Promise<ListProductsResult> {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (name),
            product_images (storage_path, sort_order)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[ListProducts] Failed:', error);
        return {
            products: null,
            error: `Error al cargar productos: ${error.message}`,
        };
    }

    return {
        products: data as ProductWithRelations[],
        error: null,
    };
}
