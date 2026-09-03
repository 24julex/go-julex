#!/bin/sh
set -e

echo "==> Applying database schema (idempotent)..."
npx prisma db push --skip-generate

# Seed only on first boot (empty database)
if [ ! -f /data/.seeded ]; then
  echo "==> First boot: seeding database..."
  node src/seed.js || echo "Seed skipped/failed (continuing)"
  node src/sync-store-products.js || true
  touch /data/.seeded
else
  echo "==> Database already seeded, skipping."
fi

echo "==> Starting Go Julex API on port ${PORT:-5000}..."
exec node src/index.js
