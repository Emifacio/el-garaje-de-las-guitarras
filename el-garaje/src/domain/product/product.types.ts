export type ProductStatus = 'disponible' | 'vendido' | 'reservado';

export interface Product {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    longDescription: string | null;
    price: number | null;
    priceLabel: string; // Pre-formatted price for UI
    status: ProductStatus;
    isSold: boolean;
    isFeatured: boolean;
    badge: string | null;
    brand: string | null;
    year: number | null;
    specifications: Record<string, string>[] | null;
    youtubeUrl: string | null;
    youtubeEmbedUrl: string | null;
    category: {
        id: string;
        name: string;
        slug: string;
    } | null;
    images: string[]; // Array of public URLs
    createdAt: string;
    updatedAt: string;
    soldDate: string | null;
}
