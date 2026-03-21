/**
 * Create Product Service
 * 
 * Handles product creation with validation and image upload.
 * 
 * PARTIAL FAILURE STRATEGY:
 * - If product insert succeeds but image upload fails, we KEEP the product.
 * - Admin is notified of the partial failure via the result.
 * - This preserves admin's data entry work.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '../../domain/product/product.types';
import type { Category } from '../../domain/category/category.types';
import { validateProductFormData } from '../../validators/product';
import { resolveSlug, isValidSlug } from '../../lib/slug';
import { getCurrentISODate } from '../../lib/dates';

export interface CreateProductInput {
    formData: FormData;
}

export interface CreateProductResult {
    success: boolean;
    product?: Product;
    errors: string[];
    validationErrors?: { field: string; message: string }[];
    partialFailure?: boolean;
    partialFailureMessage?: string;
}

/**
 * Create a new product with optional images.
 * 
 * @param supabase - Supabase client
 * @param input - Form data from the create form
 * @returns Result with created product or errors
 */
export async function createProduct(
    supabase: SupabaseClient,
    input: CreateProductInput
): Promise<CreateProductResult> {
    const { formData } = input;

    // Validate form data
    const validation = validateProductFormData(formData);
    
    if (!validation.success || !validation.data) {
        return {
            success: false,
            errors: validation.errors.map(e => e.message),
            validationErrors: validation.errors,
        };
    }

    const validated = validation.data;

    // Resolve and validate slug
    const slug = resolveSlug(validated.slug, validated.title);
    
    if (!isValidSlug(slug)) {
        return {
            success: false,
            errors: ['No se pudo generar un slug válido a partir del título.'],
            validationErrors: [{ field: 'slug', message: 'Slug inválido.' }],
        };
    }

    // Check for slug collision
    const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

    if (existingProduct) {
        return {
            success: false,
            errors: [`Ya existe un producto con el slug "${slug}".`],
            validationErrors: [{ field: 'slug', message: 'Este slug ya está en uso.' }],
        };
    }

    // Build product record
    const now = getCurrentISODate();
    const productRecord = {
        title: validated.title,
        slug,
        category_id: validated.category_id,
        status: validated.status,
        price: validated.price,
        price_display: validated.price_display,
        brand: validated.brand,
        year: validated.year,
        short_description: validated.short_description,
        long_description: validated.long_description,
        badge: validated.badge,
        youtube_url: validated.youtube_url,
        is_featured: validated.is_featured,
        sort_order: validated.sort_order,
        created_at: now,
        updated_at: now,
    };

    // Insert product
    const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert(productRecord)
        .select()
        .single();

    if (insertError) {
        console.error('[CreateProduct] Insert failed:', insertError);
        return {
            success: false,
            errors: [`Error al crear el producto: ${insertError.message}`],
        };
    }

    if (!insertedProduct) {
        return {
            success: false,
            errors: ['El producto fue creado pero no se pudo recuperar.'],
        };
    }

    // 5. Handle Image Records (Paths already uploaded via separate API)
    const uploadedPathsJson = formData.get('uploaded_image_paths') as string;
    
    if (uploadedPathsJson) {
        try {
            const storagePaths = JSON.parse(uploadedPathsJson) as string[];
            
            if (storagePaths.length > 0) {
                const imageRecords = storagePaths.map((path, index) => ({
                    product_id: insertedProduct.id,
                    storage_path: path,
                    sort_order: index * 10,
                }));

                const { error: dbError } = await supabase
                    .from('product_images')
                    .insert(imageRecords);

                if (dbError) {
                    console.error('[CreateProduct] Image DB record insertion failed:', dbError);
                    return {
                        success: true,
                        product: insertedProduct as Product,
                        errors: [`Producto creado, pero falló el registro de imágenes: ${dbError.message}`],
                        partialFailure: true,
                        partialFailureMessage: 'El producto fue creado pero hubo un problema al vincular las imágenes.',
                    };
                }
            }
        } catch (parseError) {
            console.error('[CreateProduct] Failed to parse uploaded_image_paths:', parseError);
            // Non-blocking but should be logged
        }
    }

    return {
        success: true,
        product: insertedProduct as Product,
        errors: [],
    };
}

/**
 * Fetch categories for product form dropdowns.
 */
export async function fetchProductCategories(
    supabase: SupabaseClient
): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

    if (error) {
        console.error('[FetchCategories] Failed:', error);
        return [];
    }

    return (data || []) as Category[];
}
