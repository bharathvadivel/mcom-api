/**
 * Standard API response interfaces
 */

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
  timestamp: string;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
  traceId?: string;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: ValidationErrorDetail[];
  };
}

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}

/**
 * Paginated success response
 */
export interface PaginatedSuccessResponse<T> extends SuccessResponse<T[]> {
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    [key: string]: any;
  };
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  info?: Record<string, any>;
  error?: Record<string, any>;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse<T = any> {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  results: BulkOperationResult<T>[];
  errors?: BulkOperationError[];
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T = any> {
  id?: string;
  operation: 'create' | 'update' | 'delete';
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Bulk operation error
 */
export interface BulkOperationError {
  index: number;
  operation: 'create' | 'update' | 'delete';
  error: string;
  data?: any;
}

/**
 * Search response
 */
export interface SearchResponse<T = any> {
  results: T[];
  total: number;
  took: number;
  query: string;
  filters?: Record<string, any>;
  facets?: SearchFacet[];
  suggestions?: string[];
}

/**
 * Search facet
 */
export interface SearchFacet {
  field: string;
  values: SearchFacetValue[];
}

/**
 * Search facet value
 */
export interface SearchFacetValue {
  value: string;
  count: number;
  selected?: boolean;
}

/**
 * API response wrapper utility
 */
export class ApiResponseUtil {
  /**
   * Create a success response
   */
  static success<T>(data: T, message?: string, meta?: Record<string, any>): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an error response
   */
  static error(code: string, message: string, details?: any, path?: string): ErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
      path: path || '',
    };
  }

  /**
   * Create a validation error response
   */
  static validationError(details: ValidationErrorDetail[], path?: string): ValidationErrorResponse {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
      timestamp: new Date().toISOString(),
      path: path || '',
    };
  }

  /**
   * Create a paginated success response
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): PaginatedSuccessResponse<T> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data,
      message,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}