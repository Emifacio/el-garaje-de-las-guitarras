import { CategoryRepository } from '../../infrastructure/repositories/category.repo';
import { ProductRepository } from '../../infrastructure/repositories/product.repo';
import { toProduct } from '../../domain/product/product.mapper';
import type { Product } from '../../domain/product/product.types';

export interface CategoryPageDTO {
    category: {
        id: string;
        name: string;
        description: string | null;
        seoDescription: string | null;
    };
    products: Product[];
}

export async function getCategoryPage(slug: string): Promise<CategoryPageDTO | null> {
    const categoryRow = await CategoryRepository.findBySlug(slug);
    if (!categoryRow) return null;

    const productsRows = await ProductRepository.findAll({ categoryId: categoryRow.id });
    
    // Sort sold items to bottom
    const products = productsRows
        .map(toProduct)
        .sort((a, b) => (a.isSold === b.isSold ? 0 : a.isSold ? 1 : -1));

    return {
        category: {
            id: categoryRow.id,
            name: categoryRow.name,
            description: categoryRow.description,
            seoDescription: categoryRow.seo_description
        },
        products
    };
}
