/**
 * Tipo de dato para un producto en el carrito
 */
export interface CartItem {
    id: string;
    title: string;
    price: number;
    price_display?: string;
    image_url: string;
    slug: string;
}

const CART_STORAGE_KEY = 'elgaraje_cart';

/**
 * Obtener todos los productos del carrito
 */
export function getCartItems(): CartItem[] {
    if (typeof window === 'undefined') return []; // Para SSR
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error leyendo carrito de localStorage", e);
        return [];
    }
}

/**
 * Agregar un producto al carrito
 */
export function addToCart(item: CartItem): void {
    const currentCart = getCartItems();

    // Evitar duplicados (aunque permitimos cantidad 1 por tratarse de instrumentos únicos generalmente)
    if (!currentCart.find(i => i.id === item.id)) {
        currentCart.push(item);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentCart));
        window.dispatchEvent(new CustomEvent('cart-updated'));
    }
}

/**
 * Eliminar un producto del carrito
 */
export function removeFromCart(productId: string): void {
    const currentCart = getCartItems();
    const newCart = currentCart.filter(item => item.id !== productId);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
}

/**
 * Vaciar el carrito por completo
 */
export function clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('cart-updated'));
}
