import { ProductRepository } from '../../infrastructure/repositories/product.repo';
import { getPublicImageUrl } from '../../lib/image-utils';

export interface SearchResultDTO {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    priceLabel: string;
    status: string;
    brand: string | null;
    categoryName: string | null;
    imageUrl: string;
}

export async function searchProducts(query: string): Promise<SearchResultDTO[]> {
    if (!query || query.length < 2) return [];

    const rows = await ProductRepository.search(query);
    
    return rows.map(row => {
        const categoryData = Array.isArray(row.categories) ? row.categories[0] : row.categories;
        const coverImage = row.product_images?.length > 0 ? row.product_images[0] : null;

        const price = row.price ? parseFloat(row.price) : null;
        const priceLabel = row.price_display || (price ? `U$D ${price.toLocaleString()}` : 'Price on request');

        return {
            id: row.id,
            title: row.title,
            slug: row.slug,
            shortDescription: row.short_description,
            priceLabel,
            status: row.status,
            brand: row.brand,
            categoryName: categoryData?.name || null,
            imageUrl: getPublicImageUrl(coverImage?.storage_path) || '/logo.jpg'
        };
    });
}
