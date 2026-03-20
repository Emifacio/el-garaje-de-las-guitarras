import { ProductRepository } from '../../infrastructure/repositories/product.repo';
import { CategoryRepository } from '../../infrastructure/repositories/category.repo';

export interface DashboardStatsDTO {
    productCount: number;
    categoryCount: number;
}

export async function getDashboardStats(): Promise<DashboardStatsDTO> {
    const products = await ProductRepository.findAll();
    const categories = await CategoryRepository.findAll();
    
    return {
        productCount: products.length,
        categoryCount: categories.length
    };
}
