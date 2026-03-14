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

export async function getAdminAccess(supabase: SupabaseClient): Promise<AdminAccessResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, reason: 'unauthenticated', error: userError?.message };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_admin, full_name, username')
    .eq('id', user.id)
    .maybeSingle<AdminProfile>();

  if (profileError) {
    return { ok: false, reason: 'profile_lookup_failed', error: profileError.message };
  }

  if (!profile) {
    return { ok: false, reason: 'missing_profile' };
  }

  if (!profile.is_admin) {
    return { ok: false, reason: 'forbidden' };
  }

  return { ok: true, user, profile };
}

export function applyAdminNoStore(headers: Headers) {
  headers.set('Cache-Control', 'no-store, private');
}
