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

    if (action === 'reservar' && productTitle && productId) {
        message = `Hola, me interesa *reservar* la ${productTitle} (ID: ${productId}) que vi en la web.`;
    } else if (action === 'comprar' && productTitle && productId) {
        message = `Hola, me interesa *comprar* la ${productTitle} (ID: ${productId}) que vi en la web.`;
    } else if (action === 'consulta_consignacion') {
        message = `Hola, me interesa consignar un instrumento a través de El Garaje. Vi la info en la web.`;
    } else {
        message = `Hola, estoy contactándome desde la web de El Garaje de las Guitarras.`;
    }

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/** Direct WhatsApp link (no message) for floating button */
export const WHATSAPP_DIRECT_URL = `https://wa.me/${WHATSAPP_PHONE}`;

/** WhatsApp catalog link */
export const WHATSAPP_CATALOG_URL = 'https://wa.me/c/5491130322477';

/** Instagram profile */
export const INSTAGRAM_URL = 'https://www.instagram.com/elgarajedelasguitarras';
