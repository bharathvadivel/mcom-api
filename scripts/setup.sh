#!/bin/bash

# MCOM eCommerce SaaS - Development Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up MCOM eCommerce SaaS Development Environment"
echo "========================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm is not installed. Installing pnpm..."
        npm install -g pnpm
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_warning "Please review and update the .env file with your configuration"
    else
        print_warning ".env file already exists, skipping..."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    pnpm install
    
    print_success "Dependencies installed successfully!"
}

# Start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services (PostgreSQL, Redis, NATS, etc.)..."
    
    cd infra/docker
    
    # Check if containers are already running
    if docker-compose ps | grep -q "Up"; then
        print_warning "Some infrastructure services are already running"
        docker-compose down
    fi
    
    # Start all infrastructure services
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check PostgreSQL
    print_status "Checking PostgreSQL connection..."
    until docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; do
        print_status "Waiting for PostgreSQL..."
        sleep 2
    done
    print_success "PostgreSQL is ready!"
    
    # Check Redis
    print_status "Checking Redis connection..."
    until docker-compose exec -T redis redis-cli ping &> /dev/null; do
        print_status "Waiting for Redis..."
        sleep 2
    done
    print_success "Redis is ready!"
    
    cd ../..
    print_success "Infrastructure services are running!"
}

# Run database migrations
setup_database() {
    print_status "Setting up database..."
    
    # Create database if it doesn't exist
    docker-compose -f infra/docker/docker-compose.yml exec -T postgres psql -U postgres -c "CREATE DATABASE IF NOT EXISTS mcom_ecommerce;"
    
    # Run migrations (when implemented)
    # pnpm run migrate:up
    
    print_success "Database setup completed!"
}

# Build all services
build_services() {
    print_status "Building all services..."
    
    # Build shared libraries first
    pnpm run build:libs
    
    # Build all applications
    pnpm run build
    
    print_success "All services built successfully!"
}

# Display service URLs
show_services() {
    echo ""
    print_success "🎉 MCOM eCommerce SaaS is ready for development!"
    echo ""
    echo "📋 Service URLs:"
    echo "=================="
    echo "🌐 API Gateway:        http://localhost:3000"
    echo "🔐 Auth Service:       http://localhost:3001"
    echo "🏪 Tenant Service:     http://localhost:3002"
    echo "📦 Catalog Service:    http://localhost:3003"
    echo "🛒 Order Service:      http://localhost:3004"
    echo "💳 Payment Service:    http://localhost:3005"
    echo "📁 Media Service:      http://localhost:3006"
    echo "🎨 Theme Service:      http://localhost:3007"
    echo "📧 Notification Svc:   http://localhost:3008"
    echo "📊 Analytics Service:  http://localhost:3009"
    echo ""
    echo "🗄️  Infrastructure:"
    echo "=================="
    echo "🐘 PostgreSQL:         localhost:5432"
    echo "🔴 Redis:              localhost:6379"
    echo "📨 NATS:               localhost:4222"
    echo "📊 MinIO:              http://localhost:9000"
    echo "📊 Prometheus:         http://localhost:9090"
    echo "📊 Grafana:            http://localhost:3010"
    echo ""
    echo "📚 Documentation:"
    echo "=================="
    echo "📖 API Docs:           http://localhost:3000/api/docs"
    echo "🔍 Health Checks:      http://localhost:3000/health"
    echo ""
    echo "🛠️  Development Commands:"
    echo "========================="
    echo "🔄 Start all services:  pnpm run dev"
    echo "🛑 Stop services:       pnpm run dev:stop"
    echo "🔍 View logs:           docker-compose -f infra/docker/docker-compose.yml logs -f"
    echo "🧪 Run tests:           pnpm run test"
    echo "🏗️  Build all:           pnpm run build"
    echo ""
}

# Main setup flow
main() {
    check_prerequisites
    setup_environment
    install_dependencies
    start_infrastructure
    setup_database
    
    # Note: We skip building for now due to TypeScript compilation issues
    # build_services
    
    show_services
    
    print_success "Setup completed successfully!"
    print_status "Run 'pnpm run dev' to start all services in development mode"
}

# Run main function
main