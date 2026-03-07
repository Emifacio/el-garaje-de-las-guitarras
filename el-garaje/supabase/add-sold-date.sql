-- Add sold_date column to products table
-- This tracks when a product was marked as "vendido"
-- Used for sorting sold items by most recent sale first

ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ DEFAULT NULL;

-- Backfill: set sold_date for existing sold products to their updated_at date
UPDATE products
SET sold_date = updated_at
WHERE status = 'vendido' AND sold_date IS NULL;
