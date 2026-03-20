/**
 * Update Product Service
 * 
 * Handles product updates with validation and image upload.
 * 
 * PARTIAL FAILURE STRATEGY:
 * - If product update succeeds but new image uploads fail, we KEEP the updated product.
 * - Admin is notified of the partial failure via the result.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '../../domain/product/product.types';
type ProductImage = any;
import { validateProductFormData, type ValidationResult } from '../../validators/product';
import { resolveSlug, isValidSlug } from '../../lib/slug';
import { getCurrentISODate, parseSoldDate, determineSoldDate } from '../../lib/dates';
import { uploadProductImages, getNextSortOrder } from './uploadProductImages';

export interface UpdateProductInput {
    productId: string;
    formData: FormData;
    currentProduct?: Product;
}

export interface UpdateProductResult {
    success: boolean;
    product?: Product;
    errors: string[];
    validationErrors?: { field: string; message: string }[];
    partialFailure?: boolean;
    partialFailureMessage?: string;
}

/**
 * Update an existing product with optional new images.
 * 
 * @param supabase - Supabase client
 * @param input - Product ID and form data from the edit form
 * @returns Result with updated product or errors
 */
export async function updateProduct(
    supabase: SupabaseClient,
    input: UpdateProductInput
): Promise<UpdateProductResult> {
    const { productId, formData, currentProduct } = input;
    const errors: string[] = [];

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

    // Check for slug collision (excluding current product)
    const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .neq('id', productId)
        .maybeSingle();

    if (existingProduct) {
        return {
            success: false,
            errors: [`Ya existe otro producto con el slug "${slug}".`],
            validationErrors: [{ field: 'slug', message: 'Este slug ya está en uso.' }],
        };
    }

    // Handle sold_date
    const parsedSoldDate = parseSoldDate(validated.sold_date);
    const soldDate = determineSoldDate(parsedSoldDate, validated.status);

    // Build update record
    const updateRecord = {
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
        updated_at: getCurrentISODate(),
        sold_date: soldDate,
    };

    // Update product
    const { error: updateError } = await supabase
        .from('products')
        .update(updateRecord)
        .eq('id', productId);

    if (updateError) {
        console.error('[UpdateProduct] Update failed:', updateError);
        return {
            success: false,
            errors: [`Error al actualizar el producto: ${updateError.message}`],
        };
    }

    // Fetch updated product
    const { data: updatedProduct, error: fetchError } = await supabase
        .from('products')
        .select('*, product_images(id, storage_path, sort_order)')
        .eq('id', productId)
        .single();

    if (fetchError || !updatedProduct) {
        console.error('[UpdateProduct] Fetch after update failed:', fetchError);
        // Product was updated, just couldn't fetch it back
    }

    // Handle image deletions
    const deleteImageIds = formData.getAll('delete_images') as string[];
    if (deleteImageIds.length > 0) {
        console.log(`[UpdateProduct] Deleting ${deleteImageIds.length} images:`, deleteImageIds);
        
        // Fetch storage paths to delete from storage bucket
        const { data: imagesToDelete, error: fetchPathsError } = await supabase
            .from('product_images')
            .select('storage_path')
            .in('id', deleteImageIds);

        if (fetchPathsError) {
            console.error('[UpdateProduct] Error fetching paths for deletion:', fetchPathsError);
        } else if (imagesToDelete && imagesToDelete.length > 0) {
            const paths = imagesToDelete.map(img => img.storage_path);
            const { error: storageError } = await supabase.storage.from('product_images').remove(paths);
            if (storageError) console.error('[UpdateProduct] Storage deletion error:', storageError);
        }

        const { error: deleteError } = await supabase
            .from('product_images')
            .delete()
            .in('id', deleteImageIds);

        if (deleteError) {
            console.error('[UpdateProduct] Database deletion failed:', deleteError);
            errors.push(`No se pudieron eliminar algunas imágenes de la base de datos: ${deleteError.message}`);
        }
    }

    // Handle image reordering
    // IMPORTANT: image_order must contain ALL remaining image IDs in order
    const imageOrder = formData.get('image_order') as string;
    console.log('[UpdateProduct] REORDER DEBUG - Raw image_order from form:', imageOrder);
    
    if (imageOrder && imageOrder.trim().length > 0) {
        const orderedIds = imageOrder.split(',').filter(id => id.length > 0);
        console.log(`[UpdateProduct] Processing reorder for ${orderedIds.length} images:`, orderedIds);
        
        const SORT_ORDER_INTERVAL = 10;
        
        const reorderPromises = orderedIds.map((id, index) => {
            const newSortOrder = index * SORT_ORDER_INTERVAL;
            console.log(`[UpdateProduct] Updating image ${id} -> sort_order ${newSortOrder}`);
            return supabase
                .from('product_images')
                .update({ sort_order: newSortOrder })
                .eq('id', id);
        });

        const reorderResults = await Promise.all(reorderPromises);
        const reorderErrors = reorderResults.filter(r => r.error);
        
        if (reorderErrors.length > 0) {
            console.error(`[UpdateProduct] ${reorderErrors.length} reorder operations failed.`);
            reorderErrors.forEach(r => {
                console.error('[UpdateProduct] Supabase Reorder Error:', r.error);
                errors.push(`Error en reordenamiento: ${r.error?.message || 'Error de base de datos'}`);
            });
        } else {
            console.log('[UpdateProduct] Reordering successful for all images.');
        }
    } else {
        console.log('[UpdateProduct] No image_order provided or it was empty.');
    }

    // Handle new image uploads
    const imageFiles = (formData.getAll('images') as File[]).filter(f => f.size > 0);
    
    if (imageFiles.length > 0) {
        const nextSortOrder = await getNextSortOrder(supabase, productId);
        
        const uploadResult = await uploadProductImages(
            supabase,
            productId,
            imageFiles,
            nextSortOrder
        );

        if (uploadResult.partialFailure) {
            return {
                success: true,
                product: (updatedProduct || currentProduct) as Product,
                errors: uploadResult.errors,
                partialFailure: true,
                partialFailureMessage: `Producto actualizado, pero falló la subida de ${uploadResult.errors.length} imagen(es).`,
            };
        }

        if (!uploadResult.success) {
            return {
                success: true,
                product: (updatedProduct || currentProduct) as Product,
                errors: uploadResult.errors,
                partialFailure: true,
                partialFailureMessage: `Producto actualizado, pero no se pudieron subir las imágenes.`,
            };
        }
    }

    return {
        success: errors.length === 0,
        product: (updatedProduct || currentProduct) as Product,
        errors: errors,
    };
}

/**
 * Fetch a single product by ID for the edit form.
 */
export async function fetchProductForEdit(
    supabase: SupabaseClient,
    productId: string
): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*, product_images(id, storage_path, sort_order)')
        .eq('id', productId)
        .single();

    if (error) {
        console.error('[FetchProductForEdit] Failed:', error);
        return null;
    }

    return data as Product;
}
