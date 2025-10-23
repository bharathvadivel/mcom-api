import { Controller, All, Req, Res, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('proxy')
@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @All('auth/*')
  @ApiOperation({ summary: 'Proxy to Auth Service' })
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res, 'auth-service', 3001);
  }

  @All('tenants/*')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Proxy to Tenant Service' })
  async proxyTenants(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res, 'tenant-service', 3002);
  }

  @All('catalog/*')
  @ApiOperation({ summary: 'Proxy to Catalog Service' })
  async proxyCatalog(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res, 'catalog-service', 3003);
  }

  @All('orders/*')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Proxy to Order Service' })
  async proxyOrders(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res, 'order-service', 3004);
  }

  @All('payments/*')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Proxy to Payment Service' })
  async proxyPayments(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res, 'payment-service', 3005);
  }

  @All('media/*')
  @ApiOperation({ summary: 'Proxy to Media Service' })
  async proxyMedia(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res, 'media-service', 3006);
  }

  @All('themes/*')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Proxy to Theme Service' })
  async proxyThemes(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res, 'theme-service', 3007);
  }

  @All('notifications/*')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Proxy to Notification Service' })
  async proxyNotifications(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res, 'notification-service', 3008);
  }

  @All('analytics/*')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Proxy to Analytics Service' })
  async proxyAnalytics(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res, 'analytics-service', 3009);
  }
}