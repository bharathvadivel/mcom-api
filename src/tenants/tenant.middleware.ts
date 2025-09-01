import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    // Example: Extract tenant_id from headers
    (req as any)['tenant_id'] = req.headers['x-tenant-id'] || null;
    next();
  }
}
