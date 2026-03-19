# Admin Product Services - Implementation Notes

## Overview

This document describes the refactoring of admin product CRUD operations into a service-oriented architecture.

## Goals

- Move business logic out of Astro pages into testable services
- Strengthen server-side validation
- Reduce duplication across create/update/delete/toggle flows
- Make image upload handling safer and more explicit
- Add tests for validators and utilities
- Preserve existing UI and user-visible behavior

## Architecture

### Directory Structure

```
src/
├── validators/
│   ├── product.ts          # Product form validation
│   ├── uploads.ts          # Upload file validation
│   └── validators.test.ts  # Tests for validators
├── lib/
│   ├── slug.ts             # Slug utilities
│   └── dates.ts            # Date utilities
└── services/
    ├── auth/
    │   └── requireAdmin.ts  # Admin auth wrapper
    └── products/
        ├── createProduct.ts
        ├── updateProduct.ts
        ├── deleteProduct.ts
        ├── toggleProductStatus.ts
        └── uploadProductImages.ts
```

## Validators

### Product Validator (`src/validators/product.ts`)

Validates product form data with the following rules:

- **title**: Required, 1-200 characters
- **slug**: Optional, auto-generated from title if empty/invalid, max 200 chars
- **category_id**: Required
- **price**: Optional, must be non-negative number
- **year**: Optional, must be 1800-current year
- **youtube_url**: Optional, must be valid youtube.com or youtu.be URL
- **description**: Optional, max 5000 characters
- **status**: Must be one of: disponible, reservado, vendido

### Upload Validator (`src/validators/uploads.ts`)

Server-side file validation for security:

- **Allowed types**: image/jpeg, image/png, image/webp
- **Max file size**: 10MB per file
- **Min file size**: 100 bytes (filters ghost files)
- **Max files per request**: 10
- **Validation**: MIME type + extension + size

## Utilities

### Slug Utilities (`src/lib/slug.ts`)

- `normalizeSlug(input)`: Converts text to valid URL slug
- `isValidSlug(slug)`: Validates slug format
- `resolveSlug(provided, title)`: Uses provided slug if valid, otherwise generates from title
- `sanitizeSlugInput(input)`: Trims and normalizes slug input

### Date Utilities (`src/lib/dates.ts`)

- `parseSoldDate(dateStr)`: Parses DD/MM/YYYY format, returns ISO string or null
- `formatSoldDateForDisplay(isoDate)`: Formats ISO date to DD/MM/YYYY
- `determineSoldDate(existingDate, newStatus)`: Returns appropriate sold_date based on status

## Services

### Admin Auth (`src/services/auth/requireAdmin.ts`)

Reusable wrapper for admin-only operations:

```typescript
const result = await requireAdmin(request);
if (!result.success) return result.response;
const { supabase, user } = result;
```

### Product Lifecycle

The admin product lifecycle is intentionally simple:

```
disponible <-> vendido
```

**Important**: `reservado` is a display-only status in the storefront (soft commercial signal with softer CTA), NOT an admin-controlled inventory state.

### Sold Date Logic

- When status changes TO `vendido`: Set `sold_date` to current date (or keep existing if present)
- When status changes TO `disponible`: Clear `sold_date`
- `reservado` status: Does not affect `sold_date`

### Create Product (`src/services/products/createProduct.ts`)

1. Validate admin authentication
2. Validate form data with ProductValidator
3. Upload images (optional)
4. Create product record
5. Return result

### Update Product (`src/services/products/updateProduct.ts`)

1. Validate admin authentication
2. Validate form data with ProductValidator
3. Handle status transition (set/clear sold_date)
4. Upload new images (optional)
5. Update product record
6. Return result

### Delete Product (`src/services/products/deleteProduct.ts`)

1. Validate admin authentication
2. Verify product exists
3. Delete product images from storage
4. Delete product record
5. Return result

### Toggle Product Status (`src/services/products/toggleProductStatus.ts`)

Simplified status toggle for admin:

1. Validate admin authentication
2. Verify product exists
3. Toggle between `disponible` and `vendido`
4. Handle sold_date appropriately
5. Return updated product

### Upload Product Images (`src/services/products/uploadProductImages.ts`)

1. Validate files (MIME type, extension, size)
2. Upload to Supabase storage
3. Return public URLs

## Cart as Inquiry Flow

The cart is an **inquiry/selection flow**, not a checkout system:

- Unique instruments are sold
- Sales consolidate via WhatsApp
- Cart stores items user is "inquiring about"
- "Purchase" sends WhatsApp message with selections

## Test Coverage

Tests are located in `src/validators/validators.test.ts`:

- Slug utilities: normalization, validation, resolution
- Date utilities: parsing, formatting, sold date logic
- Upload validation: file type, size, limits, ghost files
- Product validation: required fields, field validation, status

## Breaking Changes

None. This refactoring:

- Preserves all existing UI behavior
- Maintains same API endpoints
- Does not add new features
- Does not change data model

## Pre-existing Issues

The following LSP warnings existed before this refactoring:

- Various `possibly null` warnings in CartDrawer, SearchModal, Header, etc.
- These are unrelated to the services architecture

## Future Considerations

If needed, the architecture supports:

- Adding tests for services (require mocking Supabase)
- Extending validators with new fields
- Adding logging/metrics to services
- Implementing partial failure handling for batch operations
