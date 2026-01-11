
```markdown
# Thmanyah CMS & Discovery System

## 🚀 Quick Start (Recommended)

To test the search engine and discovery features with live data, use the automated start script. This script handles Docker orchestration, database migrations, and **data seeding**.

```bash
# Start everything: Docker, Database Seed, Backend API, and Frontend
./scripts/start-all.sh

```

> **Important:** Running the project via `npm run start` without seeding will result in empty search results. Use the script above for the best testing experience.

---

## 🔗 Service Access

| Service | URL |
| --- | --- |
| **API Documentation (Swagger)** | http://localhost:3000/api |
| **Backend API** | http://localhost:3000 |
| **Frontend UI** | http://localhost:5173 |
| **Meilisearch Dashboard** | http://localhost:7700 |

---


## 🛠 Manual Installation

If you prefer manual execution:

```bash
# 1. Start Infrastructure
docker-compose up -d

# 2. Install Dependencies
npm install

# 3. Seed Database (Required for search testing)
npm run seed

# 4. Start Development Server
npm run start:dev

```

---

## 📂 Environment Variables

Default configuration for local testing:

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

```


