import type { SupabaseClient, User } from '@supabase/supabase-js';

type AdminProfile = {
  id: string;
  is_admin: boolean;
  full_name: string | null;
  username: string | null;
};

export type AdminAccessResult =
  | { ok: true; user: User; profile: AdminProfile }
  | { ok: false; reason: 'unauthenticated' | 'missing_profile' | 'forbidden' | 'profile_lookup_failed'; error?: string };

function createAdminDebugContext() {
  return {
    url: typeof globalThis !== 'undefined' && 'location' in globalThis ? globalThis.location?.href : undefined,
    timestamp: new Date().toISOString(),
  };
}

export async function getAdminAccess(supabase: SupabaseClient): Promise<AdminAccessResult> {
  let user;
  let userError;

  try {
    const { data: { user: foundUser }, error: foundError } = await supabase.auth.getUser();
    user = foundUser;
    userError = foundError;
  } catch (err: any) {
    console.error('[Admin Access] CRITICAL AUTH ERROR:', err);
    return { 
      ok: false, 
      reason: 'unauthenticated', 
      error: err?.message || 'Auth failure' 
    };
  }

  if (userError || !user) {
    console.warn('[Admin Access] unauthenticated', {
      ...createAdminDebugContext(),
      hasUser: Boolean(user),
      error: userError?.message ?? null,
    });
    return { ok: false, reason: 'unauthenticated', error: userError?.message };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_admin, full_name, username')
    .eq('id', user.id)
    .maybeSingle<AdminProfile>();

  if (profileError) {
    console.error('[Admin Access] profile_lookup_failed', {
      ...createAdminDebugContext(),
      userId: user.id,
      email: user.email ?? null,
      error: profileError.message,
    });
    return { ok: false, reason: 'profile_lookup_failed', error: profileError.message };
  }

  if (!profile) {
    console.warn('[Admin Access] missing_profile', {
      ...createAdminDebugContext(),
      userId: user.id,
      email: user.email ?? null,
    });
    return { ok: false, reason: 'missing_profile' };
  }

  if (!profile.is_admin) {
    console.warn('[Admin Access] forbidden', {
      ...createAdminDebugContext(),
      userId: user.id,
      email: user.email ?? null,
      profileId: profile.id,
      username: profile.username,
    });
    return { ok: false, reason: 'forbidden' };
  }

  console.info('[Admin Access] ok', {
    ...createAdminDebugContext(),
    userId: user.id,
    email: user.email ?? null,
    profileId: profile.id,
    username: profile.username,
  });
  return { ok: true, user, profile };
}

export function applyAdminNoStore(headers: Headers) {
  headers.set('Cache-Control', 'no-store, private');
  headers.set('CDN-Cache-Control', 'no-store');
  headers.set('Vercel-CDN-Cache-Control', 'no-store');
}

export function createAdminRedirect(location: string, status = 302) {
  const headers = new Headers({
    Location: location,
  });

  applyAdminNoStore(headers);

  return new Response(null, {
    status,
    headers,
  });
}
