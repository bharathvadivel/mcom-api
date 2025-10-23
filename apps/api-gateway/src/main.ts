import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@mcom/common';

async function bootstrap() {
  const logger = new Logger('API Gateway');
  
  // Create Fastify adapter for better performance
  const fastifyAdapter = new FastifyAdapter();
  
  // Register CORS plugin (will be configured when dependencies are installed)
  // fastifyAdapter.register(require('@fastify/cors'), {
  //   origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  //   credentials: true,
  // });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    },
  );

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MCOM eCommerce API Gateway')
    .setDescription('Shopify-like eCommerce SaaS API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Authorization')
    .addTag('tenants', 'Store Management')
    .addTag('catalog', 'Product & Inventory')
    .addTag('orders', 'Order & Checkout')
    .addTag('payments', 'Payment Processing')
    .addTag('media', 'File Upload & Management')
    .addTag('themes', 'Storefront Themes')
    .addTag('notifications', 'Notifications')
    .addTag('analytics', 'Business Intelligence')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Health check
  app.get('/health', (req, reply) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 API Gateway started on http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});