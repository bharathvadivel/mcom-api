"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
    });
    const port = 3001;
    await app.listen(port, '127.0.0.1');
    console.log('Application is running on: http://localhost:3001');
}
bootstrap().catch((error) => {
    console.error('Error starting server:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map