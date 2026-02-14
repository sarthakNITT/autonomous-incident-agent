#!/bin/bash

# Production Deployment Script
# This script builds and deploys all services using Docker Compose

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "📝 Please copy .env.production.template to .env.production and fill in your values"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo "✅ Environment variables loaded"

# Run database migrations
echo "📊 Running database migrations..."
cd apps/state
npx prisma migrate deploy
npx prisma generate
cd ../..

echo "✅ Database migrations complete"

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "✅ Docker images built"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health of all services
echo "🏥 Checking service health..."

services=("state:3003" "router:3001" "autopsy:3002" "agent:4318" "web:3006")
all_healthy=true

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if curl -f http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is not responding"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📊 Service URLs:"
    echo "   Web Dashboard: http://localhost:3006"
    echo "   State Service: http://localhost:3003"
    echo "   Router: http://localhost:3001"
    echo "   Autopsy: http://localhost:3002"
    echo "   Agent (OTel): http://localhost:4318"
    echo ""
    echo "📝 View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "🛑 Stop services: docker-compose -f docker-compose.prod.yml down"
else
    echo ""
    echo "⚠️  Some services are not healthy. Check logs:"
    echo "   docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
