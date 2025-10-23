# Development Commands Makefile
# Run 'make help' to see all available commands

.PHONY: help install dev build test clean docker k8s

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

## Help
help: ## Show this help message
	@echo "$(GREEN)MCOM eCommerce SaaS - Available Commands$(NC)"
	@echo "=========================================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(BLUE)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Development
install: ## Install all dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	pnpm install

dev: ## Start all services in development mode
	@echo "$(YELLOW)Starting development servers...$(NC)"
	pnpm run dev

dev-gateway: ## Start API Gateway only
	@echo "$(YELLOW)Starting API Gateway...$(NC)"
	pnpm run dev:gateway

dev-stop: ## Stop development services
	@echo "$(YELLOW)Stopping development services...$(NC)"
	pnpm run dev:stop

## Building
build: ## Build all services and libraries
	@echo "$(YELLOW)Building all services...$(NC)"
	pnpm run build

build-libs: ## Build shared libraries only
	@echo "$(YELLOW)Building shared libraries...$(NC)"
	pnpm run build:libs

build-apps: ## Build applications only
	@echo "$(YELLOW)Building applications...$(NC)"
	pnpm run build:apps

## Testing
test: ## Run unit tests
	@echo "$(YELLOW)Running unit tests...$(NC)"
	pnpm run test

test-e2e: ## Run end-to-end tests
	@echo "$(YELLOW)Running E2E tests...$(NC)"
	pnpm run test:e2e

test-cov: ## Run tests with coverage
	@echo "$(YELLOW)Running tests with coverage...$(NC)"
	pnpm run test:cov

test-load: ## Run load tests
	@echo "$(YELLOW)Running load tests...$(NC)"
	pnpm run test:load

## Database
migrate-up: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(NC)"
	pnpm run migrate:up

migrate-down: ## Rollback database migrations
	@echo "$(YELLOW)Rolling back migrations...$(NC)"
	pnpm run migrate:down

seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(NC)"
	pnpm run seed

db-reset: ## Reset database (migrate down, up, and seed)
	@echo "$(YELLOW)Resetting database...$(NC)"
	pnpm run db:reset

## Docker
docker-up: ## Start infrastructure services with Docker
	@echo "$(YELLOW)Starting Docker services...$(NC)"
	pnpm run docker:up

docker-down: ## Stop Docker services
	@echo "$(YELLOW)Stopping Docker services...$(NC)"
	pnpm run docker:down

docker-logs: ## View Docker service logs
	@echo "$(YELLOW)Viewing Docker logs...$(NC)"
	pnpm run docker:logs

docker-build: ## Build Docker images
	@echo "$(YELLOW)Building Docker images...$(NC)"
	pnpm run docker:build

docker-prod-up: ## Start production Docker stack
	@echo "$(YELLOW)Starting production Docker stack...$(NC)"
	pnpm run docker:prod:up

docker-prod-down: ## Stop production Docker stack
	@echo "$(YELLOW)Stopping production Docker stack...$(NC)"
	pnpm run docker:prod:down

## Kubernetes
k8s-apply: ## Deploy to Kubernetes (development)
	@echo "$(YELLOW)Deploying to Kubernetes...$(NC)"
	pnpm run k8s:apply

k8s-delete: ## Delete Kubernetes deployment
	@echo "$(YELLOW)Deleting Kubernetes deployment...$(NC)"
	pnpm run k8s:delete

k8s-status: ## Check Kubernetes deployment status
	@echo "$(YELLOW)Checking Kubernetes status...$(NC)"
	kubectl get pods -n mcom-dev

k8s-logs: ## View Kubernetes logs
	@echo "$(YELLOW)Viewing Kubernetes logs...$(NC)"
	kubectl logs -f -n mcom-dev -l app=api-gateway

## Code Quality
lint: ## Run ESLint
	@echo "$(YELLOW)Running ESLint...$(NC)"
	pnpm run lint

lint-fix: ## Fix ESLint errors
	@echo "$(YELLOW)Fixing ESLint errors...$(NC)"
	pnpm run lint:fix

format: ## Format code with Prettier
	@echo "$(YELLOW)Formatting code...$(NC)"
	pnpm run format

format-check: ## Check code formatting
	@echo "$(YELLOW)Checking code formatting...$(NC)"
	pnpm run format:check

## Documentation
docs-generate: ## Generate API documentation
	@echo "$(YELLOW)Generating API documentation...$(NC)"
	pnpm run docs:generate

docs-serve: ## Serve documentation locally
	@echo "$(YELLOW)Serving documentation...$(NC)"
	pnpm run docs:serve

## Cleanup
clean: ## Clean build artifacts and node_modules
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	pnpm run clean
	find . -name "node_modules" -type d -prune -exec rm -rf {} +
	find . -name "dist" -type d -prune -exec rm -rf {} +

clean-docker: ## Clean Docker images and volumes
	@echo "$(YELLOW)Cleaning Docker images and volumes...$(NC)"
	docker system prune -af --volumes

## Setup
setup: install docker-up migrate-up seed ## Complete project setup
	@echo "$(GREEN)✅ Project setup completed successfully!$(NC)"
	@echo "$(GREEN)🌐 API Gateway: http://localhost:3000$(NC)"
	@echo "$(GREEN)📚 API Docs: http://localhost:3000/api/docs$(NC)"
	@echo "$(GREEN)🔍 Health Check: http://localhost:3000/health$(NC)"

## Status
status: ## Show service status
	@echo "$(GREEN)MCOM eCommerce SaaS - Service Status$(NC)"
	@echo "====================================="
	@curl -s http://localhost:3000/health || echo "❌ API Gateway not running"
	@curl -s http://localhost:3001/health || echo "❌ Auth Service not running"  
	@curl -s http://localhost:3002/health || echo "❌ Tenant Service not running"
	@curl -s http://localhost:3003/health || echo "❌ Catalog Service not running"
	@curl -s http://localhost:3004/health || echo "❌ Order Service not running"
	@curl -s http://localhost:3005/health || echo "❌ Payment Service not running"

## Production
deploy-staging: ## Deploy to staging environment
	@echo "$(YELLOW)Deploying to staging...$(NC)"
	# Add deployment script here

deploy-prod: ## Deploy to production environment
	@echo "$(YELLOW)Deploying to production...$(NC)"
	# Add deployment script here

## Monitoring
monitor: ## Open monitoring dashboards
	@echo "$(GREEN)Opening monitoring dashboards...$(NC)"
	@echo "📊 Prometheus: http://localhost:9090"
	@echo "📈 Grafana: http://localhost:3010"
	@echo "🔍 API Docs: http://localhost:3000/api/docs"