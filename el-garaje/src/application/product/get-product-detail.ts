import { ProductRepository } from '../../infrastructure/repositories/product.repo';
import { toProduct } from '../../domain/product/product.mapper';
import type { Product } from '../../domain/product/product.types';

export async function getProductDetail(slug: string): Promise<Product | null> {
    try {
        const row = await ProductRepository.findBySlug(slug);
        if (!row) return null;
        return toProduct(row);
    } catch (error) {
        console.error(`Error fetching product depth for slug: ${slug}`, error);
        return null;
    }
}
