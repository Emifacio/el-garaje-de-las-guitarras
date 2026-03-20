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

    if (!grid || !form || !orderInput) return;

    // Initialize Sortable
    const sortable = new Sortable(grid, {
        animation: 150,
        ghostClass: 'opacity-50',
        dragClass: 'scale-105',
        handle: '.drag-handle',
        onEnd: () => {
            updateOrder();
        }
    });

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

    function updateOrder() {
        const items = Array.from(grid.querySelectorAll('[data-id]:not(.hidden)'));
        const ids = items.map(item => item.getAttribute('data-id')).filter(Boolean);
        orderInput.value = ids.join(',');
    }

    // Initial order call
    updateOrder();

    return () => {
        sortable.destroy();
    };
}
