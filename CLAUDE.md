# Podcast Manager - Claude Code Instructions

## Quick Start

```bash
# 1. Start PostgreSQL (cluster owned by 'claude' user, trust auth)
su - claude -c "pg_ctlcluster 16 main start"

# 2. Install dependencies (npm workspaces monorepo)
npm install

# 3. Run Prisma migrations
cd server && DATABASE_URL="postgresql://postgres@localhost:5432/podcast_manager" npx prisma migrate dev && cd ..

# 4. Seed the database (optional)
cd server && DATABASE_URL="postgresql://postgres@localhost:5432/podcast_manager" npx tsx prisma/seed.ts && cd ..

# 5. Run tests
cd server && npm test && cd ..
cd client && npx vitest run && cd ..

# 6. Dev servers
# Terminal 1: API server
cd server && DATABASE_URL="postgresql://postgres@localhost:5432/podcast_manager" npx tsx src/index.ts
# Terminal 2: Frontend (proxied to API)
cd client && npx vite
# App available at http://localhost:5173/projects/podcast/
```

## Project Structure

```
podcast/
├── .env                    # DATABASE_URL, PORT, UPLOAD_DIR (loaded by server from ../.env)
├── package.json            # Root workspaces: ["server", "client"]
├── server/                 # Express + TypeScript + Prisma
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── app.ts          # Express app (middleware, routes, swagger)
│   │   ├── index.ts        # Entry point (loads dotenv from ../.env)
│   │   ├── config/         # env.ts (zod-validated), swagger.ts
│   │   ├── lib/            # prisma.ts, upload.ts (multer)
│   │   ├── middleware/      # errorHandler, validate (zod), notFound
│   │   └── modules/
│   │       ├── guests/     # router → controller → service → schema
│   │       ├── episodes/   # same pattern, includes pipeline + guest assignment
│   │       └── assets/     # file upload/download/delete
│   └── jest.config.ts      # ts-jest, setup loads dotenv
├── client/                 # Vite + React + TypeScript + Ant Design
│   ├── vite.config.ts      # base: "/projects/podcast/", proxy config
│   ├── src/
│   │   ├── App.tsx         # Routes within ConfigProvider
│   │   ├── main.tsx        # BrowserRouter with basename from BASE_URL
│   │   ├── lib/api.ts      # Fetch wrapper, derives URL from import.meta.env.BASE_URL
│   │   ├── hooks/          # useGuests, useEpisodes, useAssets, usePipeline
│   │   ├── pages/          # Dashboard, Guests, Episodes, Pipeline, Assets, NotFound
│   │   └── components/     # layout/AppShell.tsx (Ant Design Layout + Sider)
│   └── vitest.config.ts    # jsdom, globals, setup mocks matchMedia
└── deploy/                 # nginx.conf, systemd template, setup.sh
```

## Key Architecture Decisions

- **Subpath deployment**: App lives at `/projects/podcast/`. Vite `base`, React Router `basename`, and API client all derive from this. Nginx strips the prefix before proxying to Express.
- **API pattern**: Each module has `router → controller → service → schema`. Router has Swagger JSDoc. Controller is thin glue. Service has all DB logic. Schema is Zod + OpenAPI types.
- **Express 5 types**: `req.params` is `string | string[]` — always cast with `as string`.
- **Database**: PostgreSQL via Prisma. Dotenv loaded from `../.env` (monorepo root). Tests use a setup file that loads dotenv explicitly.
- **File uploads**: Multer with disk storage. UUID filenames. Separate `audio/` and `images/` directories under `uploads/`.

## Database

- **PostgreSQL 16**, cluster owned by `claude` user
- **pg_hba.conf**: set to `trust` for local connections
- **Database**: `podcast_manager` on localhost
- **Models**: Guest, Episode, EpisodeGuest (join), Asset
- **Enums**: EpisodeStatus (IDEA→PLANNED→RECORDING→EDITING→PUBLISHED), AssetCategory

## Tests

- **Server (28 tests)**: Jest + Supertest, integration tests against real DB. Run with `cd server && npm test`.
- **Client (12 tests)**: Vitest + React Testing Library. Mocks fetch. Run with `cd client && npx vitest run`.

## Deployment (Ubuntu)

```bash
sudo bash deploy/setup.sh
```
Installs Node 22, PostgreSQL, nginx. Builds both projects. Configures systemd + nginx for subpath at `/projects/podcast/`.

---

## Reusable Scaffolding Prompt

Use the following prompt to build similar management apps with this stack. Replace the domain-specific parts.

```
You are building a [PRODUCT_NAME] management application.

Tech stack:
- Monorepo with npm workspaces (server/ + client/)
- Backend: Express 4 + TypeScript + Prisma + PostgreSQL + Swagger (swagger-jsdoc)
- Frontend: Vite + React + TypeScript + Ant Design (antd)
- Testing: Jest + Supertest (server), Vitest + React Testing Library (client)
- Deployment: nginx reverse proxy + systemd on Ubuntu

Architecture:
- Each backend module: router.ts → controller.ts → service.ts → schema.ts (Zod + Swagger JSDoc)
- Frontend: pages/ (thin route components) + hooks/ (data fetching + state) + components/
- API client derives base URL from Vite's import.meta.env.BASE_URL for subpath deployment
- Validation: Zod schemas on the server, server-side errors reflected to forms on the client
- File uploads: multer disk storage with UUID filenames, type filtering

Subpath deployment at [BASE_PATH]:
- vite.config.ts: base: "[BASE_PATH]/"
- main.tsx: BrowserRouter basename derived from import.meta.env.BASE_URL
- API client: base URL = `${import.meta.env.BASE_URL}api`
- nginx: proxy_pass strips [BASE_PATH] prefix, alias for static files
- Download links use api.url() helper, not hardcoded paths

Data model:
[DESCRIBE YOUR ENTITIES, RELATIONSHIPS, ENUMS, AND WORKFLOW STATES]

Pages needed:
[LIST YOUR PAGES: dashboard, list views, detail views, kanban/workflow boards, etc.]

API endpoints:
[LIST CRUD ENDPOINTS, FILE UPLOAD, SPECIAL QUERIES LIKE PIPELINE/SEARCH]

Requirements:
- Full CRUD with paginated list endpoints (search, filter params)
- Swagger/OpenAPI documentation on all routes
- Zod validation middleware on all request bodies and query strings
- Error handler translating Prisma errors (P2025→404, P2002→409) to HTTP codes
- Ant Design UI: tables with pagination, modal forms for create/edit, Popconfirm for delete
- Integration tests for every API endpoint (supertest against real DB)
- Component tests with mocked fetch
- Ubuntu deployment scripts (nginx subpath, systemd, PostgreSQL setup)
- CLAUDE.md with build/test/run instructions for the next developer (or AI)
```
