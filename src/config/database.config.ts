import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'kapiom_dev_user',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'kapiom_dev',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development
  migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
  migrationsRun: false, // Don't auto-run migrations
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    // Connection pool settings for PostgreSQL
    max: 20,
    min: 5,
    acquire: 60000,
    idle: 10000,
  },
};
