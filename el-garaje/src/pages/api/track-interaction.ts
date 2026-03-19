import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { VALID_INTERACTION_TYPES, type InteractionTypeValue } from '../../lib/interaction-types';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { product_id, interaction_type, metadata } = body;

        if (!interaction_type) {
            return new Response(
                JSON.stringify({ error: 'interaction_type is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!isValidInteractionType(interaction_type)) {
            return new Response(
                JSON.stringify({ error: 'Invalid interaction_type' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { error } = await supabase
            .from('interaction_logs')
            .insert({
                product_id: product_id || null,
                interaction_type: interaction_type as InteractionTypeValue,
                metadata: metadata || {}
            });

        if (error) {
            console.error('Error logging interaction:', error);
            return new Response(
                JSON.stringify({ error: 'Failed to log interaction' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        console.error('Track interaction error:', err);
        return new Response(
            JSON.stringify({ error: 'Server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

function isValidInteractionType(value: string): value is InteractionTypeValue {
    return VALID_INTERACTION_TYPES.includes(value as InteractionTypeValue);
}
