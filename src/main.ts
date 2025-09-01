import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  
  app.useGlobalPipes(new ValidationPipe());
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
