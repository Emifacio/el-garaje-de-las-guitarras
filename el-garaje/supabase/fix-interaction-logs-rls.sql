-- Interaction logs RLS fix aligned with the hardened admin setup.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (
            select p.is_admin
            from public.profiles p
            where p.id = (select auth.uid())
        ),
        false
    );
$$;

alter table public.interaction_logs enable row level security;

drop policy if exists "Allow public insert to interaction_logs" on public.interaction_logs;
drop policy if exists "Allow authenticated full access to interaction_logs" on public.interaction_logs;
drop policy if exists "Public can write interaction logs" on public.interaction_logs;
drop policy if exists "Admins can read interaction logs" on public.interaction_logs;
drop policy if exists "Admins can delete interaction logs" on public.interaction_logs;

create policy "Public can write interaction logs"
on public.interaction_logs
for insert
to public
with check (
    nullif(trim(interaction_type), '') is not null
    and jsonb_typeof(metadata) = 'object'
);

create policy "Admins can read interaction logs"
on public.interaction_logs
for select
to authenticated
using ((select public.is_admin()));

create policy "Admins can delete interaction logs"
on public.interaction_logs
for delete
to authenticated
using ((select public.is_admin()));

create index if not exists idx_interaction_logs_created_at on public.interaction_logs (created_at desc);
create index if not exists idx_interaction_logs_product_id on public.interaction_logs (product_id);
create index if not exists idx_interaction_logs_type on public.interaction_logs (interaction_type);

grant execute on function public.is_admin() to authenticated;
