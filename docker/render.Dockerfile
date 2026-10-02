# ConvertHub all-in-one image for Render's free tier.
#
# One container runs everything:
#   - redis-server (local only, no persistence — uploads auto-delete anyway)
#   - the Node API + the BullMQ worker (server/src/index.ts starts both
#     in a single process)
# plus the full conversion stack: ffmpeg, LibreOffice headless, Ghostscript,
# qpdf, poppler-utils (pdftoppm), Tesseract OCR and DejaVu fonts.
#
# NOTE: this Dockerfile is built with the REPO ROOT as build context
# (Render: dockerfilePath ./docker/render.Dockerfile), so all COPY paths
# below are relative to the repo root, not to ./server.

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    redis-server \
    ffmpeg \
    libreoffice-writer libreoffice-calc libreoffice-impress \
    ghostscript \
    qpdf \
    poppler-utils \
    tesseract-ocr tesseract-ocr-eng \
    fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY docker/render-entrypoint.sh /usr/local/bin/render-entrypoint.sh
# Unprivileged user: uploaded content is never executed, and the converter
# processes (soffice/ffmpeg) inherit these restricted privileges.
RUN chmod +x /usr/local/bin/render-entrypoint.sh \
  && useradd --create-home --uid 10001 converthub \
  && mkdir -p /data && chown converthub:converthub /data
VOLUME /data
# Sensible free-tier defaults; every one of these is overridable in the
# Render dashboard (or render.yaml).
ENV PORT=4000 \
    DATA_DIR=/data \
    REDIS_URL=redis://localhost:6379 \
    FILE_TTL_MINUTES=60 \
    MAX_FILE_SIZE_MB=100 \
    WORKER_CONCURRENCY=1 \
    LOG_LEVEL=info
EXPOSE 4000
USER converthub
ENTRYPOINT ["/usr/local/bin/render-entrypoint.sh"]
