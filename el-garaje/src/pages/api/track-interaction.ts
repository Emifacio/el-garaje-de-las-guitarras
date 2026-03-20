import type { APIRoute } from 'astro';
import { logInteraction } from '../../application/interactions/log-interaction';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { product_id, interaction_type, metadata } = body;

        if (!interaction_type) {
            return new Response(JSON.stringify({ error: 'interaction_type is required' }), { status: 400 });
        }

        await logInteraction({
            product_id: product_id || null,
            interaction_type,
            metadata: metadata || {}
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        console.error('Track interaction API error:', err);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
};
