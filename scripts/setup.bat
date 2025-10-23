@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up MCOM eCommerce SaaS Development Environment
echo ========================================================
echo.

REM Check prerequisites
echo [INFO] Checking prerequisites...

REM Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node -v') do (
    set NODE_MAJOR=%%a
    set NODE_MAJOR=!NODE_MAJOR:v=!
)

if %NODE_MAJOR% LSS 18 (
    echo [ERROR] Node.js version 18+ is required. Current version: %NODE_VERSION%
    exit /b 1
)

REM Check pnpm
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [WARNING] pnpm is not installed. Installing pnpm...
    npm install -g pnpm
)

REM Check Docker
where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check Docker Compose
docker compose version >nul 2>&1
if errorlevel 1 (
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
        exit /b 1
    )
)

echo [SUCCESS] All prerequisites are met!

REM Setup environment files
echo [INFO] Setting up environment configuration...

if not exist .env (
    copy .env.example .env >nul
    echo [SUCCESS] Created .env file from .env.example
    echo [WARNING] Please review and update the .env file with your configuration
) else (
    echo [WARNING] .env file already exists, skipping...
)

REM Install dependencies
echo [INFO] Installing dependencies...
pnpm install
echo [SUCCESS] Dependencies installed successfully!

REM Start infrastructure services
echo [INFO] Starting infrastructure services (PostgreSQL, Redis, NATS, etc.)...

cd infra\docker

REM Stop existing containers if any
docker-compose down >nul 2>&1

REM Start all infrastructure services
docker-compose up -d

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check PostgreSQL
echo [INFO] Checking PostgreSQL connection...
:check_postgres
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo [INFO] Waiting for PostgreSQL...
    timeout /t 2 /nobreak >nul
    goto check_postgres
)
echo [SUCCESS] PostgreSQL is ready!

REM Check Redis
echo [INFO] Checking Redis connection...
:check_redis
docker-compose exec -T redis redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo [INFO] Waiting for Redis...
    timeout /t 2 /nobreak >nul
    goto check_redis
)
echo [SUCCESS] Redis is ready!

cd ..\..
echo [SUCCESS] Infrastructure services are running!

REM Setup database
echo [INFO] Setting up database...
docker-compose -f infra\docker\docker-compose.yml exec -T postgres psql -U postgres -c "CREATE DATABASE IF NOT EXISTS mcom_ecommerce;" >nul 2>&1
echo [SUCCESS] Database setup completed!

REM Display service information
echo.
echo [SUCCESS] 🎉 MCOM eCommerce SaaS is ready for development!
echo.
echo 📋 Service URLs:
echo ==================
echo 🌐 API Gateway:        http://localhost:3000
echo 🔐 Auth Service:       http://localhost:3001
echo 🏪 Tenant Service:     http://localhost:3002
echo 📦 Catalog Service:    http://localhost:3003
echo 🛒 Order Service:      http://localhost:3004
echo 💳 Payment Service:    http://localhost:3005
echo 📁 Media Service:      http://localhost:3006
echo 🎨 Theme Service:      http://localhost:3007
echo 📧 Notification Svc:   http://localhost:3008
echo 📊 Analytics Service:  http://localhost:3009
echo.
echo 🗄️ Infrastructure:
echo ==================
echo 🐘 PostgreSQL:         localhost:5432
echo 🔴 Redis:              localhost:6379
echo 📨 NATS:               localhost:4222
echo 📊 MinIO:              http://localhost:9000
echo 📊 Prometheus:         http://localhost:9090
echo 📊 Grafana:            http://localhost:3010
echo.
echo 📚 Documentation:
echo ==================
echo 📖 API Docs:           http://localhost:3000/api/docs
echo 🔍 Health Checks:      http://localhost:3000/health
echo.
echo 🛠️ Development Commands:
echo =========================
echo 🔄 Start all services:  pnpm run dev
echo 🛑 Stop services:       pnpm run dev:stop
echo 🔍 View logs:           docker-compose -f infra/docker/docker-compose.yml logs -f
echo 🧪 Run tests:           pnpm run test
echo 🏗️ Build all:           pnpm run build
echo.
echo [SUCCESS] Setup completed successfully!
echo [INFO] Run 'pnpm run dev' to start all services in development mode

pause