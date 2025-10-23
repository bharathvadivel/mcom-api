/**
 * Validation constants
 */
export const VALIDATION_CONSTANTS = {
  // String length limits
  STRING_LENGTH: {
    SHORT: 50,
    MEDIUM: 255,
    LONG: 1000,
    VERY_LONG: 5000,
  },
  
  // Email validation
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  // Password validation
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  
  // Phone validation
  PHONE: {
    REGEX: /^\+?[1-9]\d{1,14}$/,
  },
  
  // URL validation
  URL: {
    REGEX: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  },
  
  // Slug validation
  SLUG: {
    REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    MAX_LENGTH: 100,
  },
  
  // Numeric validation
  NUMERIC: {
    PRICE: {
      MIN: 0,
      MAX: 999999.99,
      DECIMAL_PLACES: 2,
    },
    QUANTITY: {
      MIN: 0,
      MAX: 999999,
    },
    PERCENTAGE: {
      MIN: 0,
      MAX: 100,
    },
  },
  
  // File validation
  FILE: {
    IMAGE: {
      MAX_SIZE: 10 * 1024 * 1024, // 10MB
      ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    },
    DOCUMENT: {
      MAX_SIZE: 50 * 1024 * 1024, // 50MB
      ALLOWED_TYPES: ['application/pdf', 'text/plain', 'application/msword'],
      ALLOWED_EXTENSIONS: ['.pdf', '.txt', '.doc', '.docx'],
    },
  },
  
  // Array validation
  ARRAY: {
    MAX_ITEMS: 100,
    TAGS_MAX: 20,
  },
} as const;

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_SLUG: 'Slug can only contain lowercase letters, numbers and hyphens',
  TOO_SHORT: 'This field is too short',
  TOO_LONG: 'This field is too long',
  INVALID_FORMAT: 'Invalid format',
  ALREADY_EXISTS: 'This value already exists',
  NOT_FOUND: 'Resource not found',
  INVALID_PRICE: 'Price must be a positive number with up to 2 decimal places',
  INVALID_QUANTITY: 'Quantity must be a positive integer',
  FILE_TOO_LARGE: 'File size is too large',
  INVALID_FILE_TYPE: 'File type is not supported',
  TOO_MANY_ITEMS: 'Too many items in array',
} as const;