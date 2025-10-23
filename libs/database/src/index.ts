// Database module exports
export * from './entities';
export * from './services/tenant-connection.service';

// Configuration interfaces
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
  ssl?: boolean;
  synchronize?: boolean;
  logging?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Database module will be properly configured when TypeORM is set up
export class DatabaseModule {
  static forRoot(config: DatabaseConfig) {
    // Implementation will be added when @nestjs/typeorm is available
    return {
      module: DatabaseModule,
      // providers: [...],
      // exports: [...],
    };
  }

  static forFeature(entities: any[]) {
    // Implementation will be added when @nestjs/typeorm is available
    return {
      module: DatabaseModule,
      // providers: [...],
      // exports: [...],
    };
  }
}