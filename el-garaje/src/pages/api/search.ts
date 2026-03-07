import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const query = url.searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { data, error } = await supabase
        .from('products')
        .select(`
            id, title, slug, short_description, price, price_display, status, brand,
            categories (name, slug),
            product_images (storage_path, alt_text, sort_order)
        `)
        .ilike('title', `%${query}%`)
        .order('sort_order', { ascending: true })
        .limit(8);

    if (error) {
        console.error('Search error:', error);
        return new Response(JSON.stringify([]), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Build public image URLs server-side
    const results = (data || []).map(product => {
        const coverImage = product.product_images
            ?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];

        let imageUrl = '';
        if (coverImage?.storage_path) {
            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(coverImage.storage_path);
            imageUrl = urlData.publicUrl;
        }

        return {
            id: product.id,
            title: product.title,
            slug: product.slug,
            short_description: product.short_description,
            price: product.price,
            price_display: product.price_display,
            status: product.status,
            brand: product.brand,
            category: product.categories,
            imageUrl
        };
    });

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
