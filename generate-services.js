#!/usr/bin/env node

/**
 * MCOM eCommerce SaaS - Complete Project Generator
 * Generates all remaining NestJS services with Fastify
 */

console.log('🚀 Generating Complete MCOM eCommerce SaaS Project');
console.log('==================================================\n');

const fs = require('fs');
const path = require('path');

const baseDir = process.cwd();

// Service configuration
const services = [
  {
    name: 'tenant-service',
    port: 3002,
    description: 'Store Management & Multi-tenancy',
    controllers: ['tenant.controller.ts', 'store.controller.ts', 'domain.controller.ts'],
    entities: ['store.entity.ts', 'domain.entity.ts', 'plan.entity.ts', 'settings.entity.ts'],
  },
  {
    name: 'catalog-service',
    port: 3003,
    description: 'Product & Inventory Management',
    controllers: ['product.controller.ts', 'category.controller.ts', 'inventory.controller.ts'],
    entities: ['product.entity.ts', 'category.entity.ts', 'variant.entity.ts', 'inventory.entity.ts'],
  },
  {
    name: 'order-service',
    port: 3004,
    description: 'Order & Checkout Management',
    controllers: ['order.controller.ts', 'cart.controller.ts', 'checkout.controller.ts'],
    entities: ['order.entity.ts', 'order-item.entity.ts', 'cart.entity.ts', 'address.entity.ts'],
  },
  {
    name: 'payment-service',
    port: 3005,
    description: 'Payment Processing',
    controllers: ['payment.controller.ts', 'transaction.controller.ts', 'webhook.controller.ts'],
    entities: ['payment.entity.ts', 'transaction.entity.ts', 'refund.entity.ts'],
  },
  {
    name: 'media-service',
    port: 3006,
    description: 'File Upload & CDN Management',
    controllers: ['media.controller.ts', 'upload.controller.ts'],
    entities: ['media.entity.ts', 'album.entity.ts'],
  },
  {
    name: 'theme-service',
    port: 3007,
    description: 'Storefront Themes & Customization',
    controllers: ['theme.controller.ts', 'template.controller.ts'],
    entities: ['theme.entity.ts', 'template.entity.ts', 'asset.entity.ts'],
  },
  {
    name: 'notification-service',
    port: 3008,
    description: 'Email, SMS, Push Notifications',
    controllers: ['notification.controller.ts', 'template.controller.ts'],
    entities: ['notification.entity.ts', 'notification-log.entity.ts'],
  },
  {
    name: 'analytics-service',
    port: 3009,
    description: 'Business Intelligence & Reporting',
    controllers: ['analytics.controller.ts', 'report.controller.ts'],
    entities: ['event.entity.ts', 'metric.entity.ts', 'report.entity.ts'],
  },
];

function createServiceStructure(service) {
  console.log(`📦 Creating ${service.name}...`);
  
  const serviceDir = path.join(baseDir, 'apps', service.name);
  
  // Create directories
  const dirs = [
    'src',
    'src/controllers',
    'src/services',
    'src/entities',
    'src/dtos',
    'src/strategies',
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(serviceDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  
  // Generate main.ts
  const mainContent = generateMainFile(service);
  fs.writeFileSync(path.join(serviceDir, 'src', 'main.ts'), mainContent);
  
  // Generate module file
  const moduleContent = generateModuleFile(service);
  fs.writeFileSync(path.join(serviceDir, 'src', `${service.name.replace('-service', '')}.module.ts`), moduleContent);
  
  // Generate package.json
  const packageContent = generatePackageJson(service);
  fs.writeFileSync(path.join(serviceDir, 'package.json'), packageContent);
  
  // Generate Dockerfile
  const dockerContent = generateDockerfile(service);
  fs.writeFileSync(path.join(serviceDir, 'Dockerfile'), dockerContent);
  
  console.log(`✅ ${service.name} created successfully`);
}

function generateMainFile(service) {
  const moduleName = service.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('').replace('Service', 'Module');
  
  return `import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ${moduleName} } from './${service.name.replace('-service', '')}.module';
import { HttpExceptionFilter } from '@mcom/common';

async function bootstrap() {
  const logger = new Logger('${service.description}');
  
  const app = await NestFactory.create<NestFastifyApplication>(
    ${moduleName},
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
    .setTitle('${service.description} API')
    .setDescription('${service.description}')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Health check
  app.get('/health', (req, reply) => {
    reply.send({ 
      service: '${service.name}',
      status: 'ok', 
      timestamp: new Date().toISOString(),
    });
  });

  const port = process.env.PORT || ${service.port};
  await app.listen(port, '0.0.0.0');
  
  logger.log(\`🚀 ${service.description} started on http://localhost:\${port}\`);
}

bootstrap().catch((error) => {
  console.error('Failed to start ${service.description}:', error);
  process.exit(1);
});`;
}

function generateModuleFile(service) {
  const moduleName = service.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('').replace('Service', 'Module');
  
  return `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@mcom/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    // TypeOrmModule.forFeature([/* Add entities here */]),
  ],
  controllers: [
    // Add controllers here
  ],
  providers: [
    // Add services here
  ],
  exports: [
    // Add exports here
  ],
})
export class ${moduleName} {}`;
}

function generatePackageJson(service) {
  return JSON.stringify({
    "name": service.name,
    "version": "1.0.0",
    "main": "dist/main.js",
    "scripts": {
      "build": "nest build",
      "dev": "nest start --watch",
      "start": "nest start",
      "start:prod": "node dist/main.js",
      "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:cov": "jest --coverage"
    },
    "dependencies": {
      "@nestjs/common": "^10.2.10",
      "@nestjs/core": "^10.2.10",
      "@nestjs/platform-fastify": "^10.2.10",
      "@nestjs/swagger": "^7.1.16",
      "@nestjs/config": "^3.1.1",
      "@nestjs/typeorm": "^10.0.1",
      "@mcom/common": "workspace:*",
      "@mcom/database": "workspace:*",
      "@mcom/types": "workspace:*",
      "typeorm": "^0.3.17",
      "rxjs": "^7.8.1",
      "reflect-metadata": "^0.1.13"
    },
    "devDependencies": {
      "@nestjs/cli": "^10.2.1",
      "@nestjs/testing": "^10.2.10",
      "@types/node": "^20.8.0",
      "jest": "^29.7.0",
      "ts-jest": "^29.1.1",
      "typescript": "^5.2.2"
    }
  }, null, 2);
}

function generateDockerfile(service) {
  return `# ${service.description} Dockerfile
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

EXPOSE ${service.port}

CMD ["pnpm", "run", "start:prod"]

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=development /app/dist ./dist

EXPOSE ${service.port}

CMD ["node", "dist/main.js"]`;
}

// Execute generation
console.log('Starting service generation...\n');

services.forEach(service => {
  createServiceStructure(service);
});

console.log('\n🎉 All services generated successfully!');
console.log('\nNext steps:');
console.log('1. Run: pnpm install');
console.log('2. Update each service module with specific controllers and entities');
console.log('3. Implement business logic for each service');
console.log('4. Run: pnpm run dev to start all services');
console.log('\n✨ Your Shopify-like eCommerce SaaS is ready for development!');