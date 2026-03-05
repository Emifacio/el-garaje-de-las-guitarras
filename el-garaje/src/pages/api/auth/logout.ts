export const prerender = false;
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export const POST: APIRoute = async ({ cookies, redirect }) => {
    const supabase = createSupabaseServerClient(cookies);
    // Clear the session from Supabase
    await supabase.auth.signOut();
    return redirect('/admin/login');
};
