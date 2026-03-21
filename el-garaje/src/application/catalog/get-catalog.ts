import { type SupabaseClient } from '@supabase/supabase-js';
import { ProductRepository } from '../../infrastructure/repositories/product.repo';
import { toProduct } from '../../domain/product/product.mapper';
import type { Product } from '../../domain/product/product.types';

export async function getCatalogPage(client?: SupabaseClient): Promise<Product[]> {
    const rows = await ProductRepository.findAll({ client });
    const products = rows.map(toProduct);
    
    // Business Rule: Push sold items ("vendido") to the bottom
    // This logic is now centralized in the application layer
    return products.sort((a, b) => {
        if (a.isSold !== b.isSold) return a.isSold ? 1 : -1;
        
        // Both sold: sort by sold_date descending (most recent first)
        if (a.isSold && b.isSold) {
            const aDate = a.soldDate ? new Date(a.soldDate).getTime() : 0;
            const bDate = b.soldDate ? new Date(b.soldDate).getTime() : 0;
            return bDate - aDate;
        }
        return 0;
    });
}
