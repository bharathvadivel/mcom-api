import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract tenant from subdomain (e.g., shop1.mystore.com)
      const host = req.get('host') || '';
      const subdomain = host.split('.')[0];
      
      // Extract tenant from custom header
      const tenantHeader = req.get('x-tenant-id');
      
      // Extract tenant from URL path (e.g., /api/v1/tenant/{tenantId}/...)
      const pathTenant = this.extractTenantFromPath(req.path);
      
      // Priority: Header > Path > Subdomain
      const tenantId = tenantHeader || pathTenant || subdomain || 'default';
      
      // Attach tenant context to request
      (req as any).tenant = {
        id: tenantId,
        subdomain: subdomain !== tenantId ? subdomain : null,
        host,
      };
      
      this.logger.debug(`Resolved tenant: ${tenantId} from host: ${host}`);
      
      next();
    } catch (error) {
      this.logger.error(`Tenant middleware error: ${error}`);
      next();
    }
  }

  private extractTenantFromPath(path: string): string | null {
    // Match pattern: /api/v1/tenant/{tenantId}/...
    const match = path.match(/\/api\/v1\/tenant\/([^/]+)/);
    return match ? match[1] : null;
  }
}