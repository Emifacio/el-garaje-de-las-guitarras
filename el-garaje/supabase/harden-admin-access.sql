-- Hardening patch for an existing El Garaje Supabase project.
-- Run this once in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key references auth.users on delete cascade,
    username text,
    full_name text,
    avatar_url text,
    is_admin boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.profiles add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles enable row level security;
alter table public.interaction_logs enable row level security;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, username, full_name, avatar_url)
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'avatar_url'
    )
    on conflict (id) do update
    set
        username = coalesce(excluded.username, public.profiles.username),
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = timezone('utc', now());

    return new;
end;
$$;

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

create or replace function public.set_admin_by_email(target_email text, make_admin boolean default true)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.profiles p
    set
        is_admin = make_admin,
        updated_at = timezone('utc', now())
    from auth.users u
    where u.id = p.id
      and lower(u.email) = lower(target_email);

    if not found then
        raise exception 'No auth user found for email %', target_email;
    end if;
end;
$$;

drop trigger if exists handle_updated_at_products on public.products;
create trigger handle_updated_at_products
before update on public.products
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists handle_updated_at_profiles on public.profiles;
create trigger handle_updated_at_profiles
before update on public.profiles
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into public.profiles (id, username, full_name, avatar_url)
select
    u.id,
    coalesce(u.raw_user_meta_data ->> 'username', split_part(u.email, '@', 1)),
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do update
set
    username = coalesce(excluded.username, public.profiles.username),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

drop policy if exists "Allow public read access to categories" on public.categories;
drop policy if exists "Allow authenticated full access to categories" on public.categories;
drop policy if exists "Categories are publicly readable" on public.categories;
drop policy if exists "Admins can insert categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Admins can delete categories" on public.categories;

create policy "Categories are publicly readable"
on public.categories
for select
to public
using (true);

create policy "Admins can insert categories"
on public.categories
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update categories"
on public.categories
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete categories"
on public.categories
for delete
to authenticated
using ((select public.is_admin()));

drop policy if exists "Allow public read access to products" on public.products;
drop policy if exists "Allow authenticated full access to products" on public.products;
drop policy if exists "Products are publicly readable" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

create policy "Products are publicly readable"
on public.products
for select
to public
using (true);

create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update products"
on public.products
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete products"
on public.products
for delete
to authenticated
using ((select public.is_admin()));

drop policy if exists "Allow public read access to product_images" on public.product_images;
drop policy if exists "Allow authenticated full access to product_images" on public.product_images;
drop policy if exists "Product images are publicly readable" on public.product_images;
drop policy if exists "Admins can insert product images" on public.product_images;
drop policy if exists "Admins can update product images" on public.product_images;
drop policy if exists "Admins can delete product images" on public.product_images;

create policy "Product images are publicly readable"
on public.product_images
for select
to public
using (true);

create policy "Admins can insert product images"
on public.product_images
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update product images"
on public.product_images
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete product images"
on public.product_images
for delete
to authenticated
using ((select public.is_admin()));

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

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Full Access" on storage.objects;
drop policy if exists "Product images are publicly readable" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images objects" on storage.objects;
drop policy if exists "Admins can delete product images objects" on storage.objects;

create policy "Product images are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'product-images'
    and (select public.is_admin())
);

create policy "Admins can update product images objects"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'product-images'
    and (select public.is_admin())
)
with check (
    bucket_id = 'product-images'
    and (select public.is_admin())
);

create policy "Admins can delete product images objects"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'product-images'
    and (select public.is_admin())
);

create index if not exists idx_profiles_is_admin on public.profiles (is_admin) where is_admin = true;
create index if not exists idx_interaction_logs_created_at on public.interaction_logs (created_at desc);
create index if not exists idx_interaction_logs_product_id on public.interaction_logs (product_id);
create index if not exists idx_interaction_logs_type on public.interaction_logs (interaction_type);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_product_images_product_id on public.product_images (product_id, sort_order);

grant execute on function public.is_admin() to authenticated;
