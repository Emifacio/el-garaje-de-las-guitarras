export class CatalogController {
    private grid: HTMLElement | null = null;
    private soldSection: HTMLElement | null = null;
    private soldGrid: HTMLElement | null = null;
    private soldToggleBtn: HTMLElement | null = null;
    private soldCountEl: HTMLElement | null = null;
    private soldToggleIcon: HTMLElement | null = null;
    private brandContainer: HTMLElement | null = null;

    constructor() {
        this.grid = document.getElementById('product-grid');
        this.soldSection = document.getElementById('sold-section');
        this.soldGrid = document.getElementById('sold-grid');
        this.soldToggleBtn = document.getElementById('sold-toggle-btn');
        this.soldCountEl = document.getElementById('sold-count');
        this.soldToggleIcon = document.getElementById('sold-toggle-icon');
        this.brandContainer = document.getElementById('brand-filters');
    }

    init() {
        if (!this.grid || !this.soldSection || !this.soldGrid || !this.soldToggleBtn || !this.soldCountEl || !this.soldToggleIcon) return;

        this.moveSoldItems();
        this.setupSoldToggle();
        this.setupBrandFilterObserver();
    }

    private moveSoldItems() {
        const soldCards = this.grid!.querySelectorAll<HTMLElement>('[data-status="vendido"]');
        if (soldCards.length === 0) return;

        soldCards.forEach(card => this.soldGrid!.appendChild(card));
        this.soldSection!.classList.remove('hidden');
        this.soldCountEl!.textContent = String(soldCards.length);
    }

    private setupSoldToggle() {
        let isExpanded = false;
        this.soldToggleBtn!.addEventListener('click', () => {
            isExpanded = !isExpanded;
            this.soldGrid!.classList.toggle('hidden', !isExpanded);
            this.soldToggleIcon!.textContent = isExpanded ? 'expand_less' : 'expand_more';
            this.soldToggleIcon!.style.transform = isExpanded ? 'rotate(180deg)' : '';
            document.dispatchEvent(new CustomEvent('sold-toggle', { detail: { expanded: isExpanded } }));
        });
    }

    private setupBrandFilterObserver() {
        if (!this.brandContainer) return;

        const observer = new MutationObserver(() => {
            const activeButtons = this.brandContainer!.querySelectorAll<HTMLButtonElement>('.brand-btn--active');
            const activeBrands = new Set<string>();
            activeButtons.forEach(btn => {
                if (btn.dataset.brandValue !== 'all') activeBrands.add(btn.dataset.brandValue!);
            });

            const showAll = activeBrands.size === 0 
                || this.brandContainer!.querySelector('[data-brand-value="all"]')?.classList.contains('brand-btn--active');

            let visibleSoldCount = 0;
            this.soldGrid!.querySelectorAll<HTMLElement>('[data-brand]').forEach(card => {
                const brand = card.dataset.brand || '';
                const visible = showAll || activeBrands.has(brand);
                card.style.display = visible ? '' : 'none';
                if (visible) visibleSoldCount++;
            });

            this.soldCountEl!.textContent = String(visibleSoldCount);
            this.soldSection!.style.display = visibleSoldCount > 0 ? '' : 'none';
        });

        observer.observe(this.brandContainer!, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
}
