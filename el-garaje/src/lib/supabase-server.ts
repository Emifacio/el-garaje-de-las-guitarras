import { createServerClient, parseCookieHeader, type CookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export const createSupabaseServerClient = (cookies: AstroCookies, request: Request) => {
    return createServerClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    const parsed = parseCookieHeader(request.headers.get('Cookie') ?? '');
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

                        cookies.set(name, value, astroOptions);
                    });
                },
            },
        }
    );
};
