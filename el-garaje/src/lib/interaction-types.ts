/**
 * Shared source of truth for all interaction event types.
 * 
 * DOMAIN MODEL: This is an inquiry/intent tracking system, NOT a checkout/order system.
 * - Products are unique (no quantity handling)
 * - No stock reservation occurs on add-to-selection
 * - No orders are created
 * - Admin consolidates sales manually via WhatsApp
 * 
 * These events track user intent and channel engagement, not transactional state.
 */

export const InteractionType = {
    /** User added a product to their inquiry selection (cart) */
    INQUIRY_SELECTION_ADDED: 'inquiry_selection_added',
    /** User initiated WhatsApp inquiry for a single product (comprar intent) */
    WHATSAPP_COMPRAR: 'whatsapp_comprar',
    /** User initiated WhatsApp inquiry for a single product (reservar intent) */
    WHATSAPP_RESERVAR: 'whatsapp_reservar',
    /** User sent bulk inquiry via WhatsApp from their selection (cart checkout) */
    WHATSAPP_BULK_INQUIRY: 'whatsapp_bulk_inquiry',
    /** User clicked floating WhatsApp button */
    SOCIAL_WHATSAPP: 'social_whatsapp',
    /** User clicked Instagram link */
    SOCIAL_INSTAGRAM: 'social_instagram',
    /** User submitted consignment inquiry */
    CONSIGNMENT_INQUIRY: 'consignment_inquiry',
} as const;

export type InteractionTypeValue = typeof InteractionType[keyof typeof InteractionType];

/**
 * All valid interaction types for API validation.
 * Keep in sync with InteractionType values.
 */
export const VALID_INTERACTION_TYPES: readonly InteractionTypeValue[] = [
    InteractionType.INQUIRY_SELECTION_ADDED,
    InteractionType.WHATSAPP_COMPRAR,
    InteractionType.WHATSAPP_RESERVAR,
    InteractionType.WHATSAPP_BULK_INQUIRY,
    InteractionType.SOCIAL_WHATSAPP,
    InteractionType.SOCIAL_INSTAGRAM,
    InteractionType.CONSIGNMENT_INQUIRY,
] as const;

/**
 * WhatsApp action types for URL generation.
 * These represent inquiry intents, not transactions.
 */
export const WhatsAppAction = {
    RESERVAR: 'reservar',
    COMPRAR: 'comprar',
    CONSULTA_CONSIGNACION: 'consulta_consignacion',
} as const;

export type WhatsAppActionValue = typeof WhatsAppAction[keyof typeof WhatsAppAction];
