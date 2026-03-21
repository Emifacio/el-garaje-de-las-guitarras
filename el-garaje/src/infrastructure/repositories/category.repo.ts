import { type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

export const CategoryRepository = {
    async findAll(client?: SupabaseClient) {
        const db = client || supabase;
        const { data, error } = await db
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async findBySlug(slug: string, client?: SupabaseClient) {
        const db = client || supabase;
        const { data, error } = await db
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    }
};
