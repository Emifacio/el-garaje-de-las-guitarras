export default function lollapaloozaModal() {
  return {
    name: 'lollapalooza-modal',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        injectScript(
          'page',
          `(() => {
  const MODAL_ID = 'lollapalooza-welcome-modal';
  const STORAGE_KEY = 'el-garaje-lollapalooza-modal-dismissed';

  const injectStyles = () => {
    if (document.getElementById(MODAL_ID + '-styles')) return;

    const style = document.createElement('style');
    style.id = MODAL_ID + '-styles';
    style.textContent = \`
      .lg-welcome-modal {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        background: rgba(12, 10, 8, 0.78);
        backdrop-filter: blur(10px);
      }

      .lg-welcome-modal[hidden] {
        display: none;
      }

      .lg-welcome-modal__dialog {
        width: min(100%, 420px);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 28px;
        background: linear-gradient(180deg, #1f1610 0%, #120d09 100%);
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.45);
        color: #fff7ed;
      }

      .lg-welcome-modal__media {
        display: block;
        width: 100%;
        aspect-ratio: 4 / 5;
        object-fit: cover;
        background: #24180f;
      }

      .lg-welcome-modal__content {
        padding: 1.25rem 1.25rem 1.5rem;
      }

      .lg-welcome-modal__eyebrow {
        margin: 0 0 0.5rem;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #fbbf24;
      }

      .lg-welcome-modal__text {
        margin: 0;
        font-size: 1rem;
        line-height: 1.6;
      }

      .lg-welcome-modal__actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 1rem;
      }

      .lg-welcome-modal__button {
        border: 0;
        border-radius: 999px;
        padding: 0.8rem 1.15rem;
        background: #f59e0b;
        color: #1c120a;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition: transform 160ms ease, opacity 160ms ease;
      }

      .lg-welcome-modal__button:hover {
        transform: translateY(-1px);
        opacity: 0.94;
      }

      @media (max-width: 480px) {
        .lg-welcome-modal {
          padding: 1rem;
        }

        .lg-welcome-modal__dialog {
          border-radius: 22px;
        }

        .lg-welcome-modal__content {
          padding: 1rem 1rem 1.25rem;
        }
      }
    \`;

    document.head.appendChild(style);
  };

  const closeModal = () => {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    sessionStorage.setItem(STORAGE_KEY, 'true');
  };

  const createModal = () => {
    if (document.getElementById(MODAL_ID)) return;
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') return;

    injectStyles();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'lg-welcome-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Bienvenida al festival');

    modal.innerHTML = \`
      <div class="lg-welcome-modal__dialog">
        <img
          class="lg-welcome-modal__media"
          src="/lolapalooza%20flyer.avif"
          alt="Flyer del festival Lollapalooza"
          loading="eager"
          decoding="async"
        />
        <div class="lg-welcome-modal__content">
          <p class="lg-welcome-modal__eyebrow">Bienvenidos</p>
          <p class="lg-welcome-modal__text">Este finde en El Garaje de las Guitarras disfrutamos de la musica del Lola Palooza con todo!</p>
          <div class="lg-welcome-modal__actions">
            <button type="button" class="lg-welcome-modal__button">Seguir</button>
          </div>
        </div>
      </div>
    \`;

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    modal.querySelector('button')?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    }, { once: true });

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  };

  const mount = () => {
    if (document.body) {
      createModal();
    } else {
      window.requestAnimationFrame(mount);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();`
        );
      }
    }
  };
}
