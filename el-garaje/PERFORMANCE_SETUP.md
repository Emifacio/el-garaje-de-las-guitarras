# Website Performance Optimization Setup

This document describes the infrastructure and testing framework setup for website performance improvements.

## Overview

The performance optimization system is built on top of the existing Astro project with the following key components:

- **Image Optimization**: Using Astro's built-in Image component with Sharp processor
- **Asset Loading**: Vite bundler with custom configuration for code splitting and minification
- **Caching**: HTTP cache headers configured for Vercel Edge Network
- **Performance Monitoring**: Web Vitals API integration for Core Web Vitals tracking
- **Testing**: Vitest with fast-check for property-based testing

## Dependencies Installed

### Production Dependencies
- `sharp` - High-performance image processing library
- `web-vitals` - Library for measuring Core Web Vitals metrics

### Development Dependencies
- `vitest` - Fast unit test framework powered by Vite
- `@vitest/ui` - UI for Vitest test runner
- `fast-check` - Property-based testing library

## Configuration Files

### astro.config.mjs
Updated to include Sharp image service configuration:
```javascript
image: {
  service: {
    entrypoint: 'astro/assets/services/sharp'
  },
  remotePatterns: [{ protocol: 'https' }]
}
```

### vite.config.ts
Vite configuration for build optimization:
- Manual chunk splitting for vendor dependencies
- Content hash in filenames for cache busting
- Minification enabled
- Chunk size warning at 200KB

### vitest.config.ts
Vitest test framework configuration:
- Node environment for tests
- Coverage reporting with v8 provider
- Excludes node_modules, dist, and .astro directories

## Project Structure

```
el-garaje/
├── src/
│   ├── config/
│   │   ├── image-optimizer.config.ts    # Image optimization settings
│   │   ├── asset-loader.config.ts       # Asset loading configuration
│   │   ├── cache.config.ts              # Caching strategies
│   │   └── performance-monitor.config.ts # Performance monitoring settings
│   ├── types/
│   │   └── performance.ts               # TypeScript type definitions
│   └── test-utils/
│       ├── setup.ts                     # Test utilities and mocks
│       ├── generators.ts                # Property-based test generators
│       ├── setup.test.ts                # Setup verification tests
│       └── generators.test.ts           # Generator tests
├── astro.config.mjs                     # Astro configuration
├── vite.config.ts                       # Vite build configuration
├── vitest.config.ts                     # Vitest test configuration
└── package.json                         # Dependencies and scripts
```

## NPM Scripts

- `npm run dev` - Start Astro development server
- `npm run build` - Build production site
- `npm run preview` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Run tests with coverage report

## Configuration Details

### Image Optimizer
- **Formats**: WebP, AVIF, JPEG
- **Widths**: 320px, 640px, 1024px, 1920px
- **Quality**: WebP (80), AVIF (75), JPEG (85)
- **Lazy Loading**: Images below 600px from top

### Asset Loader
- **Critical CSS**: Inline up to 14KB
- **Bundle Size Limit**: 200KB per chunk
- **Minification**: Enabled in production
- **Resource Hints**: Preload, prefetch, dns-prefetch

### Caching
- **Static Assets**: 1 year, immutable
- **HTML Pages**: 5 minutes, stale-while-revalidate 24 hours
- **API Responses**: 1 minute, stale-while-revalidate 5 minutes

### Performance Monitoring
- **LCP Target**: ≤ 2.5s
- **FID Target**: ≤ 100ms
- **CLS Target**: ≤ 0.1
- **TTFB Target**: ≤ 600ms
- **TTI Target**: ≤ 3.8s

## Testing Strategy

### Unit Tests
- Test specific examples and edge cases
- Mock external dependencies (Supabase, analytics)
- Verify component behavior

### Property-Based Tests
- Use fast-check for randomized input generation
- Verify universal properties across all inputs
- Run minimum 100 iterations per property
- Tag tests with property numbers from design document

### Test Utilities
- `createMockImage()` - Generate mock image objects
- `createMockMetrics()` - Generate mock performance metrics
- `imageArbitrary` - Random image generator for property tests
- `metricsArbitrary` - Random metrics generator for property tests

## Next Steps

The infrastructure is now ready for implementing the performance optimization features:

1. **Task 2**: Implement Image Optimizer component
2. **Task 4**: Implement Asset Loader component
3. **Task 5**: Implement code splitting and bundle optimization
4. **Task 7**: Implement Cache Manager component
5. **Task 8**: Implement Performance Monitor component
6. **Task 9**: Implement database query optimization

Each task includes both implementation and property-based tests to verify correctness.

## Verification

Run the following command to verify the setup:

```bash
npm test
```

All tests should pass, confirming that:
- Vitest is properly configured
- Test utilities are working
- Property-based test generators are functional
- TypeScript types are correctly defined

## Notes

- Astro 5 has built-in image optimization, so `@astrojs/image` is not needed
- Sharp is used as the image processing engine
- All configuration files use TypeScript for type safety
- Property-based tests will be added incrementally with each feature implementation
