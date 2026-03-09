# OptimizedImage Component

## Overview

The `OptimizedImage` component is a wrapper around Astro's built-in `Picture` component that provides automatic image optimization with modern formats, responsive variants, and intelligent loading strategies.

## Features

✅ **Automatic Format Conversion**
- Generates AVIF format (best compression, ~75% quality)
- Generates WebP format (good compression, ~80% quality)
- Provides JPEG fallback for universal browser support (~85% quality)

✅ **Responsive Image Variants**
- Automatically generates images at 320px, 640px, 1024px, and 1920px widths
- Uses `srcset` attribute for browser-based selection
- Configurable `sizes` attribute for responsive behavior

✅ **Intelligent Loading Strategies**
- Hero images: `loading="eager"` + `fetchpriority="high"` for immediate loading
- Regular images: `loading="lazy"` for deferred loading below the fold
- Prevents layout shift with automatic width/height attributes

✅ **Picture Element Structure**
- Generates proper `<picture>` element with `<source>` elements
- Browser automatically selects best format based on support
- Graceful fallback to JPEG for older browsers

## Usage

### Basic Usage

```astro
---
import OptimizedImage from '../components/OptimizedImage.astro';
---

<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description of image"
  width={800}
  height={600}
/>
```

### Hero Image (Priority Loading)

```astro
<OptimizedImage
  src="/hero-banner.jpg"
  alt="Hero banner"
  width={1920}
  height={1080}
  isHero={true}
  class="w-full h-auto"
/>
```

### Custom Sizes Attribute

```astro
<OptimizedImage
  src="/product.jpg"
  alt="Product image"
  width={640}
  height={480}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### With Imported Images

```astro
---
import productImage from '../assets/product.jpg';
import OptimizedImage from '../components/OptimizedImage.astro';
---

<OptimizedImage
  src={productImage}
  alt="Product"
  width={800}
  height={600}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `src` | `ImageMetadata \| string` | ✅ Yes | - | Image source (imported or path) |
| `alt` | `string` | ✅ Yes | - | Alternative text for accessibility |
| `width` | `number` | ❌ No | - | Image width in pixels |
| `height` | `number` | ❌ No | - | Image height in pixels |
| `isHero` | `boolean` | ❌ No | `false` | Enable priority loading for hero images |
| `class` | `string` | ❌ No | - | CSS classes to apply to the image |
| `sizes` | `string` | ❌ No | `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw` | Responsive sizes attribute |
| `quality` | `number` | ❌ No | `80` | Image quality (1-100) |

## Generated HTML Structure

The component generates the following HTML structure:

```html
<picture>
  <!-- AVIF format (best compression) -->
  <source 
    type="image/avif" 
    srcset="image-320.avif 320w, image-640.avif 640w, image-1024.avif 1024w, image-1920.avif 1920w"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
  
  <!-- WebP format (good compression) -->
  <source 
    type="image/webp" 
    srcset="image-320.webp 320w, image-640.webp 640w, image-1024.webp 1024w, image-1920.webp 1920w"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
  
  <!-- Fallback JPEG (universal support) -->
  <img 
    src="image.jpg" 
    srcset="image-320.jpg 320w, image-640.jpg 640w, image-1024.jpg 1024w, image-1920.jpg 1920w"
    alt="Description" 
    width="800" 
    height="600" 
    loading="lazy"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
</picture>
```

## Configuration

The component uses configuration from `src/config/image-optimizer.config.ts`:

```typescript
export const imageOptimizerConfig: ImageOptimizerConfig = {
  formats: ['webp', 'avif', 'jpeg'],
  widths: [320, 640, 1024, 1920],
  quality: {
    webp: 80,
    avif: 75,
    jpeg: 85
  },
  loading: 'lazy'
};
```

## Performance Benefits

### Format Optimization
- **AVIF**: ~50% smaller than JPEG at same quality
- **WebP**: ~30% smaller than JPEG at same quality
- **Automatic selection**: Browser chooses best supported format

### Responsive Images
- Mobile devices load smaller images (320px, 640px)
- Desktop devices load larger images (1024px, 1920px)
- Reduces bandwidth usage by ~60% on mobile

### Loading Strategies
- **Hero images**: Load immediately for fast LCP (Largest Contentful Paint)
- **Below-fold images**: Lazy load to reduce initial page weight
- **Width/height attributes**: Prevent CLS (Cumulative Layout Shift)

## Requirements Satisfied

This component satisfies the following requirements from the design document:

- **Requirement 1.1**: Convert images to modern formats (WebP, AVIF)
- **Requirement 1.3**: Implement lazy loading for below-the-fold images
- **Requirement 1.4**: Provide width and height attributes to prevent layout shifts
- **Requirement 1.5**: Serve WebP or AVIF when browser supports modern formats
- **Requirement 1.6**: Fallback to JPEG when browser doesn't support modern formats
- **Requirement 5.2**: Load hero images with high priority
- **Requirement 5.3**: Load below-the-fold images with low priority

## Browser Support

| Format | Browser Support |
|--------|----------------|
| AVIF | Chrome 85+, Firefox 93+, Safari 16+ |
| WebP | Chrome 23+, Firefox 65+, Safari 14+, Edge 18+ |
| JPEG | All browsers (fallback) |

The component automatically provides the best format for each browser while ensuring universal compatibility through the JPEG fallback.

## Testing

Run the test suite:

```bash
npm test
```

View the test page:

```bash
npm run dev
# Navigate to http://localhost:4321/test-optimized-image
```

## Examples

### Product Gallery

```astro
---
import OptimizedImage from '../components/OptimizedImage.astro';

const products = await getProducts();
---

<div class="grid grid-cols-3 gap-4">
  {products.map(product => (
    <OptimizedImage
      src={product.image}
      alt={product.name}
      width={400}
      height={300}
      class="rounded-lg"
    />
  ))}
</div>
```

### Hero Section

```astro
---
import OptimizedImage from '../components/OptimizedImage.astro';
---

<section class="hero">
  <OptimizedImage
    src="/hero-banner.jpg"
    alt="Welcome to our store"
    width={1920}
    height={1080}
    isHero={true}
    class="w-full h-auto"
  />
</section>
```

### Responsive Product Card

```astro
---
import OptimizedImage from '../components/OptimizedImage.astro';
---

<article class="product-card">
  <OptimizedImage
    src={product.image}
    alt={product.name}
    width={640}
    height={480}
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    class="product-image"
  />
  <h3>{product.name}</h3>
  <p>{product.price}</p>
</article>
```

## Next Steps

After implementing this component, the next tasks are:

1. **Task 2.3-2.8**: Write property-based tests for image optimization
2. **Task 2.9**: Implement error handling for image optimization failures
3. **Task 4**: Implement Asset Loader component for CSS/JS optimization
4. **Task 5**: Implement code splitting and bundle optimization

## Related Files

- Component: `src/components/OptimizedImage.astro`
- Configuration: `src/config/image-optimizer.config.ts`
- Types: `src/types/performance.ts`
- Tests: `src/components/OptimizedImage.test.ts`
- Test Page: `src/pages/test-optimized-image.astro`
- Astro Config: `astro.config.mjs`
