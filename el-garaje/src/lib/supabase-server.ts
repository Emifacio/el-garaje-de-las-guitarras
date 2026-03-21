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
                    console.info('[Supabase SSR] cookies.getAll', {
                        url: request.url,
                        method: request.method,
                        cookieNames: parsed.map(cookie => cookie.name)
                    });
                    return parsed.map(cookie => ({
                        name: cookie.name,
                        value: cookie.value ?? ''
                    }));
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        console.log(`[Cookies SSR] Setting: ${name}`);

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

                        // Let the browser handle the domain automatically by not specifying it.
                        // This avoids issues where the provided domain doesn't perfectly match the host.
                        /*
                        if (import.meta.env.PROD && options?.domain) {
                            (astroOptions as any).domain = options.domain;
                        }
                        */

                        if (value === '') {
                            astroOptions.maxAge = 0;
                        }

                        console.info('[Supabase SSR] cookies.set', {
                            url: request.url,
                            method: request.method,
                            name,
                            secure: astroOptions.secure,
                            sameSite: astroOptions.sameSite,
                            hasValue: value.length > 0,
                            maxAge: astroOptions.maxAge ?? null
                        });

                        cookies.set(name, value, astroOptions);
                    });
                },
            },
        }
    );
};
