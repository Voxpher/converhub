#!/bin/sh
# Render all-in-one entrypoint: start a local redis-server, wait until it
# answers, then exec the ConvertHub API (which also runs the BullMQ worker
# in-process — see server/src/index.ts).
set -eu

# Render injects $PORT automatically; default to 4000 for local docker runs.
PORT="${PORT:-4000}"
export PORT

echo "[entrypoint] Starting redis-server (local, no persistence)..."
redis-server \
  --port 6379 \
  --daemonize yes \
  --pidfile /tmp/redis.pid \
  --logfile "" \
  --dir /tmp \
  --save '' \
  --appendonly no

echo "[entrypoint] Waiting for Redis on 127.0.0.1:6379..."
i=1
while [ "$i" -le 30 ]; do
  if redis-cli -p 6379 ping >/dev/null 2>&1; then
    echo "[entrypoint] Redis is up."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[entrypoint] ERROR: Redis did not start within 30s." >&2
    exit 1
  fi
  i=$((i + 1))
  sleep 1
done

echo "[entrypoint] Starting ConvertHub API + worker on port ${PORT}..."
exec node dist/index.js
