import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { CatalogModule } from './catalog.module';
import { HttpExceptionFilter } from '@mcom/common';

async function bootstrap() {
  const logger = new Logger('Product & Inventory Management');
  
  const app = await NestFactory.create<NestFastifyApplication>(
    CatalogModule,
    new FastifyAdapter(),
    {
      logger: ['error', 'warn', 'log', 'debug'],
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Product & Inventory Management API')
    .setDescription('Product & Inventory Management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check
  app.get('/health', (req, reply) => {
    reply.send({ 
      service: 'catalog-service',
      status: 'ok', 
      timestamp: new Date().toISOString(),
    });
  });

  const port = parseInt(process.env.PORT || '3003', 10);
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Product & Inventory Management started on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Product & Inventory Management:', error);
  process.exit(1);
});