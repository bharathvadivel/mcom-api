import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { PaymentModule } from './payment.module';
import { HttpExceptionFilter } from '@mcom/common';

async function bootstrap() {
  const logger = new Logger('Payment Processing');
  
  const app = await NestFactory.create<NestFastifyApplication>(
    PaymentModule,
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
    .setTitle('Payment Processing API')
    .setDescription('Payment Processing')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check
  app.get('/health', (req, reply) => {
    reply.send({ 
      service: 'payment-service',
      status: 'ok', 
      timestamp: new Date().toISOString(),
    });
  });

  const port = parseInt(process.env.PORT || '3005', 10);
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Payment Processing started on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Payment Processing:', error);
  process.exit(1);
});