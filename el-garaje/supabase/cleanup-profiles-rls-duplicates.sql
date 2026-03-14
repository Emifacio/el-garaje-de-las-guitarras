-- Remove duplicate legacy policies from public.profiles.
-- Keep the newer set:
-- - Authenticated users can read own profile
-- - Authenticated users can update own profile
-- - Admins can read any profile
-- - Profiles can create own row

drop policy if exists "Profiles can read own row" on public.profiles;
drop policy if exists "Profiles can update own row" on public.profiles;
