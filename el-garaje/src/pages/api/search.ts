import type { APIRoute } from 'astro';
import { searchProducts } from '../../application/search/search-products';

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const searchCache = new Map<string, { expiresAt: number; data: unknown }>();

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const query = url.searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const cacheKey = query.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const results = await searchProducts(query);
        searchCache.set(cacheKey, { expiresAt: Date.now() + SEARCH_CACHE_TTL_MS, data: results });

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
            }
        });
    } catch (error) {
        console.error('Search API error:', error);
        return new Response(JSON.stringify([]), { status: 500 });
    }
};
