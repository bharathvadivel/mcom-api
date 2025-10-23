# MCOM API - Shopify-like eCommerce SaaS Backend

## 🏗️ Project Architecture Overview

This project implements a scalable, multi-tenant eCommerce SaaS platform inspired by Shopify's architecture. Built with NestJS, PostgreSQL, and designed for blazing-fast performance with developer-friendly extensibility.

### 🎯 Core Goals
- **Multi-Tenancy**: Isolated data, config, billing per merchant
- **Extensibility**: Custom schemas, themes, apps, webhooks
- **Scalability**: Handle thousands of stores with 100k+ products each
- **Performance**: Sub-100ms API latency globally
- **Reliability**: Fault-tolerant services with zero downtime
- **Developer Experience**: Typed SDK, shared contracts, unified monorepo

---

## 📁 Project Structure

```
mcom-api/
├── 📁 apps/                           # Microservices Applications
│   ├── 📁 api-gateway/               # Main API Gateway (Fastify + NestJS)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── 📁 middleware/        # Auth, CORS, Rate limiting
│   │   │   ├── 📁 guards/            # JWT, Tenant, Role guards  
│   │   │   ├── 📁 interceptors/      # Logging, Transform, Cache
│   │   │   ├── 📁 filters/           # Exception handling
│   │   │   └── 📁 proxy/             # Service proxy logic
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📁 auth-service/              # Authentication & Authorization
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── 📁 controllers/       # Login, register, refresh
│   │   │   ├── 📁 services/          # JWT, OAuth, Password
│   │   │   ├── 📁 strategies/        # Passport JWT, Google, etc
│   │   │   ├── 📁 entities/          # User, Role, Permission
│   │   │   └── 📁 dtos/              # Auth request/response DTOs
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📁 tenant-service/            # Store Management & Multi-tenancy
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── tenant.module.ts
│   │   │   ├── 📁 controllers/       # Store CRUD, Domain setup
│   │   │   ├── 📁 services/          # Tenant resolution, Billing
│   │   │   ├── 📁 entities/          # Store, Domain, Plan, Settings
│   │   │   ├── 📁 dtos/              # Store creation, update DTOs
│   │   │   └── 📁 middleware/        # Tenant context resolver
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📁 catalog-service/           # Product & Inventory Management
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── catalog.module.ts
│   │   │   ├── 📁 controllers/       # Products, Categories, Variants
│   │   │   ├── 📁 services/          # Search, Filters, Inventory
│   │   │   ├── 📁 entities/          # Product, Category, Variant, Stock
│   │   │   ├── 📁 dtos/              # Product CRUD DTOs
│   │   │   └── 📁 events/            # Product updated, stock events
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📁 order-service/             # Order & Checkout Management
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── order.module.ts
│   │   │   ├── 📁 controllers/       # Cart, Checkout, Orders
│   │   │   ├── 📁 services/          # Order processing, Fulfillment
│   │   │   ├── 📁 entities/          # Order, OrderItem, Cart, Address
│   │   │   ├── 📁 dtos/              # Order creation, update DTOs
│   │   │   └── 📁 workflows/         # Order state machine
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📁 payment-service/           # Payment Processing
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── payment.module.ts
│   │   │   ├── 📁 controllers/       # Payment methods, Transactions
│   │   │   ├── 📁 services/          # Stripe, PayPal integrations
│   │   │   ├── 📁 entities/          # Payment, Transaction, Refund
│   │   │   ├── 📁 dtos/              # Payment request/response
│   │   │   └── 📁 webhooks/          # Payment provider webhooks
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📁 media-service/             # File Upload & CDN Management
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── media.module.ts
│   │   │   ├── 📁 controllers/       # Upload, Download, Transform
│   │   │   ├── 📁 services/          # S3, Image optimization
│   │   │   ├── 📁 entities/          # Media, Album, Tag
│   │   │   └── 📁 processors/        # Image resize, format conversion
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📁 theme-service/             # Storefront Themes & Customization
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── theme.module.ts
│   │   │   ├── 📁 controllers/       # Theme CRUD, Assets
│   │   │   ├── 📁 services/          # Theme compiler, Asset bundler
│   │   │   ├── 📁 entities/          # Theme, Template, Asset
│   │   │   └── 📁 schemas/           # JSON schema validation
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── 📁 notification-service/      # Email, SMS, Push Notifications
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── notification.module.ts
│   │   │   ├── 📁 controllers/       # Send, Templates, History
│   │   │   ├── 📁 services/          # Email, SMS, Push providers
│   │   │   ├── 📁 entities/          # NotificationTemplate, Log
│   │   │   └── 📁 processors/        # Queue workers, Delivery
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── 📁 analytics-service/         # Business Intelligence & Reporting
│       ├── src/
│       │   ├── main.ts
│       │   ├── analytics.module.ts
│       │   ├── 📁 controllers/       # Reports, Metrics, Dashboards
│       │   ├── 📁 services/          # Data aggregation, Insights
│       │   ├── 📁 entities/          # Event, Metric, Report
│       │   └── 📁 collectors/        # Data collection workers
│       ├── Dockerfile
│       └── package.json
│
├── 📁 libs/                          # Shared Libraries & Utilities
│   ├── 📁 common/                    # Shared utilities across services
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── 📁 decorators/        # Custom decorators
│   │   │   ├── 📁 pipes/             # Validation pipes
│   │   │   ├── 📁 utils/             # Helper functions
│   │   │   ├── 📁 constants/         # App constants
│   │   │   └── 📁 interfaces/        # Common interfaces
│   │   └── package.json
│   │
│   ├── 📁 database/                  # Database configurations & utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── 📁 config/            # Database config factory
│   │   │   ├── 📁 migrations/        # Database migrations
│   │   │   ├── 📁 seeds/             # Seed data
│   │   │   └── 📁 repositories/      # Custom repository patterns
│   │   └── package.json
│   │
│   ├── 📁 messaging/                 # Event Bus & Message Queue
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── 📁 events/            # Event definitions & schemas
│   │   │   ├── 📁 publishers/        # Event publishers
│   │   │   ├── 📁 subscribers/       # Event handlers
│   │   │   └── 📁 config/            # NATS/RabbitMQ config
│   │   └── package.json
│   │
│   ├── 📁 types/                     # Shared TypeScript types & DTOs
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── 📁 dtos/              # Data Transfer Objects
│   │   │   ├── 📁 entities/          # Entity type definitions
│   │   │   ├── 📁 enums/             # Shared enums
│   │   │   └── 📁 interfaces/        # Service interfaces
│   │   └── package.json
│   │
│   ├── 📁 auth/                      # Authentication utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── 📁 guards/            # Reusable auth guards
│   │   │   ├── 📁 strategies/        # Auth strategies
│   │   │   ├── 📁 decorators/        # Auth decorators
│   │   │   └── 📁 utils/             # JWT utilities
│   │   └── package.json
│   │
│   ├── 📁 cache/                     # Redis caching utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── 📁 services/          # Cache service implementations
│   │   │   ├── 📁 decorators/        # Caching decorators
│   │   │   └── 📁 config/            # Redis configuration
│   │   └── package.json
│   │
│   └── 📁 validation/                # Shared validation schemas
│       ├── src/
│       │   ├── index.ts
│       │   ├── 📁 schemas/           # Zod/Joi validation schemas
│       │   ├── 📁 pipes/             # Custom validation pipes
│       │   └── 📁 transformers/      # Data transformers
│       └── package.json
│
├── 📁 infra/                         # Infrastructure as Code
│   ├── 📁 docker/                    # Docker configurations
│   │   ├── docker-compose.yml        # Local development stack
│   │   ├── docker-compose.prod.yml   # Production stack
│   │   └── 📁 configs/               # Service-specific configs
│   │
│   ├── 📁 kubernetes/                # K8s manifests
│   │   ├── 📁 base/                  # Base configurations
│   │   ├── 📁 overlays/              # Environment-specific overlays
│   │   │   ├── 📁 development/
│   │   │   ├── 📁 staging/
│   │   │   └── 📁 production/
│   │   └── kustomization.yaml
│   │
│   ├── 📁 terraform/                 # Cloud infrastructure
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── 📁 modules/               # Reusable modules
│   │   │   ├── 📁 vpc/
│   │   │   ├── 📁 rds/
│   │   │   ├── 📁 elasticache/
│   │   │   └── 📁 s3/
│   │   └── 📁 environments/          # Environment configs
│   │       ├── 📁 dev/
│   │       ├── 📁 staging/
│   │       └── 📁 prod/
│   │
│   └── 📁 monitoring/                # Observability stack
│       ├── prometheus.yml
│       ├── grafana/
│       │   └── dashboards/
│       └── jaeger/
│
├── 📁 scripts/                       # Development & deployment scripts
│   ├── setup.sh                     # Initial project setup
│   ├── migrate.sh                   # Database migrations
│   ├── seed.sh                      # Seed development data
│   ├── build.sh                     # Build all services
│   ├── deploy.sh                    # Deployment script
│   └── 📁 database/                  # Database utilities
│       ├── backup.sh
│       └── restore.sh
│
├── 📁 docs/                          # Documentation
│   ├── README.md                     # Getting started
│   ├── ARCHITECTURE.md              # Architecture decisions
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── 📁 examples/                  # Code examples & tutorials
│       ├── 📁 api-usage/
│       ├── 📁 webhooks/
│       └── 📁 integrations/
│
├── 📁 config/                        # Application configurations
│   ├── 📁 environments/              # Environment-specific configs
│   │   ├── development.yaml
│   │   ├── staging.yaml
│   │   └── production.yaml
│   ├── database.yaml                # Database configurations
│   ├── redis.yaml                   # Cache configurations
│   └── messaging.yaml               # Event bus configurations
│
├── 📁 tests/                         # Integration & E2E tests
│   ├── 📁 integration/               # Service integration tests
│   ├── 📁 e2e/                      # End-to-end tests
│   ├── 📁 load/                     # Performance tests
│   └── 📁 fixtures/                 # Test data fixtures
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── .dockerignore                    # Docker ignore rules
├── nest-cli.json                    # NestJS CLI configuration
├── package.json                     # Root package configuration
├── pnpm-workspace.yaml             # PNPM workspace configuration
├── tsconfig.json                    # TypeScript configuration
├── jest.config.js                  # Jest testing configuration
├── Makefile                        # Development commands
└── MAINTENANCE.md                  # This file
```

---

## 🔧 Technology Stack

### Core Framework
- **Runtime**: Node.js with TypeScript
- **Framework**: NestJS with Fastify adapter (20% better performance)
- **Package Manager**: PNPM with workspace support
- **Build Tool**: NestJS CLI + Webpack

### Database Layer
- **Primary Database**: PostgreSQL 15+ with multi-tenant architecture
- **ORM**: TypeORM with decorators and migrations
- **Caching**: Redis 7+ for sessions, rate limiting, and computed results
- **Search Engine**: Elasticsearch for product search and analytics

### Communication
- **API Protocol**: REST with OpenAPI 3.0 documentation
- **Internal Communication**: gRPC for service-to-service
- **Message Broker**: NATS Streaming for event-driven architecture
- **Real-time**: WebSocket support via Socket.IO

### Authentication & Security
- **Authentication**: JWT with refresh tokens
- **Authorization**: RBAC (Role-Based Access Control)
- **Rate Limiting**: Redis-based with sliding window
- **Security**: Helmet, CORS, input validation

### File Storage & CDN
- **Object Storage**: AWS S3 compatible (S3, MinIO, R2)
- **Image Processing**: Sharp for optimization and resizing
- **CDN**: CloudFlare for global asset delivery

### Monitoring & Observability
- **Metrics**: Prometheus with custom metrics
- **Tracing**: OpenTelemetry with Jaeger
- **Logging**: Winston with structured logging
- **Health Checks**: Built-in health check endpoints

### Development & Deployment
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes with Helm charts
- **CI/CD**: GitHub Actions with automated testing
- **Infrastructure**: Terraform for cloud resources

---

## 🚀 Getting Started

### Prerequisites
```bash
# Required tools
node >= 18.0.0
pnpm >= 8.0.0
docker >= 20.0.0
postgresql >= 13.0.0
redis >= 6.0.0
```

### Installation
```bash
# Clone and setup
git clone <repository-url>
cd mcom-api

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Start development stack
pnpm run dev:stack

# Run database migrations
pnpm run migrate

# Start development server
pnpm run dev
```

### Development Commands
```bash
# Start all services in development mode
pnpm run dev

# Start specific service
pnpm run dev:auth-service

# Build all services
pnpm run build

# Run tests
pnpm run test
pnpm run test:e2e

# Generate API documentation
pnpm run docs:generate

# Database operations
pnpm run migrate:up
pnpm run migrate:down
pnpm run seed:run
```

---

## 🏛️ Architecture Patterns

### Multi-Tenancy Strategy
- **Row-Level Security**: Each table includes `tenant_id` for data isolation
- **Tenant Resolution**: Domain/subdomain-based tenant identification
- **Data Isolation**: Automatic tenant context injection in all queries
- **Schema Flexibility**: JSON columns for tenant-specific configurations

### Event-Driven Architecture
- **Domain Events**: Product updated, order created, payment processed
- **Event Sourcing**: Critical business events stored as immutable log
- **CQRS**: Separate read/write models for complex operations
- **Saga Pattern**: Distributed transaction management

### Microservices Communication
- **Synchronous**: gRPC for immediate responses (user-facing APIs)
- **Asynchronous**: NATS for eventual consistency (background tasks)
- **Circuit Breaker**: Resilient service communication
- **Service Discovery**: Kubernetes native service discovery

### Caching Strategy
- **Application Cache**: Redis for frequently accessed data
- **Query Cache**: Database query result caching
- **CDN Cache**: Static assets and API responses
- **Distributed Cache**: Shared cache across service instances

---

## 📊 Scaling Considerations

### Performance Targets
- **API Latency**: < 100ms (95th percentile)
- **Throughput**: 10,000+ requests/second
- **Availability**: 99.9% uptime SLA
- **Database**: Handle 1M+ products per tenant

### Horizontal Scaling
- **Stateless Services**: All services designed for horizontal scaling
- **Load Balancing**: Kubernetes ingress with sticky sessions
- **Database Sharding**: Tenant-based sharding strategy
- **Queue Scaling**: Auto-scaling based on queue depth

### Regional Distribution
- **Multi-Region**: Deploy in multiple AWS/GCP regions
- **Data Replication**: Read replicas for better global performance
- **Edge Caching**: CDN for static assets and API responses
- **Geo-Routing**: Route requests to nearest region

---

## 🔒 Security & Compliance

### Data Protection
- **Encryption**: AES-256 for data at rest, TLS 1.3 in transit
- **PII Handling**: GDPR/CCPA compliant data processing
- **Audit Logs**: Comprehensive audit trail for all operations
- **Backup Strategy**: Automated encrypted backups with point-in-time recovery

### Access Control
- **Authentication**: Multi-factor authentication support
- **Authorization**: Fine-grained permissions per tenant
- **API Security**: Rate limiting, IP whitelisting, API key management
- **Network Security**: VPC, security groups, WAF protection

### Compliance Features
- **GDPR**: Right to be forgotten, data portability
- **PCI DSS**: Secure payment processing (Level 1 compliance)
- **SOC 2**: Security and availability controls
- **ISO 27001**: Information security management

---

## 🧪 Testing Strategy

### Test Pyramid
```
        🔺 E2E Tests (5%)
       🔻 Integration Tests (15%)  
    🔻 Unit Tests (80%)
```

### Testing Levels
- **Unit Tests**: Jest with >90% coverage requirement
- **Integration Tests**: Service-to-service communication testing
- **Contract Tests**: API contract validation with Pact
- **E2E Tests**: Full user journey testing with Playwright
- **Load Tests**: K6 for performance and stress testing
- **Security Tests**: OWASP ZAP for vulnerability scanning

---

## 📈 Monitoring & Alerting

### Key Metrics
- **Business Metrics**: Revenue, conversion rates, cart abandonment
- **Technical Metrics**: Response times, error rates, throughput
- **Infrastructure Metrics**: CPU, memory, disk, network usage
- **Custom Metrics**: Tenant-specific KPIs and SLAs

### Alerting Rules
- **Critical**: P0 - Service down, data corruption
- **High**: P1 - Performance degradation, high error rates
- **Medium**: P2 - Warning thresholds, capacity planning
- **Low**: P3 - Informational, trend analysis

### Dashboards
- **Executive Dashboard**: High-level business metrics
- **Operations Dashboard**: Infrastructure and service health
- **Development Dashboard**: Code quality, deployment metrics
- **Tenant Dashboard**: Per-tenant performance and usage

---

## 🔄 CI/CD Pipeline

### Continuous Integration
```yaml
# GitHub Actions workflow stages
1. Code Quality: ESLint, Prettier, SonarQube
2. Security Scan: Snyk, OWASP dependency check
3. Unit Tests: Jest with coverage reports
4. Integration Tests: Docker Compose test stack
5. Build: Docker images with semantic versioning
6. Security Scan: Container vulnerability scanning
```

### Continuous Deployment
```yaml
# Deployment strategy
1. Staging Deploy: Automatic on main branch
2. Integration Tests: Full E2E test suite
3. Production Deploy: Manual approval required
4. Blue/Green Deploy: Zero-downtime deployment
5. Health Checks: Automated rollback on failure
6. Monitoring: Enhanced monitoring during deployment
```

### Feature Flags
- **Gradual Rollouts**: Feature toggles for safe deployments
- **A/B Testing**: Built-in experimentation framework
- **Kill Switches**: Emergency feature disable capability
- **Tenant-Specific**: Per-tenant feature configuration

---

## 📚 Additional Resources

### Documentation Links
- [API Documentation](./docs/API.md) - Complete API reference
- [Architecture Guide](./docs/ARCHITECTURE.md) - Detailed architecture decisions
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [Contributing Guide](./CONTRIBUTING.md) - Development contribution guidelines

### External References
- [Shopify Architecture](https://shopify.engineering/) - Inspiration and best practices
- [Stripe API Design](https://stripe.com/docs/api) - API design principles
- [NestJS Documentation](https://docs.nestjs.com/) - Framework documentation
- [PostgreSQL Multi-tenancy](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) - Database patterns

---

## 🤝 Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct, development process, and how to submit pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the next generation of eCommerce platforms**