-- Initial Schema for El Garaje de Las Guitarras
-- Run this in the Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    nav_key TEXT NOT NULL,
    description TEXT,
    seo_description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 2. Create products table
CREATE TYPE public.product_status AS ENUM ('disponible', 'vendido', 'reservado');

CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    long_description TEXT,
    price DECIMAL(10,2),
    price_display TEXT,
    status public.product_status DEFAULT 'disponible',
    badge TEXT,
    brand TEXT,
    year INTEGER,
    specifications JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create product_images table
CREATE TABLE public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Set up Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Allow public read access to categories"
    ON public.categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access to products"
    ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow public read access to product_images"
    ON public.product_images FOR SELECT USING (true);

-- Allow authenticated users (Admins) full access
CREATE POLICY "Allow authenticated full access to categories"
    ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to products"
    ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to product_images"
    ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 5. Create Storage Bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

CREATE POLICY "Authenticated Full Access" 
ON storage.objects FOR ALL 
TO authenticated 
USING ( bucket_id = 'product-images' )
WITH CHECK ( bucket_id = 'product-images' );

-- 6. Insert Seed Data - Categories
INSERT INTO public.categories (id, name, slug, nav_key, description, sort_order) VALUES
('b5025701-d0b4-4e4b-a2eb-4bf9d2d0c242', 'Guitarras Eléctricas', 'electricas', 'electricas', 'Colección de guitarras eléctricas vintage y de luthier.', 1),
('c4e0f117-6404-43f1-bca7-854746f33d7b', 'Guitarras Acústicas', 'acusticas', 'acusticas', 'Guitarras acústicas y clásicas con maderas asentadas.', 2),
('70ba16cb-ef23-455b-b9f1-a1ab3dfa0ef8', 'Bajos', 'bajos', 'bajos', 'Bajos vintage de colección.', 3),
('a8385e05-728b-49eb-9ea2-22591662ed72', 'Amplificadores', 'amplificadores', 'amplificadores', 'Amplificadores valvulares clásicos y cabezales.', 4)
ON CONFLICT (slug) DO NOTHING;

-- 7. Insert Seed Data - Products (Sample Based on original HTML)
-- Electric Guitars
INSERT INTO public.products (id, category_id, title, slug, price_display, badge, is_featured, short_description) VALUES
('6a42a0b2-dd84-486a-aeaf-9e54d852089c', 'b5025701-d0b4-4e4b-a2eb-4bf9d2d0c242', 'Fender Stratocaster 1962', 'fender-stratocaster-1962', 'Consultar', 'Vintage', true, 'Icono indiscutido con finish Sunburst original. Pastillas black bottom.'),
('e9dffdb2-3376-43b9-a2a1-b8f158869de4', 'b5025701-d0b4-4e4b-a2eb-4bf9d2d0c242', 'Gibson Les Paul Custom 1978', 'gibson-les-paul-custom-1978', 'USD 6,500', 'Premium', false, 'Black Beauty de la era Norlin. T-Tops originales y diapasón de ébano.'),
('f05dadd0-cfec-4286-9aeb-a006ef67e2fa', 'b5025701-d0b4-4e4b-a2eb-4bf9d2d0c242', 'Fender Telecaster Thinline 1972', 'fender-telecaster-thinline-1972', 'USD 4,200', null, false, 'Cuerpo de fresno ligero. Wide Range humbuckers diseñados por Seth Lover.')
ON CONFLICT (slug) DO NOTHING;

-- Amplifiers
INSERT INTO public.products (id, category_id, title, slug, price_display, badge, is_featured, short_description) VALUES
('b19d5b03-9b43-4dc9-9d5d-16a575a7b686', 'a8385e05-728b-49eb-9ea2-22591662ed72', 'Vox AC30 Top Boost 1964', 'vox-ac30-top-boost-1964', 'Consultar', 'Rare', true, 'El sonido de la invasión británica. Parlantes Celestion Blue Alnico originales.'),
('e74a8174-8393-41bb-a5f1-cf49fb81005b', 'a8385e05-728b-49eb-9ea2-22591662ed72', 'Fender Deluxe Reverb 1965', 'fender-deluxe-reverb-1965', 'USD 3,800', 'Blackface', false, 'El combo por excelencia para estudio y clubes. Circuito AB763 intacto.')
ON CONFLICT (slug) DO NOTHING;

-- *Note: For images, the admin panel will handle uploading real URLs to the product_images table.*
