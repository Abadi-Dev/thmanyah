# Thmanyah CMS & Discovery System

## Prerequisites

Before running this project, ensure you have the following installed:

| Requirement | Version | Installation |
|-------------|---------|--------------|
| **Node.js** | v20.x | Via nvm (see below) |
| **nvm** | Latest | [nvm installation guide](https://github.com/nvm-sh/nvm#installing-and-updating) |
| **Docker** | Latest | [Docker installation guide](https://docs.docker.com/get-docker/) |
| **Docker Compose** | v2.x | Included with Docker Desktop |

### Installing nvm and Node.js

```bash
# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal, then install Node.js 20
nvm install 20
nvm use 20
```

### Verify Installation

```bash
node --version    # Should show v20.x.x
docker --version  # Should show Docker version
docker compose version  # Should show v2.x.x
```

---

## Quick Start (Recommended)

To test the search engine and discovery features with live data, use the automated start script. This script handles Docker orchestration, dependency installation, database seeding, and starts both backend and frontend.

```bash
# Start everything: Dependencies, Docker, Database Seed, Backend API, and Frontend
./scripts/start-all.sh

# Or use npm
npm run start:all
```

> **Note:** Running the project via `npm run start` without seeding will result in empty search results. Use the script above for the best testing experience.

---

## Service Access

| Service | URL |
|---------|-----|
| **API Documentation (Swagger)** | http://localhost:3000/api |
| **Backend API** | http://localhost:3000 |
| **Frontend UI** | http://localhost:5173 |
| **Meilisearch Dashboard** | http://localhost:7700 |

---

## Manual Installation

If you prefer manual execution:

```bash
# 1. Use Node.js 20
nvm use 20

# 2. Install Dependencies
npm install
cd web && npm install && cd ..

# 3. Start Infrastructure
docker compose up -d

# 4. Seed Database (Required for search testing)
npm run seed

# 5. Start Backend Development Server
npm run start:dev

# 6. Start Frontend (in another terminal)
cd web && npm run dev
```

---

## Environment Variables

Default configuration for local testing (no `.env` file needed):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=thmanyah_user
DB_PASSWORD=thmanyah_password
DB_NAME=thmanyah_cms
REDIS_HOST=localhost
REDIS_PORT=6379
MEILISEARCH_HOST=http://localhost:7700
PORT=3000
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:all` | Start complete stack (Docker + Backend + Frontend) |
| `npm run start:dev` | Start backend in development mode |
| `npm run seed` | Seed database with sample data |
| `npm run docker:up` | Start Docker services only |
| `npm run docker:down` | Stop Docker services |
| `npm run docker:reset` | Reset Docker volumes and restart |
| `npm run test` | Run tests |
| `npm run build` | Build for production |
