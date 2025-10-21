"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const path_1 = require("path");
exports.databaseConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'kapiom_dev_user',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'kapiom_dev',
    entities: [(0, path_1.join)(__dirname, '../**/*.entity{.ts,.js}')],
    synchronize: process.env.NODE_ENV !== 'production',
    migrations: [(0, path_1.join)(__dirname, '../database/migrations/*{.ts,.js}')],
    migrationsRun: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
        max: 20,
        min: 5,
        acquire: 60000,
        idle: 10000,
    },
};
//# sourceMappingURL=database.config.js.map