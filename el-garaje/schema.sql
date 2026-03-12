-- Initial schema for El Garaje de las Guitarras
-- Run this in the Supabase SQL Editor for a fresh project.

create extension if not exists pgcrypto;

create type public.product_status as enum ('disponible', 'vendido', 'reservado');

create table public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    nav_key text not null,
    description text,
    seo_description text,
    sort_order integer not null default 0
);

create table public.products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.categories(id) on delete restrict,
    title text not null,
    slug text not null unique,
    short_description text,
    long_description text,
    price numeric(10, 2),
    price_display text,
    status public.product_status not null default 'disponible',
    sold_date timestamptz,
    badge text,
    brand text,
    year integer,
    specifications jsonb not null default '[]'::jsonb,
    is_featured boolean not null default false,
    sort_order integer not null default 0,
    seo_title text,
    seo_description text,
    youtube_url text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table public.product_images (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    storage_path text not null,
    alt_text text,
    sort_order integer not null default 0,
    created_at timestamptz not null default timezone('utc', now())
);

create table public.profiles (
    id uuid primary key references auth.users on delete cascade,
    username text,
    full_name text,
    avatar_url text,
    is_admin boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table public.interaction_logs (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id) on delete set null,
    interaction_type text not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

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

create trigger handle_updated_at_products
before update on public.products
for each row
execute function public.set_current_timestamp_updated_at();

create trigger handle_updated_at_profiles
before update on public.profiles
for each row
execute function public.set_current_timestamp_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles enable row level security;
alter table public.interaction_logs enable row level security;

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

create index idx_profiles_is_admin on public.profiles (is_admin) where is_admin = true;
create index idx_interaction_logs_created_at on public.interaction_logs (created_at desc);
create index idx_interaction_logs_product_id on public.interaction_logs (product_id);
create index idx_interaction_logs_type on public.interaction_logs (interaction_type);
create index idx_products_category_id on public.products (category_id);
create index idx_product_images_product_id on public.product_images (product_id, sort_order);

grant execute on function public.is_admin() to authenticated;

insert into public.categories (id, name, slug, nav_key, description, sort_order) values
('b5025701-d0b4-4e4b-a2eb-4bf9d2d0c242', 'Guitarras Eléctricas', 'electricas', 'electricas', 'Colección de guitarras eléctricas vintage y de luthier.', 1),
('c4e0f117-6404-43f1-bca7-854746f33d7b', 'Guitarras Acústicas', 'acusticas', 'acusticas', 'Guitarras acústicas y clásicas con maderas asentadas.', 2),
('70ba16cb-ef23-455b-b9f1-a1ab3dfa0ef8', 'Bajos', 'bajos', 'bajos', 'Bajos vintage de colección.', 3),
('a8385e05-728b-49eb-9ea2-22591662ed72', 'Amplificadores', 'amplificadores', 'amplificadores', 'Amplificadores valvulares clásicos y cabezales.', 4),
('e9b5fbb3-936a-4b95-a42e-13c2f1f8b6d3', 'Efectos', 'efectos', 'efectos', 'Pedales de efectos: distorsión, modulación, delay, reverb, wah y más.', 5)
on conflict (slug) do nothing;

insert into public.products (id, category_id, title, slug, price_display, badge, is_featured, short_description) values
('6a42a0b2-dd84-486a-aeaf-9e54d852089c', 'b5025701-d0b4-4e4b-a2eb-4bf9d2d0c242', 'Fender Stratocaster 1962', 'fender-stratocaster-1962', 'Consultar', 'Vintage', true, 'Icono indiscutido con finish Sunburst original. Pastillas black bottom.'),
('e9dffdb2-3376-43b9-a2a1-b8f158869de4', 'b5025701-d0b4-4e4b-a2eb-4bf9d2d0c242', 'Gibson Les Paul Custom 1978', 'gibson-les-paul-custom-1978', 'USD 6,500', 'Premium', false, 'Black Beauty de la era Norlin. T-Tops originales y diapasón de ébano.'),
('f05dadd0-cfec-4286-9aeb-a006ef67e2fa', 'b5025701-d0b4-4e4b-a2eb-4bf9d2d0c242', 'Fender Telecaster Thinline 1972', 'fender-telecaster-thinline-1972', 'USD 4,200', null, false, 'Cuerpo de fresno ligero. Wide Range humbuckers diseñados por Seth Lover.'),
('b19d5b03-9b43-4dc9-9d5d-16a575a7b686', 'a8385e05-728b-49eb-9ea2-22591662ed72', 'Vox AC30 Top Boost 1964', 'vox-ac30-top-boost-1964', 'Consultar', 'Rare', true, 'El sonido de la invasión británica. Parlantes Celestion Blue Alnico originales.'),
('e74a8174-8393-41bb-a5f1-cf49fb81005b', 'a8385e05-728b-49eb-9ea2-22591662ed72', 'Fender Deluxe Reverb 1965', 'fender-deluxe-reverb-1965', 'USD 3,800', 'Blackface', false, 'El combo por excelencia para estudio y clubes. Circuito AB763 intacto.')
on conflict (slug) do nothing;
