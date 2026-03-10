// WhatsApp link generation for pseudo-checkout flow
const WHATSAPP_PHONE = '5491130322477';

export type InteractionAction = 'reservar' | 'comprar' | 'consulta_consignacion';

/**
 * Generates a WhatsApp URL with a pre-filled dynamic message.
 */
export function generateWhatsAppUrl(
    action: InteractionAction,
    productTitle?: string,
    productId?: string
): string {
    let message = '';

    if (action === 'reservar' && productTitle) {
        message = `Hola, me interesa *reservar* el instrumento *${productTitle}* que vi en el sitio web.`;
    } else if (action === 'comprar' && productTitle) {
        message = `Hola, me interesa *comprar* el instrumento *${productTitle}* que vi en el sitio web.`;
    } else if (action === 'consulta_consignacion') {
        message = `Hola, me interesa consignar un instrumento a través de El Garaje. Vi la info en el sitio web.`;
    } else {
        message = `Hola vengo del sitio web, puedo hacerte una consulta?`;
    }

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a WhatsApp URL for an entire shopping cart
 */
export function generateCartWhatsAppUrl(items: { title: string }[]): string {
    if (items.length === 0) return WHATSAPP_DIRECT_URL;

    const isPlural = items.length > 1;
    let message = isPlural
        ? `Hola, me interesa comprar estos instrumentos que vi en el sitio web:\n\n`
        : `Hola, me interesa comprar este instrumento que vi en el sitio web:\n\n`;

    items.forEach(item => {
        message += `- *${item.title}*\n`;
    });

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/** Direct WhatsApp link (no message) for floating button */
export const WHATSAPP_DIRECT_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hola vengo del sitio web, puedo hacerte una consulta?')}`;

/** WhatsApp catalog link */
export const WHATSAPP_CATALOG_URL = `https://wa.me/c/5491130322477?text=${encodeURIComponent('Hola vengo del sitio web, puedo hacerte una consulta?')}`;

/** Instagram profile */
export const INSTAGRAM_URL = 'https://ig.me/m/elgarajedelasguitarras';
