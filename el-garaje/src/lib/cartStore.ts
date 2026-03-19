/**
 * Inquiry Selection Store
 * 
 * DOMAIN MODEL: This store manages a user's purchase-intent selection, NOT a shopping cart.
 * 
 * Business Rules:
 * - Products are mostly unique (no quantity handling needed)
 * - Adding a product does NOT reserve stock or modify availability
 * - Adding a product does NOT create an order
 * - The selection is simply a grouping of interest for WhatsApp inquiry
 * - Admin remains the only source of truth for product lifecycle status
 * 
 * The actual sale is consolidated manually via WhatsApp conversation.
 * This is an inquiry/intent tracking mechanism, not a transactional system.
 */

/**
 * Represents a product added to the user's inquiry selection.
 * Note: This is NOT a cart item in the e-commerce sense.
 * It represents expressed purchase intent, not a committed purchase.
 */
export interface CartItem {
    id: string;
    title: string;
    price: number;
    price_display?: string;
    image_url: string;
    slug: string;
}

const SELECTION_STORAGE_KEY = 'elgaraje_inquiry_selection';

/**
 * Event dispatched when the selection changes.
 * Used for cross-component reactivity (drawer, badge updates).
 */
export const SELECTION_UPDATED_EVENT = 'inquiry-selection-updated';

/**
 * Retrieve all products in the user's inquiry selection.
 * Returns empty array during SSR.
 */
export function getCartItems(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(SELECTION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error reading inquiry selection from localStorage', e);
        return [];
    }
}

/**
 * Add a product to the user's inquiry selection.
 * 
 * IMPORTANT: This does NOT:
 * - Reserve or decrement stock
 * - Create an order
 * - Modify product availability in the database
 * 
 * It simply groups products for a bulk WhatsApp inquiry.
 */
export function addToCart(item: CartItem): void {
    const currentSelection = getCartItems();

    if (!currentSelection.find(i => i.id === item.id)) {
        currentSelection.push(item);
        localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(currentSelection));
        window.dispatchEvent(new CustomEvent(SELECTION_UPDATED_EVENT));
    }
}

/**
 * Remove a product from the inquiry selection.
 */
export function removeFromCart(productId: string): void {
    const currentSelection = getCartItems();
    const newSelection = currentSelection.filter(item => item.id !== productId);
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(newSelection));
    window.dispatchEvent(new CustomEvent(SELECTION_UPDATED_EVENT));
}

/**
 * Clear the entire inquiry selection.
 */
export function clearCart(): void {
    localStorage.removeItem(SELECTION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SELECTION_UPDATED_EVENT));
}
