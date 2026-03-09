/**
 * Tests for Image Optimizer Configuration
 * Validates configuration values and helper functions
 */

import { describe, it, expect } from 'vitest';
import { 
  imageOptimizerConfig, 
  responsiveBreakpoints,
  shouldLazyLoad,
  getLoadingStrategy
} from './image-optimizer.config';

describe('Image Optimizer Configuration', () => {
  describe('imageOptimizerConfig', () => {
    it('should have correct format settings', () => {
      expect(imageOptimizerConfig.formats).toEqual(['webp', 'avif', 'jpeg']);
    });

    it('should have correct responsive breakpoints', () => {
      expect(imageOptimizerConfig.widths).toEqual([320, 640, 1024, 1920]);
    });

    it('should have correct quality settings', () => {
      expect(imageOptimizerConfig.quality.webp).toBe(80);
      expect(imageOptimizerConfig.quality.avif).toBe(75);
      expect(imageOptimizerConfig.quality.jpeg).toBe(85);
    });

    it('should have lazy loading as default', () => {
      expect(imageOptimizerConfig.loading).toBe('lazy');
    });
  });

  describe('responsiveBreakpoints', () => {
    it('should define all breakpoint sizes', () => {
      expect(responsiveBreakpoints.mobile).toBe(320);
      expect(responsiveBreakpoints.tablet).toBe(640);
      expect(responsiveBreakpoints.desktop).toBe(1024);
      expect(responsiveBreakpoints.wide).toBe(1920);
    });
  });

  describe('shouldLazyLoad', () => {
    it('should return false for images above 600px threshold', () => {
      expect(shouldLazyLoad(0)).toBe(false);
      expect(shouldLazyLoad(300)).toBe(false);
      expect(shouldLazyLoad(600)).toBe(false);
    });

    it('should return true for images below 600px threshold', () => {
      expect(shouldLazyLoad(601)).toBe(true);
      expect(shouldLazyLoad(1000)).toBe(true);
      expect(shouldLazyLoad(5000)).toBe(true);
    });

    it('should handle edge case at exactly 600px', () => {
      expect(shouldLazyLoad(600)).toBe(false);
    });
  });

  describe('getLoadingStrategy', () => {
    it('should return eager for hero images', () => {
      expect(getLoadingStrategy(true)).toBe('eager');
    });

    it('should return lazy for non-hero images', () => {
      expect(getLoadingStrategy(false)).toBe('lazy');
    });
  });
});
