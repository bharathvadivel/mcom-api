import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
	type: 'mysql',
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '3306', 10),
	username: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'm-commerce',
	entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
	synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development
	migrations: [join(__dirname, '../database/migrations/*{.ts,.js}')],
	migrationsRun: false, // Don't auto-run migrations
	logging: process.env.NODE_ENV === 'development',
 };
