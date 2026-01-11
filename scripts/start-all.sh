#!/bin/bash

# =============================================================================
# start-all.sh
# =============================================================================
# PURPOSE: Start the complete Thmanyah stack with seeded data
#
# WHAT IT DOES:
#   1. Starts Docker services (PostgreSQL, Redis, Meilisearch)
#   2. Seeds the database with sample podcast data
#   3. Starts the backend API (port 3000)
#   4. Starts the frontend app (port 5173)
#
# USAGE:
#   ./scripts/start-all.sh           # Normal start
#   ./scripts/start-all.sh --reset   # Reset database and start fresh
#
# AFTER RUNNING:
#   - Backend API:  http://localhost:3000
#   - Swagger Docs: http://localhost:3000/api
#   - Frontend:     http://localhost:5173
#   - Meilisearch:  http://localhost:7700
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
RESET_MODE=false

if [ "$1" == "--reset" ]; then
    RESET_MODE=true
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=================================="
echo "  Thmanyah - Full Stack Startup"
echo "=================================="

# -----------------------------------------------------------------------------
# Step 1: Setup Node.js environment
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[1/6] Setting up Node.js...${NC}"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 20 > /dev/null 2>&1 || {
    echo "Installing Node.js 20..."
    nvm install 20
    nvm use 20
}
echo -e "${GREEN}Using Node.js $(node -v)${NC}"

# -----------------------------------------------------------------------------
# Step 2: Install dependencies
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/6] Installing dependencies...${NC}"

cd "$PROJECT_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed"
fi

if [ ! -d "web/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd web && npm install && cd ..
else
    echo "Frontend dependencies already installed"
fi

echo -e "${GREEN}Dependencies ready${NC}"

# -----------------------------------------------------------------------------
# Step 3: Start Docker services
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/6] Starting Docker services...${NC}"

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

if [ "$RESET_MODE" == true ]; then
    echo "Resetting database volumes..."
    docker compose down -v 2>/dev/null || true
fi

docker compose up -d

# Wait for services
echo "Waiting for PostgreSQL..."
until docker exec thmanyah-db pg_isready -U thmanyah_user > /dev/null 2>&1; do
    sleep 1
done

echo "Waiting for Meilisearch..."
until curl -s http://localhost:7700/health > /dev/null 2>&1; do
    sleep 1
done

echo "Waiting for Redis..."
until docker exec thmanyah-cache redis-cli ping > /dev/null 2>&1; do
    sleep 1
done

echo -e "${GREEN}All services are ready${NC}"

# -----------------------------------------------------------------------------
# Step 4: Seed the database
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/6] Seeding database...${NC}"
npm run seed
echo -e "${GREEN}Database seeded with sample data${NC}"

# -----------------------------------------------------------------------------
# Step 5: Start the backend
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/6] Starting backend...${NC}"
npm run start:dev &
BACKEND_PID=$!

echo "Waiting for backend API..."
until curl -s http://localhost:3000/discovery/programs > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}Backend running at http://localhost:3000${NC}"

# Wait for Meilisearch to sync
sleep 2

# -----------------------------------------------------------------------------
# Step 6: Start the frontend
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[6/6] Starting frontend...${NC}"
cd "$PROJECT_DIR/web"
npm run dev &
FRONTEND_PID=$!

sleep 3
echo -e "${GREEN}Frontend running at http://localhost:5173${NC}"

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}=================================="
echo "  All systems running!"
echo "==================================${NC}"
echo ""
echo "  Backend API:  http://localhost:3000"
echo "  Swagger Docs: http://localhost:3000/docs"
echo "  Frontend:     http://localhost:5173"
echo "  Meilisearch:  http://localhost:7700"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
