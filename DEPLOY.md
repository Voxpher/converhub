# ConvertHub — Deployment Guide

Two paths. **Path A is the default: $0/month, no credit card.**

| | Path A: Render + Vercel | Path B: Oracle VM |
|---|---|---|
| Cost | $0/month | $0/month |
| Credit card | **Not required** | **Required** (identity verification) |
| Power | 512 MB RAM, shared CPU | 4 OCPU / 24 GB RAM |
| Setup | ~30 min, no server admin | ~1–2 hrs, you manage a Linux VM |
| Sleeps when idle | Yes (~15 min) | No |

> Neither Vercel nor Cloudflare Pages can run the conversion engine (no always-on
> process, no native binaries, function timeouts) — so the website goes on Vercel free
> and the engine goes on Render free.

---

## Path A — Render (backend) + Vercel (frontend)

### How it fits together

```
User ──HTTPS──> your-app.vercel.app          (Next.js frontend, Vercel free)
                    │  API calls
                    ▼
        converthub-api.onrender.com          (Render free Docker service)
        ┌────────────────────────────────┐
        │  ONE container:                │
        │   redis-server (local queue)   │
        │   Node API + BullMQ worker     │
        │   ffmpeg, LibreOffice,         │
        │   Ghostscript, qpdf, poppler,  │
        │   Tesseract                    │
        └────────────────────────────────┘
```

The repo already contains everything Render needs: `docker/render.Dockerfile`
(all-in-one image) and `render.yaml` (Blueprint — Render reads it and creates the
service automatically).

### Step 1 — Push the project to GitHub

```powershell
cd C:\path\to\converthub
git init
git add .
git commit -m "ConvertHub complete"
# create a repo on github.com (private is fine), then:
git remote add origin https://github.com/YOUR-USER/converthub.git
git push -u origin main
```

**Honest note:** keep the repo **private** if you prefer — Render and Vercel both work
with private repos. Never commit a real `.env` (only `.env.example` is in the repo).

### Step 2 — Deploy the backend on Render (no card needed)

1. Sign up at **render.com** (email or GitHub — no credit card asked on the free plan).
2. Dashboard → **New → Blueprint** → connect your GitHub → select the `converthub` repo.
3. Render reads `render.yaml` and shows one service: **converthub-api** (Docker, free plan).
   Click **Apply**. The first build takes a while (10–20 min — LibreOffice is a big
   download; this is normal, not stuck).
4. When it says **Live**, open `https://converthub-api.onrender.com/api/health`
   (your name will differ). You should see `{"ok":true,...}`.
5. Copy that backend URL — you need it in the next step.

**Honest note:** the Docker image is built on Render's servers — it was not possible to
test the build in this workspace (no Docker here), so the first Render build is the real
test. If it fails, open the build logs in the Render dashboard; the usual suspects are
listed in Troubleshooting below.

### Step 3 — Deploy the frontend on Vercel (no card needed)

1. Sign up at **vercel.com** (email or GitHub — Hobby plan, no card).
2. **Add New → Project** → import the same `converthub` repo.
3. **Important:** set **Root Directory** to `client` (click Edit next to it).
   Framework preset: Next.js (auto-detected).
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://converthub-api.onrender.com` (your URL from step 2)
   - `NEXT_PUBLIC_SITE_URL` = `https://your-app.vercel.app` (use the Vercel URL it gives you;
     you can update it after deploy)
5. Click **Deploy**. Open the site — the home page with all 35 tools should load.

**Why these exact variables:** `NEXT_PUBLIC_*` values are baked into the site **at build
time**. If you change them later, you must redeploy (Vercel → Deployments → Redeploy).

### Step 4 — Fix CORS (one setting, then redeploy the backend)

Right now the backend only accepts requests from `http://localhost:3000`, so your live
site's Convert buttons would be blocked by the browser. Fix:

1. Render dashboard → **converthub-api** → **Environment** → find `CLIENT_URL` →
   change it to your exact Vercel URL, e.g. `https://converthub-xyz.vercel.app`
   (no trailing slash).
2. Click **Save Changes** — Render redeploys automatically.

### Step 5 — Verify end-to-end

1. Open your Vercel site → pick **Merge PDF** → upload two PDFs → convert → download.
2. Try an image tool and **QR generator** (a no-file tool, exercises the other path).
3. If a conversion works, you're live. Congratulations.

### Step 6 — Optional: your own domain (still free)

1. Add the domain in Vercel (Project → Settings → Domains) and in Render
   (converthub-api → Settings → Custom Domain) — both give you DNS records.
2. Put your DNS on **Cloudflare** (free plan) and add those records.
3. Update `NEXT_PUBLIC_SITE_URL` on Vercel and `CLIENT_URL` on Render to the real
   domain; redeploy both.

### Step 7 — Optional: AdSense (later, when approved)

1. Apply at google.com/adsense with your live domain. **Honest note:** approval is
   Google's decision, never guaranteed; the included legal pages (Privacy, Terms,
   Cookies, Disclaimer, Contact, About) and 15 original articles are there to give the
   application its best shot.
2. When approved, in **Vercel** set `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX`
   and redeploy the frontend; replace the placeholder in `client/public/ads.txt` and push.
3. Create ad units in AdSense and paste the slot IDs into the `<AdSlot slot="...">`
   props in `client/app/tools/[toolId]/page.tsx` (two placements already exist).
4. The consent banner implements Google Consent Mode v2.

---

## Honest caveats — Path A (read before you depend on it)

- **512 MB RAM, shared CPU.** Keep `WORKER_CONCURRENCY=1` (the default in the image)
  and uploads modest. Big videos or heavy LibreOffice jobs can hit the memory limit
  and get killed — the user just sees a failed job, the service stays up.
- **Free services sleep after ~15 min of inactivity.** The first request then takes
  ~30–60 s while it wakes. This is normal on the free tier, not a bug. Optional
  keep-warm: create a free **UptimeRobot** monitor pinging
  `https://your-api.onrender.com/api/health` every 14 minutes.
- **750 hrs/month** covers exactly one always-on service — which is all this needs.
- **The filesystem is ephemeral.** Uploads and results vanish on redeploy/restart —
  but they auto-delete after 60 minutes anyway (`FILE_TTL_MINUTES`), so nothing is lost.
- **Vercel Hobby: 100 GB bandwidth/month** — plenty for a converter site starting out.
- **First Docker build is slow** (10–20 min) because of LibreOffice. Later builds are cached.

---

## Path B — Oracle Always Free VM (needs a credit card)

More power (4 OCPU / 24 GB RAM on Ampere), no sleeping, but **Oracle requires a
payment card for identity verification** and you administer a Linux VM yourself.
Free-tier VM availability also varies by region — not guaranteed.

Condensed steps (ask for the full walkthrough if you pick this):

1. Sign up at cloud.oracle.com, pick a home region near your users (it can't be changed).
2. Create instance: Ubuntu 24.04, shape **VM.Standard.A1.Flex** (Always Free eligible),
   add your SSH key (`ssh-keygen -t ed25519` on Windows).
3. Open ports 80/443: VCN → Security Lists → add ingress rules for `0.0.0.0/0` TCP 80, 443.
4. Point your domain at the VM via **Cloudflare** free DNS (`A @` and `A api` → VM IP, proxied).
5. SSH in, install Docker (see the old guide in git history if needed), copy the project up:
   `scp -r .\converthub ubuntu@<VM-IP>:/home/ubuntu/`.
6. `cp .env.example .env`, set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`,
   `CLIENT_URL` to your real domains.
7. `docker compose build && docker compose up -d` (uses `docker-compose.yml`:
   separate redis + server + client services).
8. Install **Caddy** on the VM for automatic HTTPS, with a `Caddyfile` proxying your
   domain → `localhost:3000` and `api.` → `localhost:4000`; set Cloudflare SSL to
   **Full (strict)**.

---

## Local development (VS Code on Windows — no Docker needed)

```powershell
# Terminal 1 — API + worker (needs Redis; see below)
cd converthub\server
npm install
npm run dev

# Terminal 2 — frontend
cd converthub\client
npm install
npm run dev
```

Redis for local dev: run just Redis in Docker Desktop
(`docker run -p 6379:6379 redis:7-alpine`) or install it in WSL2
(`wsl sudo apt install redis-server`). Without Redis the API still serves pages;
only `/api/convert` queueing needs it.

To run the whole stack locally exactly like production:
`docker compose up -d` needs Docker Desktop. To build the Render image locally:
`docker build -f docker/render.Dockerfile -t converthub:render .` then
`docker run -p 4000:4000 converthub:render` (Render sets `$PORT` itself in production).

Tests:

```powershell
cd converthub\server
npm test            # Jest: options validation, registry integrity, page-range parsing
cd ..\client
npx playwright test # browser smoke tests (installs Chromium on first run)
```

To re-zip the project on Windows: run `.\zip-final.ps1` from the parent folder of
`converthub`.

---

## Troubleshooting

| Symptom | Check |
|---|---|
| Render build fails | Open the build log. Common: transient apt mirror failure → **Manual Deploy → Redeploy** retries with cache. `COPY failed` → the Dockerfile must be built from the repo root (Blueprint sets this). |
| `/api/health` never goes live | Entrypoint logs: `docker logs` equivalent is Render → Logs. If "Redis did not start", the container is unhealthy — check the deploy logs. |
| Convert button errors / CORS errors in browser | `CLIENT_URL` on Render must **exactly** match the frontend origin (`https://...`, no trailing slash). Fix it and let Render redeploy. |
| First click after idle is slow (~30–60 s) | Normal free-tier cold start. Add the UptimeRobot keep-warm ping if it bothers you. |
| Job fails on large video / big Office file | 512 MB RAM limit. Lower `MAX_FILE_SIZE_MB` on Render, keep `WORKER_CONCURRENCY=1`. |
| Frontend talks to localhost / wrong API | `NEXT_PUBLIC_API_URL` was wrong at build time → fix the env var on Vercel → **Redeploy**. |
| Changes to `.env` don't apply (local Docker) | `NEXT_PUBLIC_*` bake at build time → `docker compose build client` then `up -d`. |
| `docker` not recognized (Windows) | Install Docker Desktop and reopen the terminal. |

## Environment variable reference

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `PORT` | Render (auto) | 4000 | Port the API listens on — Render injects it |
| `REDIS_URL` | Render image | `redis://localhost:6379` | Local redis in the all-in-one container |
| `DATA_DIR` | Render image | `/data` | Uploads + results (auto-deleted after TTL) |
| `FILE_TTL_MINUTES` | Render | 60 | Auto-delete uploads/results after N min |
| `MAX_FILE_SIZE_MB` | Render | 100 | Max upload size per file |
| `WORKER_CONCURRENCY` | Render | 1 | Parallel conversions — keep 1 on free tier |
| `CLIENT_URL` | Render | `http://localhost:3000` | Allowed frontend origin (CORS) — **must set to Vercel URL** |
| `LOG_LEVEL` | Render | info | pino log level |
| `NEXT_PUBLIC_API_URL` | Vercel | — | Backend URL, baked at build time |
| `NEXT_PUBLIC_SITE_URL` | Vercel | — | Site URL for metadata/sitemap |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Vercel | _(empty)_ | AdSense publisher ID (after approval) |
