-- Insert the new "Efectos" category
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

INSERT INTO categories (name, slug, nav_key, description, seo_description, sort_order)
VALUES (
  'Efectos',
  'efectos',
  'efectos',
  'Pedales de efectos: distorsión, modulación, delay, reverb, wah y más.',
  'Pedales de efectos para guitarra: distorsión, overdrive, modulación, delay, reverb, wah y más. Tienda boutique El Garaje de las Guitarras.',
  5
);
