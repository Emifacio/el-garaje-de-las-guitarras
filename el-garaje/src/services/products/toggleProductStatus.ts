/**
 * Toggle Product Status Service
 * 
 * Handles 3-state status cycling: disponible -> reservado -> vendido -> disponible.
 * - disponible: Available for sale
 * - reservado: Reserved (soft commercial signal, no inventory lock)
 * - vendido: Sold (sets sold_date)
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

const ALL_STATUSES: ProductStatus[] = ['disponible', 'reservado', 'vendido'];

function getNextStatus(currentStatus: string): ProductStatus {
    const currentIndex = ALL_STATUSES.indexOf(currentStatus as ProductStatus);
    if (currentIndex === -1) return 'disponible';
    const nextIndex = (currentIndex + 1) % ALL_STATUSES.length;
    return ALL_STATUSES[nextIndex];
}

/**
 * Toggle product status through 3-state cycle: disponible -> reservado -> vendido -> disponible.
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
    // Determine next status (cycle through 3 states)
    const nextStatus = getNextStatus(currentStatus);

    // Validate status
    if (!isValidProductStatus(nextStatus)) {
        return {
            success: false,
            error: `Estado "${nextStatus}" no válido para toggling.`,
        };
    }

    // Determine sold_date (only set when transitioning to vendido)
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
