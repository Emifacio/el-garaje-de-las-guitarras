/**
 * Image Optimizer Configuration
 * Defines settings for image optimization and responsive image generation
 */

import type { ImageOptimizerConfig } from '../types/performance';

export const imageOptimizerConfig: ImageOptimizerConfig = {
  formats: ['webp', 'avif', 'jpeg'],
  widths: [320, 640, 1024, 1920],
  quality: {
    webp: 80,
    avif: 75,
    jpeg: 85
  },
  loading: 'lazy' // default, can be overridden per image
};

/**
 * Responsive breakpoints for image sizes attribute
 */
export const responsiveBreakpoints = {
  mobile: 320,
  tablet: 640,
  desktop: 1024,
  wide: 1920
};

/**
 * Determine if an image should be lazy loaded based on its position
 * @param positionY - Y position of the image in pixels from top of page
 * @returns true if image should be lazy loaded
 */
export function shouldLazyLoad(positionY: number): boolean {
  return positionY > 600; // Below 600px from top = lazy load
}

/**
 * Determine if an image is a hero image that needs priority loading
 * @param isHero - Whether the image is marked as a hero image
 * @returns loading strategy
 */
export function getLoadingStrategy(isHero: boolean): 'eager' | 'lazy' {
  return isHero ? 'eager' : 'lazy';
}
