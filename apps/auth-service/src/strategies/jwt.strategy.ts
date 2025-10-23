import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy {
  constructor() {
    // Implementation will be added when dependencies are installed
  }

  async validate(payload: any): Promise<any> {
    // Implementation will be added when dependencies are installed
    return { userId: payload.sub, email: payload.email };
  }
}