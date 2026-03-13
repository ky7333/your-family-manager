# Your Family Manager Web App

This is the React frontend for Your Family Manager.

It provides:
- Session-based login/logout
- Todo list views
- Shared list membership UI (owner/read-write/read-only)
- Todo CRUD experience against the Quarkus backend

## Tech Stack

- React 19
- Vite
- TanStack Router
- Tailwind CSS + shadcn/ui
- Vitest + Testing Library

## Prerequisites

- Node.js 22+
- npm
- Running backend API (`http://localhost:8080` by default)

## Local Development

From this directory:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

By default, API calls target `http://localhost:8080`.

To point to a different backend:

```bash
VITE_BACKEND_BASE_URL=http://localhost:8080 npm run dev
```

## Available Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve

# Run tests
npm run test

# Type check only
npm run typecheck

# Lint
npm run lint
```

## Docker / Podman

Build and run the web container from repo root:

```bash
docker build -t yfm-web:latest -f web/Dockerfile .
docker run --rm -p 3000:80 yfm-web:latest
```

For Podman, replace `docker` with `podman`.

## Backend Contract (Current)

The web app currently integrates with:
- `POST /j_security_check` (login)
- `POST /logout`
- `GET /me`
- `GET|POST|PUT /todo-lists`
- `GET|POST|PUT|DELETE /todos`
- `GET /users/search`

## Related Docs

For full-stack setup (backend, Docker/Podman deployment, optional PowerSync stack), see:
- [Root README](../README.md)

For shared color/spacing/radius/typography tokens used by web and future mobile:
- [Design Tokens Package](../packages/design-tokens/README.md)
