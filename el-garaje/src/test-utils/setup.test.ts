/**
 * Basic test to verify Vitest setup
 */

import { describe, it, expect } from 'vitest';
import { createMockImage, createMockMetrics } from './setup';

describe('Test Setup', () => {
  it('should create mock image objects', () => {
    const mockImage = createMockImage();
    
    expect(mockImage).toHaveProperty('src');
    expect(mockImage).toHaveProperty('width');
    expect(mockImage).toHaveProperty('height');
    expect(mockImage).toHaveProperty('format');
  });

  it('should create mock metrics objects', () => {
    const mockMetrics = createMockMetrics();
    
    expect(mockMetrics).toHaveProperty('lcp');
    expect(mockMetrics).toHaveProperty('fid');
    expect(mockMetrics).toHaveProperty('cls');
    expect(mockMetrics).toHaveProperty('ttfb');
    expect(mockMetrics).toHaveProperty('tti');
  });

  it('should allow overriding mock values', () => {
    const customImage = createMockImage({ width: 1920, height: 1080 });
    
    expect(customImage.width).toBe(1920);
    expect(customImage.height).toBe(1080);
  });
});
