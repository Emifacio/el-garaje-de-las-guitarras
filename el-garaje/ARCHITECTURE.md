# El Garaje de las Guitarras - Architecture Overview

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── cart/            # Shopping cart UI
│   ├── category/        # Category-related components
│   ├── layout/          # Layout components (Header, Footer, etc.)
│   ├── product/         # Product display components
│   ├── tools/           # Utility components
│   └── ui/              # Generic UI primitives
├── config/              # Application configuration
├── integrations/        # Astro integrations
├── layouts/             # Page layouts
├── lib/                 # Core utilities
│   ├── admin.ts         # Admin authentication helpers
│   ├── cartStore.ts     # Cart state management
│   ├── dates.ts         # Date utilities
│   ├── image-utils.ts   # Image URL helpers
│   ├── queries.ts       # Database read queries (public)
│   ├── slug.ts          # Slug utilities
│   ├── supabase-server.ts # Supabase SSR client
│   └── types.ts         # TypeScript types
├── pages/               # Route handlers (thin)
│   ├── admin/           # Admin dashboard pages
│   ├── api/             # API endpoints
│   └── producto/        # Public product pages
├── scripts/             # Client-side JavaScript
│   └── admin/           # Admin-specific scripts
├── services/            # Business logic (thin pages call these)
│   ├── auth/            # Authentication services
│   │   └── requireAdmin.ts
│   └── products/        # Product CRUD services
│       ├── createProduct.ts
│       ├── deleteProduct.ts
│       ├── listProducts.ts
│       ├── toggleProductStatus.ts
│       ├── updateProduct.ts
│       └── uploadProductImages.ts
├── styles/              # Global styles
├── types/               # Type exports
│   └── index.ts
├── validators/          # Form validation
│   ├── product.ts       # Product form validation
│   ├── uploads.ts       # Upload file validation
│   └── validators.test.ts
└── test-utils/          # Test utilities
```

## Architecture Layers

| Layer | Location | Responsibility |
|-------|----------|-----------------|
| **UI Components** | `components/` | Pure presentation |
| **Services** | `services/` | Business logic, data operations |
| **Validators** | `validators/` | Type-safe form validation |
| **Queries** | `lib/queries.ts` | Public read queries with caching |
| **Types** | `lib/types.ts` | Domain types |
| **Pages** | `pages/` | Thin route handlers, orchestrate services |

## Data Flow

```
User Request
    ↓
Page (Astro) → Auth Check → Service → Supabase
    ↓                    ↓           ↓
  Response ← Validator ← Form Data  Database
```

## Admin Authentication

1. User visits `/admin/*`
2. `services/auth/requireAdmin.ts` checks auth
3. Uses `lib/admin.ts` → `getAdminAccess()`
4. Checks `profiles.is_admin` flag
5. Returns redirect or continues

## Product Lifecycle

```
disponible → reservado → vendido → disponible
```

- `disponible`: Available for sale
- `reservado`: Reserved (soft commercial signal, not inventory lock)
- `vendido`: Sold (sets `sold_date`)

## Cart as Inquiry Flow

This is NOT a checkout system:
- Unique instruments are sold
- Sales consolidate via WhatsApp
- Cart stores items user is "inquiring about"
- "Purchase" action sends WhatsApp message with selections

## Image Optimization

### Blur-up Effect (LQIP)

Images use a CSS blur-up effect for better perceived performance:
- Gradient placeholder shown immediately
- Image loads with `filter: blur(20px)` and `transform: scale(1.1)`
- On load complete, transitions to sharp (`filter: blur(0)`)

**Components with blur-up:**
- `ProductCard.astro` - Gallery cards
- `ProductGallery.astro` - Product detail page

**Implementation:**
```css
.image-blur-up {
    filter: blur(20px);
    transform: scale(1.1);
    opacity: 0;
}

.image-blur-up.loaded {
    filter: blur(0);
    transform: scale(1);
    opacity: 1;
}
```

### Image Compression

Admin upload flow compresses images to WebP format:
- Client-side compression before upload
- Max dimensions: 1200x1200
- Quality: 85%
- Reduces storage and improves load times

## Database Schema (Supabase)

See `schema.sql` for full DDL.

### Tables

| Table | Purpose |
|-------|---------|
| `products` | Guitar/amp/pedal listings |
| `product_images` | Images with sort order |
| `categories` | Product categories |
| `profiles` | User profiles (includes `is_admin`) |
| `interaction_logs` | Analytics events |

### Key Columns

| Column | Notes |
|--------|-------|
| `products.status` | Enum: disponible, reservado, vendido |
| `products.sold_date` | Set when status → vendido |
| `products.is_featured` | Showcases on homepage |
| `profiles.is_admin` | Controls admin access |

### Row Level Security (RLS)

All tables have RLS enabled:

| Table | Public Read | Admin Write |
|-------|-------------|-------------|
| `products` | ✅ | ✅ (is_admin) |
| `product_images` | ✅ | ✅ (is_admin) |
| `categories` | ✅ | ✅ (is_admin) |
| `profiles` | Own row only | Own row only |
| `interaction_logs` | Insert only | Read/Delete |

## Image Upload Flow

1. User selects images in form
2. Client compresses to WebP (max 1200x1200)
3. POST to admin form
4. Server validates (type, size, count)
5. Uploads to Supabase Storage
6. Records in `product_images` table

## Local Storage

| Key | Purpose |
|-----|---------|
| `elgaraje_inquiry_selection` | Cart items (formerly `elgaraje_cart`) |

Migration handles renaming automatically.

## Environment Variables

```env
PUBLIC_SUPABASE_URL=        # Supabase project URL
PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
SENTRY_DSN=                 # Sentry error tracking (optional)
```

## Error Tracking (Sentry)

[Sentry](https://sentry.io) captures errors and performance issues in production.

### Setup

1. Create project at [sentry.io](https://sentry.io)
2. Add `SENTRY_DSN` to environment variables
3. Deploy - Sentry auto-initializes via `@sentry/astro`

### What Gets Tracked

- Unhandled exceptions
- Server-side errors (API routes, SSR pages)
- Performance traces (sample rate: 10%)
- Session replays on errors (sample rate: 100%)

### Sample Rates

| Feature | Rate | Notes |
|---------|------|-------|
| Traces | 10% | Performance monitoring |
| Replays | 10% | Session recording |
| Replays on Error | 100% | Full replay when error occurs |

## Testing

```bash
npm test        # Run all tests
npm run build   # Production build
```

## Adding New Features

1. **Types**: Add to `lib/types.ts`
2. **Validation**: Add to `validators/`
3. **Service**: Create in `services/products/` or `services/auth/`
4. **Page**: Create in `pages/`, import service
5. **Test**: Add to `validators/validators.test.ts`
