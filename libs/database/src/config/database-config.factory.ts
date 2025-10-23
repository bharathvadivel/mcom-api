import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class DatabaseConfigFactory {
  static createTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: configService.get('DB_HOST', 'localhost'),
      port: configService.get('DB_PORT', 5432),
      username: configService.get('DB_USERNAME', 'postgres'),
      password: configService.get('DB_PASSWORD', 'password'),
      database: configService.get('DB_NAME', 'mcom_ecommerce'),
      synchronize: configService.get('DB_SYNCHRONIZE', false),
      logging: configService.get('DB_LOGGING', false),
      entities: [
        join(__dirname, '../../../**/*.entity{.ts,.js}'),
      ],
      migrations: [
        join(__dirname, '../migrations/*{.ts,.js}'),
      ],
      subscribers: [
        join(__dirname, '../subscribers/*{.ts,.js}'),
      ],
      migrationsRun: configService.get('DB_MIGRATIONS_RUN', false),
      ssl: configService.get('DB_SSL', false) ? {
        rejectUnauthorized: false,
      } : false,
      extra: {
        connectionLimit: configService.get('DB_CONNECTION_LIMIT', 10),
        acquireTimeout: configService.get('DB_ACQUIRE_TIMEOUT', 60000),
        timeout: configService.get('DB_TIMEOUT', 60000),
      },
      // Multi-tenant configuration
      schema: configService.get('DB_SCHEMA', 'public'),
    };
  }

  static createTenantConnection(
    configService: ConfigService,
    tenantId: string,
  ): TypeOrmModuleOptions {
    const baseConfig = this.createTypeOrmOptions(configService);
    
    return {
      ...baseConfig,
      name: `tenant_${tenantId}`,
      schema: `tenant_${tenantId}`,
      // Each tenant can have its own database
      database: configService.get('MULTI_DB_MODE', false) 
        ? `${baseConfig.database}_${tenantId}`
        : baseConfig.database,
    };
  }
}