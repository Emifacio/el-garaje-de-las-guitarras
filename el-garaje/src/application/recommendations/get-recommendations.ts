import { ProductRepository } from '../../infrastructure/repositories/product.repo';
import { toProduct } from '../../domain/product/product.mapper';
import type { Product } from '../../domain/product/product.types';

export async function getProductRecommendations(limit: number = 6): Promise<Product[]> {
    // Strategy: Featured first, then newest available
    let products = await ProductRepository.findAll({ isFeatured: true, limit });
    
    if (products.length < limit) {
        const remaining = limit - products.length;
        const additional = await ProductRepository.findAll({ limit: remaining });
        // Avoid duplicates if any
        const existingIds = new Set(products.map(p => p.id));
        additional.forEach(p => {
            if (!existingIds.has(p.id)) products.push(p);
        });
    }

    return products.map(toProduct).filter(p => !p.isSold).slice(0, limit);
}
