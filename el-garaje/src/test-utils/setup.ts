/**
 * Test setup and utilities for Vitest
 * This file provides common test helpers and mocks
 */

import { vi } from 'vitest';

/**
 * Mock Supabase client for testing
 */
export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        limit: vi.fn(),
        order: vi.fn()
      })),
      limit: vi.fn(),
      order: vi.fn()
    })),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  })),
  auth: {
    getSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn()
  }
};

/**
 * Reset all mocks between tests
 */
export function resetMocks() {
  vi.clearAllMocks();
}

/**
 * Create a mock image object for testing
 */
export function createMockImage(overrides = {}) {
  return {
    src: '/test-image.jpg',
    width: 800,
    height: 600,
    format: 'jpeg',
    ...overrides
  };
}

/**
 * Create mock performance metrics
 */
export function createMockMetrics(overrides = {}) {
  return {
    lcp: 2000,
    fid: 50,
    cls: 0.05,
    ttfb: 400,
    tti: 3000,
    ...overrides
  };
}
