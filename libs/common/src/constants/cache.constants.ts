/**
 * Cache constants and configurations
 */
export const CACHE_CONSTANTS = {
  // TTL values in seconds
  TTL: {
    SHORT: 5 * 60,      // 5 minutes
    MEDIUM: 30 * 60,    // 30 minutes
    LONG: 2 * 60 * 60,  // 2 hours
    VERY_LONG: 24 * 60 * 60, // 24 hours
  },
  
  // Cache key prefixes
  KEYS: {
    USER: 'user',
    TENANT: 'tenant',
    PRODUCT: 'product',
    ORDER: 'order',
    SESSION: 'session',
    RATE_LIMIT: 'rate_limit',
    API_RESPONSE: 'api_response',
    SEARCH: 'search',
    ANALYTICS: 'analytics',
  },
  
  // Cache namespaces
  NAMESPACES: {
    AUTH: 'auth',
    CATALOG: 'catalog',
    ORDERS: 'orders',
    PAYMENTS: 'payments',
    MEDIA: 'media',
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics',
  },
} as const;

/**
 * Cache key generators
 */
export class CacheKeyGenerator {
  static user(userId: string): string {
    return `${CACHE_CONSTANTS.KEYS.USER}:${userId}`;
  }
  
  static tenant(tenantId: string): string {
    return `${CACHE_CONSTANTS.KEYS.TENANT}:${tenantId}`;
  }
  
  static product(tenantId: string, productId: string): string {
    return `${CACHE_CONSTANTS.KEYS.PRODUCT}:${tenantId}:${productId}`;
  }
  
  static productList(tenantId: string, params: Record<string, any>): string {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return `${CACHE_CONSTANTS.KEYS.PRODUCT}:list:${tenantId}:${paramString}`;
  }
  
  static order(tenantId: string, orderId: string): string {
    return `${CACHE_CONSTANTS.KEYS.ORDER}:${tenantId}:${orderId}`;
  }
  
  static session(sessionId: string): string {
    return `${CACHE_CONSTANTS.KEYS.SESSION}:${sessionId}`;
  }
  
  static rateLimit(identifier: string, window: string): string {
    return `${CACHE_CONSTANTS.KEYS.RATE_LIMIT}:${identifier}:${window}`;
  }
  
  static search(tenantId: string, query: string): string {
    return `${CACHE_CONSTANTS.KEYS.SEARCH}:${tenantId}:${Buffer.from(query).toString('base64')}`;
  }
  
  static analytics(tenantId: string, metric: string, period: string): string {
    return `${CACHE_CONSTANTS.KEYS.ANALYTICS}:${tenantId}:${metric}:${period}`;
  }
}