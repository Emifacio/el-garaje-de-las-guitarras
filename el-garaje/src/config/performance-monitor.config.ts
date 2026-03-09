/**
 * Performance Monitoring Configuration
 * Defines settings for Core Web Vitals tracking and reporting
 */

/**
 * Performance thresholds based on Google's Core Web Vitals
 */
export const performanceThresholds = {
  lcp: {
    good: 2500, // ms
    needsImprovement: 4000,
    poor: Infinity
  },
  fid: {
    good: 100, // ms
    needsImprovement: 300,
    poor: Infinity
  },
  cls: {
    good: 0.1, // score
    needsImprovement: 0.25,
    poor: Infinity
  },
  ttfb: {
    good: 600, // ms
    needsImprovement: 1500,
    poor: Infinity
  },
  tti: {
    good: 3800, // ms
    needsImprovement: 7300,
    poor: Infinity
  }
};

/**
 * Performance monitoring configuration
 */
export const monitoringConfig = {
  enabled: true,
  batchSize: 10, // Send metrics after collecting 10 samples
  batchInterval: 30000, // Or send after 30 seconds
  maxQueueSize: 100, // Maximum metrics to queue in localStorage
  retryAttempts: 3,
  retryDelay: 1000, // Initial retry delay in ms (exponential backoff)
  analyticsEndpoint: '/api/analytics/performance'
};

/**
 * Alert configuration for performance degradation
 */
export const alertConfig = {
  enabled: true,
  degradationThreshold: 0.2, // 20% degradation triggers alert
  alertEndpoint: '/api/alerts/performance'
};

/**
 * Determine performance rating based on metric value
 */
export function getPerformanceRating(
  metric: keyof typeof performanceThresholds,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = performanceThresholds[metric];
  
  if (value <= thresholds.good) {
    return 'good';
  } else if (value <= thresholds.needsImprovement) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

/**
 * Detect device type from user agent
 */
export function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = window.navigator.userAgent;
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

/**
 * Detect page type from URL
 */
export function detectPageType(url: string): 'home' | 'catalog' | 'product' | 'admin' | 'contact' {
  if (url === '/' || url === '/index.html') return 'home';
  if (url.includes('/catalog') || url.includes('/category')) return 'catalog';
  if (url.includes('/product')) return 'product';
  if (url.includes('/admin')) return 'admin';
  if (url.includes('/contact')) return 'contact';
  return 'home';
}
