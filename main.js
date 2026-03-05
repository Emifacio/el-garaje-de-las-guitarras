// Global Tailwind Configuration for the browser runtime script.
// This ensures that all HTML pages share the exact same aesthetic tokens.
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#d9b870", /* Gold/Brass accent */
                "background-light": "#faf8f5",
                "background-dark": "#0a0a0a", /* Very dark near black */
                "accent-dark": "#1f1a18", /* Dark wood/velvet hint */
                "accent-burgundy": "#4a1c1c", /* Deep burgundy */
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
                "serif": ["Playfair Display", "serif"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
        },
    },
}

// Global UI Interactions
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle functionality
    const menuBtn = document.getElementById('btn-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuBtn = document.getElementById('btn-close-menu');

    if (menuBtn && mobileMenu && closeMenuBtn) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-full');
        });

        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
        });
    }

    // Simple search behavior: send users to featured categories on home
    const searchButtons = document.querySelectorAll('[data-role="search-button"]');
    if (searchButtons.length > 0) {
        searchButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                window.location.href = 'index.html#featured-categories';
            });
        });
    }

    // Contact form handling with basic client-side feedback
    const contactForm = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');

    if (contactForm && statusEl) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(contactForm);
            const nombre = String(formData.get('nombre') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const mensaje = String(formData.get('mensaje') || '').trim();

            if (!nombre || !email || !mensaje) {
                statusEl.textContent = 'Por favor completá todos los campos obligatorios.';
                statusEl.classList.remove('hidden');
                statusEl.classList.remove('text-primary');
                statusEl.classList.add('text-red-400');
                return;
            }

            // For this static demo we just show a success message
            contactForm.reset();
            statusEl.textContent = 'Gracias, recibimos tu mensaje. Te contactaremos a la brevedad.';
            statusEl.classList.remove('hidden');
            statusEl.classList.remove('text-red-400');
            statusEl.classList.add('text-primary');
        });
    }
});
