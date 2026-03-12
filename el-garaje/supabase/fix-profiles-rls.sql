-- Profiles RLS fix aligned with the hardened admin setup.

alter table public.profiles enable row level security;

drop policy if exists "Profiles - select own" on public.profiles;
drop policy if exists "Profiles - insert own" on public.profiles;
drop policy if exists "Profiles - update own" on public.profiles;
drop policy if exists "Profiles can read own row" on public.profiles;
drop policy if exists "Profiles can create own row" on public.profiles;
drop policy if exists "Profiles can update own row" on public.profiles;

create policy "Profiles can read own row"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Profiles can create own row"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Profiles can update own row"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create index if not exists idx_profiles_id on public.profiles (id);
