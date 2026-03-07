export type ProductStatus = 'disponible' | 'vendido' | 'reservado';

export interface Category {
    id: string;
    name: string;
    slug: string;
    nav_key: string;
    description: string | null;
    seo_description: string | null;
    sort_order: number;
}

export interface ProductImage {
    id: string;
    product_id: string;
    storage_path: string;
    alt_text: string | null;
    sort_order: number;
    created_at: string;
}

export interface Product {
    id: string;
    category_id: string;
    title: string;
    slug: string;
    short_description: string | null;
    long_description: string | null;
    price: number | null;
    price_display: string | null;
    status: ProductStatus;
    badge: string | null;
    brand: string | null;
    year: number | null;
    specifications: Record<string, string>[] | null;
    is_featured: boolean;
    sort_order: number;
    seo_title: string | null;
    seo_description: string | null;
    created_at: string;
    updated_at: string;
    sold_date: string | null;

    // Joined relation representation
    categories?: Category | null;
    product_images?: ProductImage[];
}
