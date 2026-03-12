# Your Family Manager - Agent Restart Notes

Last reviewed: 2026-03-11 (America/New_York)

## 1) Project Snapshot

- Vision: family life management platform (tasks, recipes, meal planning, budget) with web + backend now, mobile later.
- Current reality: auth + todo functionality is implemented and stabilized.
- Backend: Quarkus (Java 21, REST, Panache, Liquibase, JPA security, Bean Validation).
- Frontend: React 19 + Vite + TanStack Router + Tailwind/shadcn.
- Mobile (React Native) and PowerSync client integration are not implemented in app code yet.

## 2) Repo Layout

- `server/` Quarkus backend (API, entities, Liquibase, tests).
- `web/` React frontend.
- `docker/` and `server/docker/` contain partial container/dev infra.
- `server/config/powersync.yaml` now exists for local PowerSync compose config path.
- Root README and web README are still mostly template boilerplate, not project-specific.

## 3) What Is Implemented

- Login/logout using Quarkus form auth and cookie session.
- `GET /me` current user endpoint.
- CRUD todo endpoints under `/todos`.
- Todo endpoints now enforce per-user ownership and access controls.
- Todo payloads now use request DTOs + Bean Validation.
- Completion metadata behavior fixed (`completedBy` clears when toggled back to incomplete).
- Web login screen, header, dark/light toggle, todos page.

## 4) P0/P1 Status

### Completed P0 Remediation

- Frontend TypeScript build is green.
  - `web/src/types/Todo.ts` id typing aligned to backend UUID semantics.
- Backend test baseline is green without Docker-required datasource boot.
  - `%test` profile uses H2 with Liquibase migrations.
- Template backend tests were replaced with app-specific tests.
  - Added `TodoResourceTest` and `UserResourceTest`.
  - Removed `GreetingResourceTest` leftovers.

### Completed P1 Remediation

- Todo list is user-scoped (no `listAll()` exposure).
- Ownership checks are enforced for get/update/delete by ID.
- Dangerous `drop-and-create` schema strategy removed (`schema-management.strategy=none`).
- Completion metadata bug fixed (`completedBy` cleared on uncomplete).
- Validation layer added for todo API requests (DTO + Bean Validation).
- PowerSync compose missing-config issue reduced by adding `server/config/powersync.yaml`.

### Remaining Risks / Open Work

- Authorization is user-scoped but not yet family/household-scoped.
- No frontend tests currently cover todo/auth flows.
- No frontend tests currently cover username search and member-chip selection in todo list sharing.
- PowerSync config is still a starter placeholder and not production-hardened.
- Docs (root/web README) still need project-specific onboarding and architecture details.

## 5) Domain Coverage Gap vs Product Goal

Planned: tasks, recipes, meal planning, budget, family-wide management, mobile sync.

Current:
- Tasks: todo module with auth + user-scoped authorization.
- Recipes: not implemented.
- Meal planning: not implemented.
- Budget: not implemented.
- React Native app: not present.
- PowerSync app integration: not present.

## 6) Verification Performed

- `web`: `npm run build` passes.
- `web`: `npm run test` still reports no tests (none authored yet).
- `server`: `./mvnw test` passes (todo/user resource tests).

## 7) Recommended Restart Order

1. Add family domain model and migrate todo ownership from user-only to family/household-aware authorization.
2. Add API integration tests for multi-user and future multi-family isolation rules.
3. Add frontend test coverage for login/session/todo CRUD behavior.
4. Replace template docs with project-specific architecture, setup, and deployment guidance.
5. Define module boundaries for recipes, meal plans, and budgets.
6. Finalize sync architecture contract (PowerSync schema + conflict rules) before mobile build-out.

## 8) Quick Start Commands (Current State)

- Backend dev: `cd server && ./mvnw quarkus:dev`
- Frontend dev: `cd web && npm install && npm run dev`
- Frontend build check: `cd web && npm run build` (passes)
- Backend test check: `cd server && ./mvnw test` (passes)

## 9) Notes For Future Agents

- Worktree may be dirty during local iteration; do not reset/revert blindly.
- Security/data isolation at family scope should be treated as the next critical milestone.
- Prefer extending existing todo auth test patterns when adding new secured resources.
