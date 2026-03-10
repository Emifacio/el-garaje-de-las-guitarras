import { supabase } from './supabase';
import type { Category, Product } from './types';

const PRODUCTS_CACHE_TTL_MS = 5 * 60 * 1000;
const productsCache = new Map<string, { expiresAt: number; data: Product[] }>();

// Categories
export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .select('id,name,slug,nav_key,description,seo_description,sort_order')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching category ${slug}:`, error);
        return null;
    }
    return data;
}

// Products
export async function getProducts(options?: {
    categoryId?: string;
    isFeatured?: boolean;
    limit?: number;
    page?: number;
    pageSize?: number;
}): Promise<Product[]> {

    const pageSize = options?.pageSize ?? Math.min(options?.limit ?? 24, 24);
    const page = Math.max(1, options?.page ?? 1);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const cacheKey = JSON.stringify({
        categoryId: options?.categoryId ?? null,
        isFeatured: options?.isFeatured ?? null,
        page,
        pageSize
    });

    const cached = productsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    let query = supabase
        .from('products')
        .select(`
      id,category_id,title,slug,short_description,price,price_display,status,badge,brand,year,is_featured,sort_order,youtube_url,created_at,updated_at,sold_date,
      categories (id,name,slug,nav_key,sort_order,description,seo_description),
      product_images (id,storage_path,alt_text,sort_order,created_at)
    `)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
    }

    if (options?.isFeatured !== undefined) {
        query = query.eq('is_featured', options.isFeatured);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    // Push sold items ("vendido") to the bottom, sorted by sold_date (most recent first)
    const products = (data as Product[]) || [];
    const sorted = products.sort((a, b) => {
        const aIsSold = a.status === 'vendido' ? 1 : 0;
        const bIsSold = b.status === 'vendido' ? 1 : 0;
        if (aIsSold !== bIsSold) return aIsSold - bIsSold;
        // Both sold: sort by sold_date descending (most recent first)
        if (aIsSold && bIsSold) {
            const aDate = (a as any).sold_date ? new Date((a as any).sold_date).getTime() : 0;
            const bDate = (b as any).sold_date ? new Date((b as any).sold_date).getTime() : 0;
            return bDate - aDate;
        }
        return 0;
    });

    productsCache.set(cacheKey, { expiresAt: Date.now() + PRODUCTS_CACHE_TTL_MS, data: sorted });
    return sorted;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select(`
      id,category_id,title,slug,short_description,long_description,price,price_display,status,badge,brand,year,specifications,is_featured,sort_order,youtube_url,seo_title,seo_description,created_at,updated_at,sold_date,
      categories (id,name,slug,nav_key,sort_order,description,seo_description),
      product_images (id,storage_path,alt_text,sort_order,created_at)
    `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching product ${slug}:`, error);
        return null;
    }

    return data as Product;
}
