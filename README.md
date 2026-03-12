# Your Family Manager

Your Family Manager is a family life management platform in active development.

Current implementation is focused on authenticated task management:
- Quarkus backend with session auth, user profile, todo lists, and todos
- React web app with login/logout, todo list sharing, and todo CRUD
- PostgreSQL + Liquibase migrations

Planned modules (not implemented yet): recipes, meal planning, budgeting, and mobile sync.

## Tech Stack

- Backend: Java 21, Quarkus 3, Hibernate Panache, Liquibase
- Frontend: React 19, Vite, TanStack Router, Tailwind, shadcn/ui
- Database: PostgreSQL
- Containers: Docker or Podman

## Repository Layout

- `server/` Quarkus backend API
- `web/` React frontend
- `server/compose-devservices.yml` local PowerSync + PostgreSQL services
- `server/config/powersync.yaml` PowerSync config used by compose

## Getting Started (Development)

### Prerequisites

- Java 21+
- Node.js 22+ and npm
- Docker Desktop or Podman (needed for database if using Quarkus Dev Services)

### 1) Start the backend

From repo root:

```bash
cd server
./mvnw quarkus:dev
```

Backend runs on `http://localhost:8080`.

Notes:
- In `dev`, Quarkus auto-creates seed users if DB is empty:
  - `admin / admin`
  - `user / user`
- Liquibase migrations run at startup.

### 2) Start the web app

In a second terminal:

```bash
cd web
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` and calls backend at `http://localhost:8080` by default.

Optional override:

```bash
cd web
VITE_BACKEND_BASE_URL=http://localhost:8080 npm run dev
```

### 3) Verify the setup

- Open `http://localhost:3000`
- Login with `admin/admin`
- Create a todo list, then create/update todos

## Development Checks

### Backend tests

```bash
cd server
./mvnw test
```

### Frontend build

```bash
cd web
npm run build
```

### Frontend tests

```bash
cd web
npm run test
```

## Deploying with Docker or Podman

Commands below use `docker`. If you use Podman, replace `docker` with `podman`.

### A) Build application images

From repo root:

```bash
# Build backend artifact
cd server
./mvnw package -DskipTests
cd ..

# Build backend image

docker build -t yfm-server:latest -f server/src/main/docker/Dockerfile.jvm server

# Build web image

docker build -t yfm-web:latest web
```

### B) Run app stack (PostgreSQL + backend + web)

```bash
# one-time network + volume

docker network create yfm-net

docker volume create yfm-pg-data

# postgres

docker run -d \
  --name yfm-postgres \
  --network yfm-net \
  -e POSTGRES_DB=yfm \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v yfm-pg-data:/var/lib/postgresql/data \
  postgres:16

# backend

docker run -d \
  --name yfm-server \
  --network yfm-net \
  -p 8080:8080 \
  -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://yfm-postgres:5432/yfm \
  -e QUARKUS_DATASOURCE_USERNAME=postgres \
  -e QUARKUS_DATASOURCE_PASSWORD=postgres \
  -e QUARKUS_HTTP_CORS_ORIGINS=http://localhost:3000 \
  yfm-server:latest

# web

docker run -d \
  --name yfm-web \
  --network yfm-net \
  -p 3000:80 \
  yfm-web:latest
```

Access:
- Web UI: `http://localhost:3000`
- API: `http://localhost:8080`

### C) Podman notes

- Rootless Podman works with the same commands (`podman ...`).
- If needed on macOS:

```bash
podman machine init
podman machine start
```

## Running PowerSync + PostgreSQL Dev Services (Optional)

If you want to run the provided PowerSync compose stack:

1. Create a `.env` file in `server/` with these values (example values shown):

```env
PG_DATABASE_USER=postgres
PG_DATABASE_NAME=yfm
PG_DATABASE_PASSWORD=postgres
PG_DATABASE_PORT=5432

PG_STORAGE_DATABASE_USER=postgres
PG_STORAGE_DATABASE_NAME=powersync
PG_STORAGE_DATABASE_PASSWORD=postgres
PG_STORAGE_DATABASE_PORT=5433

PS_PORT=8081
PS_DATA_SOURCE_URI=postgresql://postgres:postgres@pg-db:5432/yfm
PS_STORAGE_SOURCE_URI=postgresql://postgres:postgres@pg-storage:5433/powersync
PS_JWKS_URL=http://host.containers.internal:8080/.well-known/jwks.json
```

2. Start services:

```bash
cd server
docker compose -f compose-devservices.yml up -d
```

For Podman:

```bash
cd server
podman compose -f compose-devservices.yml up -d
```

## Useful Commands

```bash
# Backend dev
cd server && ./mvnw quarkus:dev

# Backend tests
cd server && ./mvnw test

# Frontend dev
cd web && npm install && npm run dev

# Frontend build
cd web && npm run build
```

## Current Scope and Known Gaps

Implemented now:
- Session auth (`/j_security_check`, `/logout`, `/me`)
- Todo lists with member access levels (owner/read-write/read-only)
- Todo CRUD scoped by list access
- Username search for sharing (`/users/search`)

Not yet implemented:
- Family/household-level authorization model
- Recipes, meal plans, and budgets
- Mobile app and full PowerSync integration contract
- Comprehensive frontend end-to-end coverage
