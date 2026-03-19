/**
 * WhatsApp URL Generation for Purchase Intent Inquiries
 * 
 * DOMAIN MODEL: This generates WhatsApp links for user INQUIRIES, not checkout flows.
 * 
 * The store sells unique instruments. Sales are consolidated manually via WhatsApp.
 * These functions generate pre-filled messages that express purchase intent
 * and initiate a conversation, not complete a transaction.
 */

import { WhatsAppAction, type WhatsAppActionValue } from './interaction-types';

const WHATSAPP_PHONE = '5491130322477';

/**
 * Generates a WhatsApp URL with a pre-filled inquiry message.
 * 
 * @param action - The type of inquiry intent (reservar, comprar, consignacion)
 * @param productTitle - Optional product name to include in message
 * @returns Pre-filled WhatsApp URL
 */
export function generateWhatsAppUrl(
    action: WhatsAppActionValue,
    productTitle?: string
): string {
    let message = '';

    if (action === WhatsAppAction.RESERVAR && productTitle) {
        message = `Hola, me interesa *reservar* el instrumento *${productTitle}* que vi en el sitio web.`;
    } else if (action === WhatsAppAction.COMPRAR && productTitle) {
        message = `Hola, me interesa *comprar* el instrumento *${productTitle}* que vi en el sitio web.`;
    } else if (action === WhatsAppAction.CONSULTA_CONSIGNACION) {
        message = `Hola, me interesa consignar un instrumento a través de El Garaje. Vi la info en el sitio web.`;
    } else {
        message = `Hola vengo del sitio web, puedo hacerte una consulta?`;
    }

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a WhatsApp URL for bulk inquiry from user's product selection.
 * 
 * This is NOT a checkout flow - it's an inquiry grouping sent via WhatsApp
 * to start a conversation about multiple products of interest.
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

/** WhatsApp channel link for catalog browsing */
export const WHATSAPP_CATALOG_URL = `https://wa.me/c/5491130322477?text=${encodeURIComponent('Hola vengo del sitio web, puedo hacerte una consulta?')}`;

/** Instagram profile */
export const INSTAGRAM_URL = 'https://ig.me/m/elgarajedelasguitarras';
