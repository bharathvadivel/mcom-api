import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly serviceHosts: Map<string, string> = new Map();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.initializeServiceHosts();
  }

  private initializeServiceHosts() {
    // In production, these would come from service discovery
    this.serviceHosts.set('auth-service', this.configService.get('AUTH_SERVICE_HOST', 'localhost:3001'));
    this.serviceHosts.set('tenant-service', this.configService.get('TENANT_SERVICE_HOST', 'localhost:3002'));
    this.serviceHosts.set('catalog-service', this.configService.get('CATALOG_SERVICE_HOST', 'localhost:3003'));
    this.serviceHosts.set('order-service', this.configService.get('ORDER_SERVICE_HOST', 'localhost:3004'));
    this.serviceHosts.set('payment-service', this.configService.get('PAYMENT_SERVICE_HOST', 'localhost:3005'));
    this.serviceHosts.set('media-service', this.configService.get('MEDIA_SERVICE_HOST', 'localhost:3006'));
    this.serviceHosts.set('theme-service', this.configService.get('THEME_SERVICE_HOST', 'localhost:3007'));
    this.serviceHosts.set('notification-service', this.configService.get('NOTIFICATION_SERVICE_HOST', 'localhost:3008'));
    this.serviceHosts.set('analytics-service', this.configService.get('ANALYTICS_SERVICE_HOST', 'localhost:3009'));
  }

  async proxyRequest(
    req: Request,
    res: Response,
    serviceName: string,
    fallbackPort: number,
  ): Promise<void> {
    try {
      const host = this.serviceHosts.get(serviceName) || `localhost:${fallbackPort}`;
      const targetUrl = `http://${host}${req.url}`;

      this.logger.debug(`Proxying ${req.method} ${req.url} to ${targetUrl}`);

      // Prepare headers
      const headers = { ...req.headers };
      delete headers.host; // Remove host header to avoid conflicts
      
      // Add tenant and user context
      if ((req as any).tenant) {
        headers['x-tenant-id'] = (req as any).tenant.id;
      }
      
      if ((req as any).user) {
        headers['x-user-id'] = (req as any).user.id;
        headers['x-user-email'] = (req as any).user.email;
        headers['x-user-roles'] = JSON.stringify((req as any).user.roles);
      }

      const config = {
        method: req.method.toLowerCase() as any,
        url: targetUrl,
        headers,
        data: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
        params: req.query,
        validateStatus: () => true, // Don't throw on any status code
      };

      const response = await firstValueFrom(this.httpService.request(config)) as any;

      // Copy response headers
      if (response?.headers) {
        Object.keys(response.headers).forEach(key => {
          if (key.toLowerCase() !== 'transfer-encoding') {
            res.setHeader(key, response.headers[key]);
          }
        });
      }

      res.status(response?.status || 200).json(response?.data || {});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Proxy error for ${serviceName}: ${errorMessage}`, errorStack);
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED') {
        throw new HttpException(
          `Service ${serviceName} is unavailable`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      
      throw new HttpException(
        'Internal proxy error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}