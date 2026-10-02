# ConvertHub API — multi-stage build with the full conversion stack:
# ffmpeg (audio/video), LibreOffice headless (office docs), Ghostscript + qpdf
# (PDF compression/encryption), poppler-utils (PDF rasterization), Tesseract
# (OCR), plus DejaVu fonts for headless rendering.

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    libreoffice-writer libreoffice-calc libreoffice-impress \
    ghostscript \
    qpdf \
    poppler-utils \
    tesseract-ocr tesseract-ocr-eng \
    fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
# Run as an unprivileged user: uploaded content is never executed, and the
# converter processes (soffice/ffmpeg) inherit these restricted privileges.
RUN useradd --create-home --uid 10001 converthub \
  && mkdir -p /data && chown converthub:converthub /data
VOLUME /data
ENV PORT=4000 DATA_DIR=/data
EXPOSE 4000
USER converthub
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
