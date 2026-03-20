import { addToCart } from '../../lib/cartStore';
import { InteractionType } from '../../domain/interactions/interaction.types';

export class ProductInteractionsController {
    constructor(private productId: string, private productTitle: string) {}

    init() {
        this.setupAddToCart();
    }

    private setupAddToCart() {
        const btn = document.getElementById('add-to-cart-btn');
        if (!btn) return;

        btn.onclick = () => {
            const id = btn.getAttribute('data-product-id');
            const title = btn.getAttribute('data-product-title');
            const priceStr = btn.getAttribute('data-product-price');
            const priceLabel = btn.getAttribute('data-product-price-label');
            const image = btn.getAttribute('data-product-image');
            const slug = btn.getAttribute('data-product-slug');

            if (id && title && slug) {
                addToCart({
                    id,
                    title,
                    price: priceStr ? parseFloat(priceStr) : 0,
                    priceLabel: priceLabel || '',
                    imageUrl: image || '/logo.jpg',
                    slug
                });

                this.trackInteraction(id, title);
                this.showFeedback(btn);
            }
        };
    }

    private async trackInteraction(id: string, title: string) {
        try {
            await fetch('/api/track-interaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: id,
                    interaction_type: InteractionType.INQUIRY_SELECTION_ADDED,
                    metadata: { product_title: title, timestamp: new Date().toISOString() }
                })
            });
        } catch (err) {
            console.warn('Tracking failed:', err);
        }
    }

    private showFeedback(btn: HTMLElement) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<span class="relative z-10 flex items-center gap-3">¡Agregado! <span class="material-symbols-outlined">check_circle</span></span>`;
        btn.classList.add('bg-[#25D366]', 'border-[#25D366]');
        btn.classList.remove('bg-primary', 'border-primary');
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('bg-[#25D366]', 'border-[#25D366]');
            btn.classList.add('bg-primary', 'border-primary');
        }, 2000);
    }
}
