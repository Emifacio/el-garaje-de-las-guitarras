import { createServerClient, parseCookieHeader, type CookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export const createSupabaseServerClient = (
    cookies: AstroCookies, 
    request: Request,
    options?: { admin?: boolean }
) => {
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const cookieHeader = request.headers.get('Cookie') ?? '';
    const cookieNames = parseCookieHeader(cookieHeader).map(cookie => cookie.name);

    // Use Service Role Key if admin is requested and the key exists
    const isServerAdmin = options?.admin && !!import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseKey = isServerAdmin 
        ? import.meta.env.SUPABASE_SERVICE_ROLE_KEY 
        : import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    console.info(`[Supabase SSR] createServerClient (${isServerAdmin ? 'ADMIN' : 'PUBLIC'})`, {
        url: request.url,
        method: request.method,
    });

    return createServerClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    const parsed = parseCookieHeader(request.headers.get('Cookie') ?? '');
                    // Only return supabase-related cookies to reduce header size passed to the client
                    const filtered = parsed.filter(cookie => cookie.name.startsWith('sb-'));
                    
                    console.info(`[Supabase SSR] cookies.getAll: ${filtered.length}/${parsed.length} cookies filtered`);
                    
                    return filtered.map(cookie => ({
                        name: cookie.name,
                        value: cookie.value ?? ''
                    }));
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        console.info(`[Supabase SSR] cookies.set: ${name}`);

                        // Chunk Cleanup: If we are setting the main token or first chunk, 
                        // try to clear any potentially stale higher chunks from previous sessions.
                        if (name.includes('-auth-token') && !name.includes('.chunk')) {
                             cookieNames.filter(cn => cn.startsWith(name + '.chunk.')).forEach(oldChunk => {
                                 if (!cookiesToSet.find(c => c.name === oldChunk)) {
                                     console.info(`[Supabase SSR] Clearing stale chunk: ${oldChunk}`);
                                     cookies.set(oldChunk, '', { path: '/', maxAge: 0 });
                                 }
                             });
                        }

                        // Parse options to ensure Astro accepts them perfectly
                        let sameSiteVal: true | false | "lax" | "strict" | "none" | undefined = 'lax';
                        if (typeof options?.sameSite === 'string') {
                            if (options.sameSite.toLowerCase() === 'strict') sameSiteVal = 'strict';
                            if (options.sameSite.toLowerCase() === 'none') sameSiteVal = 'none';
                        }

                        const isSecure = request.url.startsWith('https://') || 
                                        request.headers.get('x-forwarded-proto') === 'https';

                        const astroOptions = {
                            path: '/',
                            secure: isSecure,
                            httpOnly: true,
                            sameSite: sameSiteVal,
                            maxAge: options?.maxAge
                        };

                        if (value === '') {
                            astroOptions.maxAge = 0;
                        }

                        cookies.set(name, value, astroOptions);
                    });
                },
            },
        }
    );
};
