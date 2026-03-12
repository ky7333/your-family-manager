# Your Family Manager - Agent Restart Notes

Last reviewed: 2026-03-11 (America/New_York)

## 1) Project Snapshot

- Vision: family life management platform (tasks, recipes, meal planning, budget) with web + backend now, mobile later.
- Current reality: only auth + todo functionality is implemented.
- Backend: Quarkus (Java 21, REST, Panache, Liquibase, JPA security).
- Frontend: React 19 + Vite + TanStack Router + Tailwind/shadcn.
- Mobile (React Native) and PowerSync integration are not implemented in app code yet.

## 2) Repo Layout

- `server/` Quarkus backend (API, entities, Liquibase).
- `web/` React frontend.
- `docker/` and `server/docker/` contain partial container/dev infra.
- Root README and web README are mostly template boilerplate, not project-specific.

## 3) What Is Implemented

- Login/logout using Quarkus form auth and cookie session.
- `GET /me` current user endpoint.
- CRUD todo endpoints under `/todos`.
- Web login screen, header, dark/light toggle, todos page.

## 4) Confirmed Major Issues

### P0 - Build/Test and Runtime Blockers

- Frontend TypeScript build fails due ID type mismatch (`string` vs `number`) in todo API + route handlers.
  - `web/src/api/todoApi.ts` uses `id: number`.
  - `web/src/types/Todo.ts` uses `id: string`.
  - `web/src/routes/todos.tsx` passes string IDs into number-typed functions.
- Frontend TypeScript config/build issues:
  - Missing Node types (`node:path`, `__dirname`) in Vite config.
  - `test` key in `vite.config.ts` typed as invalid without proper Vitest config typing.
- Backend tests fail to boot because datasource is not configured and Docker DevServices is expected.
  - Error: configure datasource URL or ensure Docker daemon is running.
- Backend test files are template leftovers (`GreetingResourceTest`) hitting `/hello`, which is unrelated to real app behavior.

### P1 - Data/Security/Product Risks

- Todo list endpoint returns all todos, not user-scoped/family-scoped (`listAll()`), so data isolation is not enforced.
- Todo ownership/authorization checks are missing for get/update/delete by ID.
- `application.properties` includes `schema-management.strategy=drop-and-create`, dangerous for persistent environments.
- Completion metadata bug: when a todo is marked incomplete again, `completedBy` is not cleared.
- No validation layer (DTOs/Bean Validation) for todo payloads; entity is used directly in API.
- PowerSync compose config appears incomplete/stale:
  - references missing files/paths (`../../services/postgres.yaml`, `../nodejs/init-scripts`).

## 5) Domain Coverage Gap vs Product Goal

Planned: tasks, recipes, meal planning, budget, family-wide management, mobile sync.

Current:
- Tasks: minimal todo only.
- Recipes: not implemented.
- Meal planning: not implemented.
- Budget: not implemented.
- React Native app: not present.
- PowerSync app integration: not present.

## 6) Verification Performed

- `web`: `npm run build` fails with TypeScript errors.
- `web`: `npm run test` finds no tests.
- `server`: `./mvnw test` fails (DevServices datasource/Docker requirement).
- Git history: latest commits are from 2025-08-14.

## 7) Recommended Restart Order

1. Stabilize build/test baseline (frontend TS fixes, backend datasource profile config, real tests).
2. Lock down security and data scoping for todos (user/family ownership checks).
3. Replace template docs/tests with project-specific docs and test suites.
4. Define family domain model (Family, Member, Household, roles/permissions).
5. Introduce module boundaries for recipes, meal plans, budgets.
6. Decide sync architecture contract (PowerSync schema + conflict rules) before mobile build-out.

## 8) Quick Start Commands (Current State)

- Backend dev: `cd server && ./mvnw quarkus:dev` (requires datasource strategy or Docker DevServices).
- Frontend dev: `cd web && npm install && npm run dev`.
- Frontend build check: `cd web && npm run build` (currently fails).
- Backend test check: `cd server && ./mvnw test` (currently fails without datasource/Docker).

## 9) Notes For Future Agents

- Worktree is currently dirty with local edits already present; do not reset/revert blindly.
- Prioritize a "green CI first" branch before adding new family modules.
- Treat security/data isolation as first-class requirements before expanding features.
