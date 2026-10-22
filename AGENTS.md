# Gesta Agent Guide

## Project Shape

- This is an npm workspace with independent `backend/` and `frontend/` packages.
- Backend flow: Express routes and middleware -> controllers -> services -> repositories -> SQLite. Mappers convert database rows to API DTOs.
- Frontend flow: pages -> hooks -> services/utils -> models; reusable UI belongs in `frontend/src/components/`.
- The frontend calls `/api/...`; Vite proxies those requests to the backend and removes `/api`.
- Read [docs/architecture.md](docs/architecture.md) for the detailed design and reference feature paths.

## Commands

Run these from the repository root:

```text
npm ci
npm run setup
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run check
npm run db:init
npm run db:reset
```

- Node.js must be `>=22.14.0`; Node 24 LTS is recommended.
- `npm run setup` creates `backend/.env` and initializes demo data.
- `npm run check` runs lint, typecheck, tests, and builds for both workspaces.
- The API defaults to port 3000 and the frontend to port 5173. Change the API with `API_PORT` in `backend/.env`, not `PORT`.

## Backend Rules

- Keep business rules in services; services must not depend on Express `Request` or `Response`.
- Keep SQL in repositories. Add schema changes as a new ordered file in `backend/src/db/migrations/`; do not edit applied migrations.
- Assemble dependencies with factory functions in `backend/src/app.ts`.
- Use `HttpError` for expected failures. The centralized handler returns `{ error: { code, message } }`.
- Controllers validate HTTP input and map responses; authorization remains server-side and roles are reloaded from the database.
- Backend relative imports include the `.ts` extension because TypeScript rewrites them during the build.
- API status codes use English constants; the frontend translates them to French labels.

## Frontend Rules

- API services must check response status and validate JSON with type guards from `frontend/src/utils/guards.ts`.
- Send the session token directly in `Authorization`; do not add a `Bearer` prefix.
- `useAuth` is called once in `App`; pass session state and logout behavior through page props as existing pages do.
- On HTTP 401, hooks should call `onUnauthorized` so the user returns to the login page.

## Tests

- Backend tests use Vitest, Supertest, and isolated in-memory SQLite. Use `createTestApp`, `createTestDatabase`, `tokenFor`, and stable IDs from the seed helpers.
- Never run backend tests against `backend/data/gesta.db`.
- Frontend tests use Vitest, Testing Library, jsdom, and `stubFetch` from `frontend/tests/helpers/fetchMock.ts`.
- Cover loading, empty, error, unauthorized-session, and role-dependent UI states where relevant.
- API tests should cover authentication, authorization, filtering, status codes, and DTO shape.

## Environment Notes

- Do not commit `backend/.env`, secrets, local SQLite files, or generated build output.
- Keep `.npmrc` `ignore-scripts=true` unless there is a deliberate reason to change the native dependency installation behavior.
- Stop the development server before `npm run db:reset`, especially on Windows, because SQLite may remain open.
- Demo authentication is local-development only: `DEMO_AUTH_ENABLED=true` is rejected with `NODE_ENV=production`.

## Documentation

- [README.md](README.md): setup, commands, troubleshooting, and current scope.
- [docs/architecture.md](docs/architecture.md): layer responsibilities and reference implementations.
- [backend/API.md](backend/API.md): API routes, responses, and errors.
- [docs/seed.md](docs/seed.md): demo data and stable users.
- [docs/cdc_gesta_developpement.md](docs/cdc_gesta_developpement.md): remaining business requirements.