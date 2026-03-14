-- Safe, non-recursive RLS for public.profiles
-- Goals:
-- 1. Any authenticated user can read and update their own profile.
-- 2. Admins can read any profile.
-- 3. Avoid recursive policies on public.profiles that trigger Supabase warnings.

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Authenticated users can read own profile" on public.profiles;
drop policy if exists "Authenticated users can update own profile" on public.profiles;
drop policy if exists "Admins can read any profile" on public.profiles;

create or replace function public.is_admin_user(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and is_admin = true
  );
$$;

revoke all on function public.is_admin_user(uuid) from public;
grant execute on function public.is_admin_user(uuid) to authenticated;

create policy "Authenticated users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Authenticated users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins can read any profile"
on public.profiles
for select
to authenticated
using (public.is_admin_user(auth.uid()));
