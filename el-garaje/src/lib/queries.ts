import { supabase } from './supabase';
import type { Category, Product } from './types';

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
        .select('*')
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
}): Promise<Product[]> {

    let query = supabase
        .from('products')
        .select(`
      *,
      categories (*),
      product_images (*)
    `)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
    }

    if (options?.isFeatured !== undefined) {
        query = query.eq('is_featured', options.isFeatured);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    // Push sold items ("vendido") to the bottom, sorted by sold_date (most recent first)
    const products = (data as Product[]) || [];
    return products.sort((a, b) => {
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
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select(`
      *,
      categories (*),
      product_images (*)
    `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching product ${slug}:`, error);
        return null;
    }

    return data as Product;
}
