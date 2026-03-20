import { supabase } from '../supabase/client';

export const CategoryRepository = {
    async findAll() {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async findBySlug(slug: string) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data;
    }
};
