"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const path_1 = require("path");
exports.databaseConfig = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'mcom_data',
    password: process.env.DB_PASS || 'qAWhb$p%4eXE8xfkmuKG?$73L*H!R~@z',
    database: process.env.DB_NAME || 'mcom_data',
    entities: [(0, path_1.join)(__dirname, '../**/*.entity{.ts,.js}')],
    synchronize: process.env.NODE_ENV !== 'production',
    migrations: [(0, path_1.join)(__dirname, '../database/migrations/*{.ts,.js}')],
    migrationsRun: false,
    logging: process.env.NODE_ENV === 'development',
};
//# sourceMappingURL=database.config.js.map