/**
 * Admin Auth Service
 * 
 * Reusable admin access check that wraps existing admin behavior.
 * Provides consistent redirect semantics across admin pages.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getAdminAccess, applyAdminNoStore, type AdminAccessResult } from '../../lib/admin';

export { type AdminAccessResult };

export type RequireAdminResponse = 
    | { success: true; access: AdminAccessResult }
    | { success: false; redirect: Response };

/**
 * Require admin access for a request.
 * Returns redirect response if not authorized.
 */
export async function requireAdmin(supabase: SupabaseClient): Promise<RequireAdminResponse> {
    const access = await getAdminAccess(supabase);

    if (!access.ok) {
        if (access.reason === 'forbidden' || access.reason === 'missing_profile') {
            await supabase.auth.signOut();
            return {
                success: false,
                redirect: createRedirect('/admin/login?error=not_admin'),
            };
        }

        if (access.reason === 'unauthenticated') {
            return {
                success: false,
                redirect: createRedirect('/admin/login'),
            };
        }

        return {
            success: false,
            redirect: createRedirect('/admin/login'),
        };
    }

    return { success: true, access };
}

/**
 * Apply no-store headers for admin responses.
 */
export function applyAdminHeaders(headers: Headers): void {
    applyAdminNoStore(headers);
}

function createRedirect(location: string): Response {
    const headers = new Headers({ Location: location });
    applyAdminNoStore(headers);
    return new Response(null, { status: 302, headers });
}
