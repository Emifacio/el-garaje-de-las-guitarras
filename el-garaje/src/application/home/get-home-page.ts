import { ProductRepository } from '../../infrastructure/repositories/product.repo';
import { toProduct } from '../../domain/product/product.mapper';
import type { Product } from '../../domain/product/product.types';

export async function getHomePageFeatured(): Promise<Product[]> {
    const rows = await ProductRepository.findAll({ isFeatured: true, limit: 3 });
    return rows.map(toProduct);
}
