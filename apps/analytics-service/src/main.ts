import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AnalyticsModule } from './analytics.module';
import { HttpExceptionFilter } from '@mcom/common';

async function bootstrap() {
  const logger = new Logger('Business Intelligence & Reporting');
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AnalyticsModule,
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
    .setTitle('Business Intelligence & Reporting API')
    .setDescription('Business Intelligence & Reporting')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check
  app.get('/health', (req, reply) => {
    reply.send({ 
      service: 'analytics-service',
      status: 'ok', 
      timestamp: new Date().toISOString(),
    });
  });

  const port = parseInt(process.env.PORT || '3009', 10);
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Business Intelligence & Reporting started on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Business Intelligence & Reporting:', error);
  process.exit(1);
});