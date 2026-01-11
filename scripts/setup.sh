#!/bin/bash

# Thmanyah CMS - Setup Script
# This script starts all services, seeds the database, and runs the app
#
# Usage:
#   ./scripts/setup.sh          # Normal setup
#   ./scripts/setup.sh --reset  # Reset data and start fresh

set -e

echo "🚀 Thmanyah CMS Setup"
echo "===================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load nvm and use Node.js 20 (required for NestJS and Vite)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20 > /dev/null 2>&1 || {
    echo "⚠️  Node.js 20 not found. Installing..."
    nvm install 20
    nvm use 20
}
echo -e "${GREEN}✓ Using Node.js $(node -v)${NC}"

# Check for --reset flag
RESET_DATA=false
if [ "$1" == "--reset" ]; then
    RESET_DATA=true
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Step 1: Start Docker services (or reset if flag is set)
if [ "$RESET_DATA" == true ]; then
    echo -e "\n${RED}[1/4] Resetting data and starting Docker services...${NC}"
    docker compose down -v 2>/dev/null || true
    docker compose up -d
    echo -e "${GREEN}✓ Docker services started (data reset)${NC}"
else
    echo -e "\n${YELLOW}[1/4] Starting Docker services...${NC}"
    docker compose up -d
    echo -e "${GREEN}✓ Docker services started${NC}"
fi

# Step 2: Wait for services to be ready
echo -e "\n${YELLOW}[2/4] Waiting for services to be ready...${NC}"

# Wait for PostgreSQL
echo "  Waiting for PostgreSQL..."
until docker exec thmanyah-db pg_isready -U thmanyah_user > /dev/null 2>&1; do
    sleep 1
done
echo -e "  ${GREEN}✓ PostgreSQL is ready${NC}"

# Wait for Meilisearch
echo "  Waiting for Meilisearch..."
until curl -s http://localhost:7700/health > /dev/null 2>&1; do
    sleep 1
done
echo -e "  ${GREEN}✓ Meilisearch is ready${NC}"

# Wait for Redis
echo "  Waiting for Redis..."
until docker exec thmanyah-cache redis-cli ping > /dev/null 2>&1; do
    sleep 1
done
echo -e "  ${GREEN}✓ Redis is ready${NC}"

# Step 3: Seed the database
echo -e "\n${YELLOW}[3/4] Seeding database...${NC}"
npm run seed
echo -e "${GREEN}✓ Database seeded${NC}"

# Step 4: Start the backend
echo -e "\n${YELLOW}[4/4] Starting backend...${NC}"
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to be ready
echo "  Waiting for backend..."
until curl -s http://localhost:3000/discovery/programs > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}✓ Backend is running at http://localhost:3000${NC}"

# Wait a moment for Meilisearch to sync
sleep 3

echo -e "\n${GREEN}===================="
echo "✅ Setup Complete!"
echo "===================="
echo ""
echo "Backend API:  http://localhost:3000"
echo "Swagger Docs: http://localhost:3000/api"
echo "Meilisearch:  http://localhost:7700"
echo ""
echo "To start the frontend, run:"
echo "  cd ../thmanyah-web && nvm use 20 && npm run dev"
echo "${NC}"
