import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalStrategy {
  constructor() {
    // Implementation will be added when dependencies are installed
  }

  async validate(email: string, password: string): Promise<any> {
    // Implementation will be added when dependencies are installed
    return { email };
  }
}