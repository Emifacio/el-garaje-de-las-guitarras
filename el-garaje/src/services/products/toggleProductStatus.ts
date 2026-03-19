/**
 * Toggle Product Status Service
 * 
 * Handles status toggling between disponible and vendido.
 * Admin lifecycle is simple: disponible <-> vendido.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProductStatus } from '../../lib/types';
import { isValidProductStatus } from '../../validators/product';
import { getCurrentISODate, determineSoldDate } from '../../lib/dates';

export interface ToggleProductStatusResult {
    success: boolean;
    newStatus?: ProductStatus;
    error?: string;
}

const VALID_TOGGLE_STATUSES: ProductStatus[] = ['disponible', 'vendido'];

/**
 * Toggle product status between disponible and vendido.
 * 
 * @param supabase - Supabase client
 * @param productId - Product ID to toggle
 * @param currentStatus - Current status of the product
 */
export async function toggleProductStatus(
    supabase: SupabaseClient,
    productId: string,
    currentStatus: string
): Promise<ToggleProductStatusResult> {
    // Determine next status
    const nextStatus: ProductStatus = currentStatus === 'vendido' ? 'disponible' : 'vendido';

    // Validate status
    if (!VALID_TOGGLE_STATUSES.includes(nextStatus)) {
        return {
            success: false,
            error: `Estado "${nextStatus}" no válido para toggling.`,
        };
    }

    // Determine sold_date
    const soldDate = determineSoldDate(null, nextStatus);

    // Update product
    const { error } = await supabase
        .from('products')
        .update({
            status: nextStatus,
            updated_at: getCurrentISODate(),
            sold_date: soldDate,
        })
        .eq('id', productId);

    if (error) {
        console.error('[ToggleProductStatus] Failed:', error);
        return {
            success: false,
            error: `Error al cambiar estado: ${error.message}`,
        };
    }

    return {
        success: true,
        newStatus: nextStatus,
    };
}

/**
 * Set product status to a specific value.
 */
export async function setProductStatus(
    supabase: SupabaseClient,
    productId: string,
    newStatus: string
): Promise<ToggleProductStatusResult> {
    // Validate status
    if (!isValidProductStatus(newStatus)) {
        return {
            success: false,
            error: `Estado "${newStatus}" no válido.`,
        };
    }

    // Determine sold_date
    const soldDate = determineSoldDate(null, newStatus);

    // Update product
    const { error } = await supabase
        .from('products')
        .update({
            status: newStatus,
            updated_at: getCurrentISODate(),
            sold_date: soldDate,
        })
        .eq('id', productId);

    if (error) {
        console.error('[SetProductStatus] Failed:', error);
        return {
            success: false,
            error: `Error al cambiar estado: ${error.message}`,
        };
    }

    return {
        success: true,
        newStatus: newStatus as ProductStatus,
    };
}
