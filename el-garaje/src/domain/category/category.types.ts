export interface Category {
    id: string;
    name: string;
    slug: string;
    navKey: string;
    description: string | null;
    seoDescription: string | null;
    sortOrder: number;
}
