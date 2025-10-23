/**
 * Common interfaces used across the application
 */

/**
 * Base entity interface
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Tenant-aware entity interface
 */
export interface TenantEntity extends BaseEntity {
  tenantId: string;
}

/**
 * Pagination interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Search params interface
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

/**
 * Cache options interface
 */
export interface CacheOptions {
  ttl?: number;
  key?: string;
  namespace?: string;
}

/**
 * File upload interface
 */
export interface FileUpload {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: any;
  path?: string;
  url?: string;
}

/**
 * API error interface
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  path: string;
}

/**
 * User context interface
 */
export interface UserContext {
  userId: string;
  tenantId?: string;
  roles: string[];
  permissions: string[];
  email: string;
}

/**
 * Tenant context interface
 */
export interface TenantContext {
  tenantId: string;
  subdomain: string;
  customDomain?: string;
  plan: string;
  status: string;
  settings: Record<string, any>;
}

/**
 * Event payload interface
 */
export interface EventPayload<T = any> {
  eventType: string;
  entityType: string;
  entityId: string;
  tenantId?: string;
  userId?: string;
  data: T;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Configuration interface
 */
export interface Config {
  environment: string;
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  file: FileConfig;
  email: EmailConfig;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
  logging?: boolean;
}

/**
 * Redis configuration
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

/**
 * JWT configuration
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

/**
 * File configuration
 */
export interface FileConfig {
  provider: 'local' | 's3' | 'gcs';
  maxSize: number;
  allowedTypes: string[];
  uploadPath?: string;
  bucket?: string;
  region?: string;
}

/**
 * Email configuration
 */
export interface EmailConfig {
  provider: 'smtp' | 'ses' | 'sendgrid';
  from: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  apiKey?: string;
}