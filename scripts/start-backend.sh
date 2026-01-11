#!/bin/bash

# =============================================================================
# start-backend.sh
# =============================================================================
# PURPOSE: Start only the backend API (without seeding)
#
# WHAT IT DOES:
#   1. Starts Docker services (PostgreSQL, Redis, Meilisearch)
#   2. Starts the backend API (port 3000)
#
# USE THIS WHEN:
#   - You already have data in the database
#   - You want to continue working without resetting data
#   - You're developing and don't need to re-seed
#
# USAGE:
#   ./scripts/start-backend.sh
#
# AFTER RUNNING:
#   - Backend API:  http://localhost:3000
#   - Swagger Docs: http://localhost:3000/api
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=================================="
echo "  Thmanyah - Backend Only"
echo "=================================="

# -----------------------------------------------------------------------------
# Step 1: Setup Node.js environment
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[1/3] Setting up Node.js...${NC}"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 20 > /dev/null 2>&1 || {
    echo "Installing Node.js 20..."
    nvm install 20
    nvm use 20
}
echo -e "${GREEN}Using Node.js $(node -v)${NC}"

# -----------------------------------------------------------------------------
# Step 2: Start Docker services
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/3] Starting Docker services...${NC}"

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

cd "$PROJECT_DIR"
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
# Step 3: Start the backend
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/3] Starting backend...${NC}"
npm run start:dev &
BACKEND_PID=$!

echo "Waiting for backend API..."
until curl -s http://localhost:3000/discovery/programs > /dev/null 2>&1; do
    sleep 1
done

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}=================================="
echo "  Backend running!"
echo "==================================${NC}"
echo ""
echo "  Backend API:  http://localhost:3000"
echo "  Swagger Docs: http://localhost:3000/docs"
echo ""
echo "Note: Database was NOT seeded. Run 'npm run seed' if needed."
echo ""
echo "Press Ctrl+C to stop"

# Keep script running and cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
