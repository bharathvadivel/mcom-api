export const TENANT_ID_METADATA = 'tenant_id';

/**
 * Decorator to mark a parameter as tenant ID
 */
export const TenantId = () => {
  return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
    // Implementation will be added when @nestjs/common is available
  };
};

/**
 * Decorator to mark a controller/handler as tenant-aware
 */
export const TenantAware = () => {
  return (target: any) => {
    // Implementation will be added when @nestjs/common is available
  };
};