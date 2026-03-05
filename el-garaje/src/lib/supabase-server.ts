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

                        const astroOptions = {
                            path: '/',
                            secure: import.meta.env.PROD, // Override to explicitly false on local HTTP to avoid drops
                            httpOnly: true,
                            sameSite: sameSiteVal,
                            maxAge: options?.maxAge
                        };

                        // Only add domain if it is provided AND we're in production, 
                        // as browsers often reject explicitly setting domain="localhost"
                        if (import.meta.env.PROD && options?.domain) {
                            (astroOptions as any).domain = options.domain;
                        }

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
