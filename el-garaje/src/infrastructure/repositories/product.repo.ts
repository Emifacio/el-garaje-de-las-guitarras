import { type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

export const ProductRepository = {
    async findAll(options?: {
        categoryId?: string;
        isFeatured?: boolean;
        limit?: number;
        from?: number;
        to?: number;
        client?: SupabaseClient;
    }) {
        const db = options?.client || supabase;
        let query = db
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

        if (options?.from !== undefined && options?.to !== undefined) {
            query = query.range(options.from, options.to);
        } else if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async findBySlug(slug: string, client?: SupabaseClient) {
        const db = client || supabase;
        const { data, error } = await db
            .from('products')
            .select(`
                *,
                categories (*),
                product_images (*)
            `)
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    },

    async search(query: string, limit: number = 8, client?: SupabaseClient) {
        const db = client || supabase;

        // 1. Find matching categories first to include in product search
        const { data: categories } = await db
            .from('categories')
            .select('id')
            .ilike('name', `%${query}%`);
        
        const categoryIds = categories?.map(c => c.id) || [];

        // 2. Build OR conditions
        let orConditions = `title.ilike.%${query}%,brand.ilike.%${query}%`;
        if (categoryIds.length > 0) {
            orConditions += `,category_id.in.(${categoryIds.map(id => `"${id}"`).join(',')})`;
        }

        const { data, error } = await db
            .from('products')
            .select(`
                id, title, slug, short_description, price, price_display, status, brand,
                categories (name, slug),
                product_images (storage_path, alt_text, sort_order)
            `)
            .eq('status', 'disponible')
            .or(orConditions)
            .order('sort_order', { ascending: true })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }
};
