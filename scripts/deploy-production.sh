#!/bin/bash

# Production Deployment Script
# This script automates the deployment of AIA to production

set -e  # Exit on error

echo "🚀 Starting AIA Production Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production not found${NC}"
    echo "Please copy .env.production.template to .env.production and fill in your values:"
    echo "  cp .env.production.template .env.production"
    echo "  nano .env.production"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found .env.production"

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Check required environment variables
required_vars=(
    "DATABASE_URL"
    "R2_ACCOUNT_ID"
    "R2_ACCESS_KEY_ID"
    "R2_SECRET_ACCESS_KEY"
    "YOU_API_KEY"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
)

echo ""
echo "🔍 Checking required environment variables..."
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Error: $var is not set${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} $var is set"
done

echo ""
echo "🏗️  Building application..."
bun run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build completed successfully"

echo ""
echo "🗄️  Running database migrations..."
cd apps/state
npx prisma generate
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database migration failed${NC}"
    exit 1
fi

cd ../..
echo -e "${GREEN}✓${NC} Database migrations completed"

echo ""
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker containers started"

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Health check function
check_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $service is healthy"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ $service failed to start${NC}"
    return 1
}

echo ""
echo "🏥 Checking service health..."

check_health "State Service" "http://localhost:3003/health"
check_health "Router Service" "http://localhost:3001/health"
check_health "Autopsy Service" "http://localhost:3002/health"
check_health "Agent Service" "http://localhost:4318/health"
check_health "Web Dashboard" "http://localhost:3006/"

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📊 Service URLs:"
echo "  - Dashboard: http://localhost:3006"
echo "  - State API: http://localhost:3003"
echo "  - Router API: http://localhost:3001"
echo "  - Autopsy API: http://localhost:3002"
echo "  - Agent (OTel): http://localhost:4318"
echo ""
echo "📝 Next steps:"
echo "  1. Visit http://localhost:3006 to access the dashboard"
echo "  2. Sign in with Clerk"
echo "  3. Create your first project"
echo "  4. Instrument your application with OpenTelemetry"
echo ""
echo "📚 Documentation:"
echo "  - Quickstart: ./QUICKSTART.md"
echo "  - Security: ./SECURITY.md"
echo "  - Production Guide: ./PRODUCTION_DEPLOYMENT.md"
echo ""
echo "🔍 View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Stop services:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
