import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.body.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    try {
      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'changeme';
      const payload = jwt.verify(refreshToken, secret);
      request.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
