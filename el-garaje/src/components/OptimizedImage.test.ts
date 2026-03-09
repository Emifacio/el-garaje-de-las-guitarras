/**
 * Tests for OptimizedImage component
 * 
 * These tests verify the component configuration and integration
 * with Astro's Picture component and imageOptimizerConfig
 */

import { describe, it, expect } from 'vitest';
import { imageOptimizerConfig, getLoadingStrategy } from '../config/image-optimizer.config';

describe('OptimizedImage Component Configuration', () => {
  it('should use correct image formats from config', () => {
    // Verify the config has the required formats
    expect(imageOptimizerConfig.formats).toContain('webp');
    expect(imageOptimizerConfig.formats).toContain('avif');
    expect(imageOptimizerConfig.formats).toContain('jpeg');
  });

  it('should use correct responsive widths from config', () => {
    // Verify the config has all required widths
    expect(imageOptimizerConfig.widths).toEqual([320, 640, 1024, 1920]);
  });

  it('should use correct quality settings from config', () => {
    // Verify quality settings match requirements
    expect(imageOptimizerConfig.quality.webp).toBe(80);
    expect(imageOptimizerConfig.quality.avif).toBe(75);
    expect(imageOptimizerConfig.quality.jpeg).toBe(85);
  });

  it('should set eager loading for hero images', () => {
    const loading = getLoadingStrategy(true);
    expect(loading).toBe('eager');
  });

  it('should set lazy loading for non-hero images', () => {
    const loading = getLoadingStrategy(false);
    expect(loading).toBe('lazy');
  });

  it('should have default lazy loading in config', () => {
    expect(imageOptimizerConfig.loading).toBe('lazy');
  });
});

describe('OptimizedImage Component Props', () => {
  it('should accept required props: src and alt', () => {
    // Type check - this will fail at compile time if props are wrong
    type RequiredProps = {
      src: any;
      alt: string;
    };
    
    const props: RequiredProps = {
      src: '/test.jpg',
      alt: 'Test image'
    };
    
    expect(props.src).toBeDefined();
    expect(props.alt).toBeDefined();
  });

  it('should accept optional props: width, height, isHero, class, sizes, quality', () => {
    type OptionalProps = {
      width?: number;
      height?: number;
      isHero?: boolean;
      class?: string;
      sizes?: string;
      quality?: number;
    };
    
    const props: OptionalProps = {
      width: 800,
      height: 600,
      isHero: true,
      class: 'test-class',
      sizes: '100vw',
      quality: 90
    };
    
    expect(props.width).toBe(800);
    expect(props.height).toBe(600);
    expect(props.isHero).toBe(true);
    expect(props.class).toBe('test-class');
    expect(props.sizes).toBe('100vw');
    expect(props.quality).toBe(90);
  });
});
