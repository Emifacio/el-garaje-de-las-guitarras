import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const envError = 'Supabase credentials missing! Check PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.';
  if (typeof window !== 'undefined') {
    console.warn(envError);
  } else {
    // Sharp error on server to help diagnose "fetch failed" in logs
    console.error(`[Supabase Client] CRITICAL: ${envError}`);
  }
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
