export interface InquiryItem {
    id: string;
    title: string;
    price: number;
    priceLabel: string;
    imageUrl: string;
    slug: string;
}

export type InquiryType = 'comprar' | 'reservar' | 'consulta';
