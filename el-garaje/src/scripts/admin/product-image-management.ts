import Sortable from 'sortablejs';

interface ManagementOptions {
    gridSelector: string;
    formSelector: string;
    deleteBtnClass: string;
    orderInputId: string;
    deleteInputName: string;
}

export function initImageManagement(options: ManagementOptions) {
    const grid = document.querySelector(options.gridSelector) as HTMLElement;
    const form = document.querySelector(options.formSelector) as HTMLFormElement;
    const orderInput = document.getElementById(options.orderInputId) as HTMLInputElement;

    if (!grid || !form || !orderInput) return () => {};

    // Initialize Sortable
    let sortable: Sortable | null = null;
    try {
        sortable = new Sortable(grid, {
            animation: 150,
            ghostClass: 'opacity-50',
            dragClass: 'scale-105',
            handle: '.drag-handle',
            onEnd: () => {
                updateOrder();
            }
        });
    } catch (error) {
        console.error('[Sortable Error]', error);
    }

    // Handle Deletions
    grid.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const deleteBtn = target.closest(`.${options.deleteBtnClass}`);
        
        if (deleteBtn) {
            const item = deleteBtn.closest('[data-id]') as HTMLElement;
            if (!item) return;

            const id = item.getAttribute('data-id');
            if (!id) return;

            // Mark as deleted visually
            item.classList.add('hidden');
            
            // Add hidden input to form
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = options.deleteInputName;
            input.value = id;
            form.appendChild(input);

            // Update order (remove deleted item from sequence)
            updateOrder();
        }
    });

    // Force order update on form submission to ensure we have the latest visual state
    const handleSubmit = () => {
        console.log('[Image Management] Finalizing order before submission...');
        updateOrder();
    };
    form.addEventListener('submit', handleSubmit);

    function updateOrder() {
        // Safe check for current elements after a potential transition
        const currentGrid = document.querySelector(options.gridSelector);
        const currentOrderInput = document.getElementById(options.orderInputId) as HTMLInputElement;
        
        if (!currentGrid || !currentOrderInput) {
            console.warn('[Image Management] Cannot update order: grid or input not found');
            return;
        }

        const items = Array.from(currentGrid.querySelectorAll('[data-id]:not(.hidden)'));
        const ids = items.map(item => item.getAttribute('data-id')).filter(Boolean);
        currentOrderInput.value = ids.join(',');
        console.log('[Image Management] New order set in input:', currentOrderInput.value);
    }

    // Initial order call
    updateOrder();

    return () => {
        const s = sortable as any;
        sortable = null; // Clear reference immediately to prevent double-calls
        
        // Remove listeners
        form.removeEventListener('submit', handleSubmit);
        
        if (s && typeof s.destroy === 'function') {
            try {
                // Only destroy if the element is still in the document
                if (s.el && document.contains(s.el)) {
                    s.destroy();
                }
            } catch (err) {
                // Ignore errors during destroy in transitions
            }
        }
    };
}
