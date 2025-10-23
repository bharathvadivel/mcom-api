/**
 * Application constants
 */
export const APP_CONSTANTS = {
  // Default pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Rate limiting
  DEFAULT_RATE_LIMIT: 100,
  DEFAULT_RATE_WINDOW: 15 * 60 * 1000, // 15 minutes
  
  // File upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
  
  // JWT
  JWT_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  
  // Tenant
  DEFAULT_TENANT_PLAN: 'starter',
  MAX_PRODUCTS_PER_TENANT: {
    starter: 1000,
    professional: 10000,
    enterprise: 100000,
  },
  
  // Order
  ORDER_NUMBER_PREFIX: 'ORD-',
  MAX_ORDER_ITEMS: 100,
  
  // Currency
  DEFAULT_CURRENCY: 'USD',
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  
  // Status values
  STATUSES: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
    DELETED: 'deleted',
  },
  
  // Events
  EVENTS: {
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    ORDER_CREATED: 'order.created',
    ORDER_UPDATED: 'order.updated',
    PAYMENT_COMPLETED: 'payment.completed',
    PRODUCT_CREATED: 'product.created',
    PRODUCT_UPDATED: 'product.updated',
  },
} as const;

/**
 * HTTP Status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Environment types
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;