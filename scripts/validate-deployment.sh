#!/bin/bash

# Pre-deployment validation script
# Run this before deploying to production

set -e

echo "🔍 Running pre-deployment validation..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Check if .env.production exists
echo "1. Checking environment configuration..."
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC} .env.production exists"
    
    # Check for placeholder values
    if grep -q "your_" .env.production; then
        echo -e "${YELLOW}⚠️  Warning: Found placeholder values in .env.production${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check Docker
echo ""
echo "2. Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC} Docker installed"
    docker --version
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC} Docker Compose installed"
    docker-compose --version
fi

# Check Bun
echo ""
echo "3. Checking Bun runtime..."
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun not found${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC} Bun installed"
    bun --version
fi

# Check Node.js
echo ""
echo "4. Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found (optional but recommended)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓${NC} Node.js installed"
    node --version
fi

# Check if build works
echo ""
echo "5. Testing build..."
if bun run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}❌ Build failed${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Dockerfiles
echo ""
echo "6. Checking Dockerfiles..."
DOCKERFILES=(
    "apps/state/Dockerfile"
    "apps/router/Dockerfile"
    "apps/autopsy/Dockerfile"
    "apps/agent/Dockerfile"
    "apps/web/Dockerfile"
)

for dockerfile in "${DOCKERFILES[@]}"; do
    if [ -f "$dockerfile" ]; then
        echo -e "${GREEN}✓${NC} $dockerfile exists"
    else
        echo -e "${RED}❌ $dockerfile not found${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check docker-compose.prod.yml
echo ""
echo "7. Checking docker-compose.prod.yml..."
if [ -f docker-compose.prod.yml ]; then
    echo -e "${GREEN}✓${NC} docker-compose.prod.yml exists"
    
    # Validate YAML syntax
    if docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} docker-compose.prod.yml is valid"
    else
        echo -e "${RED}❌ docker-compose.prod.yml has syntax errors${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ docker-compose.prod.yml not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check database migrations
echo ""
echo "8. Checking database migrations..."
if [ -d apps/state/prisma/migrations ]; then
    echo -e "${GREEN}✓${NC} Database migrations exist"
else
    echo -e "${YELLOW}⚠️  No database migrations found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for common security issues
echo ""
echo "9. Security checks..."

# Check if .env files are in .gitignore
if grep -q ".env.production" .gitignore; then
    echo -e "${GREEN}✓${NC} .env.production is in .gitignore"
else
    echo -e "${RED}❌ .env.production should be in .gitignore${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check for hardcoded secrets
if grep -r "sk_live_" apps/ --include="*.ts" --include="*.js" > /dev/null 2>&1; then
    echo -e "${RED}❌ Found hardcoded secrets in code${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC} No hardcoded secrets found"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for production deployment.${NC}"
    echo ""
    echo "Run: ./scripts/deploy-production.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo "You can proceed with deployment, but review the warnings above."
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix the errors above before deploying to production."
    exit 1
fi
