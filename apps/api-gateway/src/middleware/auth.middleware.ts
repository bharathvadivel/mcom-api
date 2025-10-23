import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const payload = this.jwtService.verify(token);
          
          // Attach user info to request
          (req as any).user = {
            id: payload.sub,
            email: payload.email,
            roles: payload.roles || [],
            tenantId: payload.tenantId,
          };
          
          this.logger.debug(`Authenticated user: ${payload.email}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.warn(`Invalid JWT token: ${errorMessage}`);
          // Continue without auth - let guards handle authorization
        }
      }
      
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Auth middleware error: ${errorMessage}`);
      next();
    }
  }
}