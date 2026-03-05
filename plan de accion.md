# Untitled

# Plan: Admin Panel + Database for El Garaje de Las Guitarras

## Context

The site is currently 10 static HTML files with all products hardcoded. The header, footer, and mobile menu are copy-pasted across every page. To let a non-technical admin manage products, we need: a database, an admin interface, and reusable components. The current look and feel is preserved exactly.

## Recommended Stack

| Layer | Technology | Why |
| --- | --- | --- |
| **Framework** | Astro | Existing HTML pastes directly into `.astro` files. Static generation shipped to visitors by default = best SEO + performance. Zero JS. |
| **Database + Auth + Storage** | Supabase (free tier) | PostgreSQL database, image storage, admin authentication – all in one service, no server to manage. |
| **Styling** | Tailwind CSS (build-time) | Same classes already in use, but compiled at build instead of 350KB CDN runtime script. Huge perf win. |
| **Deployment** | Vercel (free tier) | First-class Astro support, hybrid SSR (admin) + SSG (public pages), on-demand page rebuilds. |

---

## File Structure Blueprint: `el-garaje/src/`

| Directory / File | Description & Purpose |
| --- | --- |
| **`components/layout/`** | Header, Footer, MobileMenu, BaseHead (extracted from duplicated HTML). |
| **`components/product/`** | ProductCard, ProductGallery, ProductSpecs, StatusBadge. |
| **`components/category/`** | CategoryHero, FilterSidebar. |
| **`components/ui/`** | Breadcrumbs, ContactForm. |
| **`layouts/BaseLayout.astro`** | Shared `<html>`/`<head>`/header/footer wrapper. |
| **`layouts/CategoryLayout.astro`** | Sidebar + product grid template. |
| **`layouts/AdminLayout.astro`** | Admin-specific layout (no public navigation). |
| **`pages/index.astro`** | Homepage. |
| **`pages/sobre-elgaraje.astro`** | About page. |
| **`pages/contacto.astro`** | Contact page. |
| **`pages/categoria/[slug].astro`** | Dynamic route: Replaces 4 hardcoded category HTML files. |
| **`pages/producto/[slug].astro`** | Dynamic route: Replaces single hardcoded `producto.html`. |
| **`pages/admin/login.astro`** | Email/password login. |
| **`pages/admin/index.astro`** | Dashboard (product count, quick links). |
| **`pages/admin/productos/index.astro`** | Product list table. |
| **`pages/admin/productos/nuevo.astro`** | Create product form. |
| **`pages/admin/productos/[id].astro`** | Edit product form. |
| **`pages/api/revalidate.ts`** | Webhook for auto-rebuilding pages on data changes. |
| **`lib/supabase.ts`** | Supabase client initialization. |
| **`lib/queries.ts`** | Data-fetching functions. |
| **`lib/types.ts`** | TypeScript interfaces. |
| **`lib/image-utils.ts`** | Image URL helpers. |
| **`lib/seo.ts`** | JSON-LD structured data generators. |
| **`styles/global.css`** | Tailwind directives + custom scrollbar styles. |
| **`tailwind.config.mjs`** | Migrated from `main.js` lines 1-21. |
| **`astro.config.mjs`** | Hybrid output configuration (SSG public + SSR admin). |

---

## Database Schema (Supabase PostgreSQL)

**Table: `categories`** (4 rows: Electricas, Acusticas, Bajos, Amplificadores)

- `id` (PK)
- `name`, `slug`, `nav_key`
- `description`, `seo_description`
- `filters` (JSONB)
- `sort_order`

**Table: `products`** (currently 12, scaling to ~50)

- `id` (PK)
- `category_id` (FK to categories)
- `title`, `slug`, `short_description`, `long_description`
- `price` (nullable), `price_display` (override text)
- `status` (disponible/vendido/reservado), `badge` (Premium/Vintage/etc.)
- `brand`, `year`
- `specifications` (JSONB array of `{label, value}`)
- `is_featured`, `sort_order`, `seo_title`, `seo_description`

**Table: `product_images`**

- `id` (PK)
- `product_id` (FK, CASCADE delete)
- `storage_path`, `alt_text`, `sort_order`

---

## Admin Panel Architecture

- **Login:** Simple email/password (Supabase Auth, sign-up disabled).
- **Product list:** Table showing thumbnail, title, category, status, price, edit/delete buttons.
- **Create/Edit form sections:**
    - Basic info: title, category dropdown, descriptions, status, badge.
    - Pricing: optional USD price, display override text.
    - Details: brand, year, featured checkbox.
    - Specs: dynamic add/remove rows (label + value).
    - Images: drag-and-drop upload to Supabase Storage, reorder, delete.
- **Auto-rebuild:** Supabase database trigger calls a Vercel webhook that rebuilds only affected static pages via Incremental Static Regeneration (ISR).

---

## SEO & Performance Strategy

- **Static HTML:** SSG for all public pages; Google gets fully rendered content.
- **Metadata:** `<meta>` tags (title, description, OG, Twitter) on every page.
- **JSON-LD:** Product schema on product pages, MusicStore on homepage.
- **Crawlability:** Auto-generated sitemap, `robots.txt` (blocking `/admin/`), Canonical URLs on all pages.
- **Semantic HTML:** `<article>`, `<time>`, `aria-current`, `aria-label`.
- **JS & CSS Optimization:** Eliminate Tailwind CDN (~350KB JS saved). Zero client-side JS on public pages (except ~20 lines for mobile menu).
- **Asset Optimization:** Self-host fonts via `@fontsource`, use inline SVGs for icons (~50KB saved), enforce `loading="lazy"`, WebP format, and width/height attributes via Astro `<Image>`.

---

## Implementation Phases

- **Phase 1: Foundation**
    - Init Astro project, migrate `tailwind.config`, `global.css`.
    - Extract reusable components: Header, Footer, MobileMenu, BaseHead, BaseLayout.
    - Migrate static pages: `index`, `sobre-elgaraje`, `contacto`.
    - *Checkpoint:* Site runs with `npm run dev`, static pages look identical.
- **Phase 2: Supabase Setup**
    - Create project, tables, RLS policies, storage bucket.
    - Seed database with 12 existing products + 4 categories.
    - Create `supabase.ts`, `queries.ts`, `types.ts`, `image-utils.ts`.
- **Phase 3: Dynamic Product Pages**
    - Create ProductCard, StatusBadge, FilterSidebar, CategoryLayout.
    - Create `categoria/[slug].astro`.
    - Create ProductGallery, ProductSpecs, Breadcrumbs.
    - Create `producto/[slug].astro`.
    - Update homepage to render featured products.
    - *Checkpoint:* Public site is fully data-driven and visually identical.
- **Phase 4: Admin Panel**
    - Create AdminLayout, login page.
    - Create product list, create form, edit form, image upload.
    - *Checkpoint:* Full CRUD works natively.
- **Phase 5: SEO + Performance Polish**
    - Add JSON-LD, sitemap, `robots.txt`.
    - Self-host fonts, replace icon font with SVGs, add image optimization.
- **Phase 6: Deployment**
    - Deploy to Vercel, configure env vars.
    - Set up Supabase trigger → Vercel ISR webhook.
    - Test end-to-end functionality.

---

## Key Files to Modify/Reference Migration Ledger

| Current File | Action |
| --- | --- |
| `main.js` (lines 1-21) | Migrate Tailwind config to `tailwind.config.mjs` |
| `main.js` (lines 24-79) | Refactor into Astro component scripts/islands |
| `style.css` | Migrate to `src/styles/global.css` with Tailwind directives |
| `index.html` | Extract layout → `BaseLayout.astro`, content → `pages/index.astro` |
| `guitarras-electricas.html` | Reference template for `CategoryLayout` + `ProductCard` |
| `producto.html` | Reference template for `ProductGallery` + `ProductSpecs` |
| `contacto.html` | Migrate form to `ContactForm` island with `client:load` |
| `sobre-elgaraje.html` | Simple migration to `pages/sobre-elgaraje.astro` |
| All 4 category HTMLs | Replaced by single `pages/categoria/[slug].astro` |

---

## Verification Protocol

1. Run `npm run dev` — verify all pages render correctly.
2. Navigate every public route and compare visually to original HTML files.
3. Test admin login → create product → verify it appears in category page.
4. Test admin edit → update price → verify change reflected.
5. Test admin delete → confirm product removed.
6. Test image upload → verify images display correctly.
7. Run Lighthouse audit target 90+ on Performance, SEO, Accessibility.
8. Validate JSON-LD with Google Rich Results Test.
9. Check `robots.txt` and `sitemap-index.xml` are accessible.