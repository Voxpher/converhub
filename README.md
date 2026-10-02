# ConvertHub — Free Online File Converter

ConvertHub is a production-ready file-converter website: a **Next.js 14** frontend,
an **Express + TypeScript** API, and a **BullMQ + Redis** job queue that does the
heavy conversion work in the background. Everything runs in Docker with one command.

> Phase 1 ships the full platform skeleton: project setup, Docker, base layout,
> the reusable `<ToolLayout />` upload component, and the complete
> upload → queue → poll → download pipeline (verified by an API smoke test).
> The 35 conversion tools go live phase by phase (see Roadmap).

## How it works

```
Browser (Next.js :3000)
   |  POST /api/convert/:toolId  (multipart upload)
   v
API (Express :4000) — validates MIME + magic bytes, size limits, rate limits
   |  BullMQ job { jobId }
   v
Redis queue  --->  Worker — converts, writes result, reports progress
   |
Browser polls GET /api/jobs/:id  --->  GET /api/download/:id
```

* Uploads land in `/data/jobs/<jobId>/input`, outputs in `/data/jobs/<jobId>/output`.
* A cron sweeper **auto-deletes every job folder 60 minutes after upload**.
* Uploaded files are **never executed** — only validated and converted.

## Folder structure

```
converthub/
├── client/                  # Next.js 14 (App Router) + TypeScript + Tailwind
│   ├── app/
│   │   ├── layout.tsx       # Root layout: metadata, theme, header/footer
│   │   ├── page.tsx         # Home: hero, searchable tool grid, how-it-works
│   │   ├── tools/[toolId]/  # One SEO page per tool (H1, how-to, FAQ, related)
│   │   ├── globals.css      # Tailwind + dark-mode base styles
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ToolLayout.tsx   # THE reusable converter UI (all tools use this)
│   │   ├── ToolExplorer.tsx # Search + category tabs + tool grid (home)
│   │   ├── ToolCard.tsx, Header.tsx, Footer.tsx
│   │   ├── ThemeProvider.tsx, ThemeToggle.tsx, icons.tsx
│   ├── lib/
│   │   ├── site.ts          # Brand name + URLs (rename the site here)
│   │   ├── tools.ts         # 35-tool catalogue (ids match the server)
│   │   └── api.ts           # API client: upload, poll, download, self-test
│   ├── public/              # robots.txt, favicon.svg (ads.txt lands in Phase 6)
│   ├── next.config.mjs      # standalone output for Docker
│   └── tailwind.config.ts   # darkMode: 'class'
├── server/                  # Node.js + Express + TypeScript
│   └── src/
│       ├── index.ts         # Bootstrap: Redis check, worker, cleanup, listen
│       ├── app.ts           # Express app: helmet, CORS, logging, rate limits
│       ├── config/          # env.ts, redis.ts, queue.ts (BullMQ)
│       ├── routes/          # health, tools, convert, jobs, download, selftest
│       ├── middleware/      # validateUpload (multer + magic bytes), rateLimits, errorHandler
│       ├── services/        # toolRegistry.ts (35 tools), jobStore.ts
│       ├── workers/         # converter.ts (BullMQ worker), cleanup.ts (TTL cron)
│       └── utils/           # logger (pino), errors, files
├── docker/                  # server.Dockerfile, client.Dockerfile
├── test/api-smoke.ps1       # PowerShell end-to-end API test
├── docker-compose.yml       # redis + server + client
├── .env.example             # All settings (copy to .env)
└── README.md
```

## Prerequisites (Windows)

1. **Docker Desktop for Windows** — https://www.docker.com/products/docker-desktop
   (enable WSL 2 backend during install; then start Docker Desktop)
2. **Node.js 20 LTS** — https://nodejs.org (needed only for local dev without Docker)
3. **VS Code** — open the `converthub` folder. Install the recommended extensions
   when prompted (Docker, ESLint, Prettier, Tailwind CSS, TypeScript).
4. **Git** (optional) — to version the project.

## Quick start (recommended — Docker)

```powershell
cd converthub
Copy-Item .env.example .env
docker compose up --build
```

Open:

* Website: http://localhost:3000
* API health: http://localhost:4000/api/health
* API readiness (Redis + queue): http://localhost:4000/api/health/ready

Stop everything: `docker compose down`

> Note: `docker compose up` needs the `.env` file — compose reads
> `SERVER_PORT` / `CLIENT_PORT` from it.

## Local dev (without Docker)

You need Redis running. Easiest: `docker compose up redis`, then two terminals:

```powershell
# Terminal 1 — API
cd converthub/server
npm install
npm run dev        # tsx watch, http://localhost:4000

# Terminal 2 — web
cd converthub/client
npm install
npm run dev        # http://localhost:3000
```

For local dev the server uses `./data` inside `server/` for job files.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `SERVER_PORT` / `CLIENT_PORT` | 4000 / 3000 | Host ports published by compose |
| `PORT` | 4000 | Port the API listens on |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection (compose overrides to `redis://redis:6379`) |
| `DATA_DIR` | `./data` | Job files root (`/data` in Docker) |
| `FILE_TTL_MINUTES` | 60 | Auto-delete uploads/outputs after this long |
| `MAX_FILE_SIZE_MB` | 100 | Max upload size |
| `CLIENT_URL` | `http://localhost:3000` | Allowed CORS origin(s), comma-separated |
| `WORKER_CONCURRENCY` | 2 | Parallel conversion jobs |
| `RATE_LIMIT_MAX` | 300 | Global requests per 15 min per IP |
| `CONVERT_RATE_LIMIT_MAX` | 30 | Conversions per 15 min per IP |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | API base URL baked into the web build |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Site URL for metadata |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | _(empty)_ | Used in Phase 6 |

## API reference (Phase 1)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Liveness: `{ status: "ok" }` |
| GET | `/api/health/ready` | Readiness: Redis + queue reachable |
| GET | `/api/tools` | Registry of all 35 tools (id, category, mimes, phase) |
| POST | `/api/convert/:toolId` | Multipart `file` (+ optional `options` JSON) → `202 { jobId, statusUrl }` |
| GET | `/api/jobs/:id` | `{ status: queued\|active\|completed\|failed, progress, result, error }` |
| GET | `/api/download/:id` | Streams the output file (completed jobs only) |
| POST | `/api/selftest` | Enqueues a no-file pipeline test job |

Upload validation: MIME allowlist per tool **plus** magic-bytes sniffing
(`file-type`), size cap, sanitized filenames, path-traversal-safe job ids.

## How to test

**Automated — server unit tests (no Docker needed):**

```powershell
cd server
npm install
npm test
```

Jest runs 20 tests: option validation/sanitization, registry integrity (all 35 tools have
processors and valid schemas), and PDF page-range parsing.

**Automated — API smoke test** (with the stack running via `docker compose up -d`):

```powershell
powershell -ExecutionPolicy Bypass -File ./test/api-smoke.ps1
```

It checks health, readiness, the tool registry, enqueues a self-test job,
polls it to completion and verifies the download. Expect `ALL CHECKS PASSED`.

**Browser smoke tests (Playwright):**

```powershell
cd client
npm install
npx playwright install chromium   # first run only
npx playwright test
```

Checks the home page lists all 35 tools, a tool page renders its converter UI,
the blog index lists 15+ articles, and unknown tools 404.

**Manual:**

1. Open http://localhost:3000 — home page with search + category tabs.
2. Toggle dark/light mode (top-right). Search for "pdf".
3. Open any tool page, e.g. http://localhost:3000/tools/merge-pdf — full converter UI
   with the tool's own options, how-to, FAQ and related tools.
4. `GET /api/tools` lists all 35 enabled tools.
5. Upload real files and convert — every tool processes locally in the worker.

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** — the complete free-stack guide: Oracle Cloud Always Free VM
+ Docker Compose + Cloudflare DNS + Caddy HTTPS, all $0/month. To make a fresh zip of the
project on Windows, run `.\zip-final.ps1` from the parent folder of `converthub`.

## Roadmap

| Phase | Content | Status |
|---|---|---|
| 1 | Setup, Docker, base layout, ToolLayout, job pipeline | Done |
| 2 | PDF tools backend + frontend (18 tools) | Done |
| 3 | Image tools (7 tools) | Done |
| 4 | Audio/video tools (6 tools) | Done |
| 5 | Utility tools, blog (15 articles), legal pages | Done |
| 6 | AdSense, SEO, sitemap, consent banner | Done |
| 7 | Jest + Playwright tests, deployment guide, final zip | Done |

## Notes

* **No URL downloaders:** every tool works only on files the user uploads.
  Nothing in this codebase fetches YouTube/Instagram content.
* **Renaming the site:** change `SITE_NAME` in `client/lib/site.ts`
  (and the `name` fields in the two `package.json` files).
* License: MIT.
#   c o n v e r h u b  
 