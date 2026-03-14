export const prerender = false;
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const POST: APIRoute = async ({ cookies, request, redirect }) => {
    const supabase = createSupabaseServerClient(cookies, request);
    // Clear the session from Supabase
    await supabase.auth.signOut();
    return redirect('/admin/login', 302, {
        headers: {
            'Cache-Control': 'no-store, private'
        }
    });
};
