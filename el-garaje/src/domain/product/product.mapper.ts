import type { Product, ProductStatus } from './product.types';
import { getPublicImageUrl } from '../../lib/image-utils';

/**
 * Parses a YouTube URL to get the embed URL.
 * Handles patterns: youtu.be, youtube.com/watch, youtube.com/embed
 */
export function getYoutubeEmbedUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    
    let videoId = '';
    
    if(url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if(url.includes('youtube.com/watch')) {
        try {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get('v') || '';
        } catch(e) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            videoId = urlParams.get('v') || '';
        }
    } else if(url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : null;
}

export const toProduct = (row: any): Product => {
    // Categories can be an object, an array, or null from Joins
    const categoryData = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    
    // Images are usually a joined table
    const images = (row.product_images || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => getPublicImageUrl(img.storage_path));

    const price = row.price ? parseFloat(row.price) : null;
    const priceLabel = row.price_display || (price ? `U$D ${price.toLocaleString()}` : 'Price on request');

    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        shortDescription: row.short_description,
        longDescription: row.long_description,
        price,
        priceLabel,
        status: row.status as ProductStatus,
        isSold: row.status === 'vendido',
        isFeatured: !!row.is_featured,
        badge: row.badge,
        brand: row.brand,
        year: row.year,
        specifications: row.specifications,
        youtubeUrl: row.youtube_url,
        youtubeEmbedUrl: getYoutubeEmbedUrl(row.youtube_url),
        category: categoryData ? {
            id: categoryData.id,
            name: categoryData.name,
            slug: categoryData.slug
        } : null,
        images: images || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        soldDate: row.sold_date
    };
};
