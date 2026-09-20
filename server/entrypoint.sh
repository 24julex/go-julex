#!/bin/sh
set -e

echo "==> Applying database schema (idempotent)..."
npx prisma db push --skip-generate

node src/bootstrap.js

# Demo accounts and storefronts are opt-in and must never appear by accident
# on a production deployment.
if [ "${SEED_DEMO_DATA:-0}" = "1" ] && [ ! -f /data/.seeded ]; then
  echo "==> Seeding explicitly requested demo data..."
  node src/seed.js
  node src/sync-store-products.js
  touch /data/.seeded
fi

echo "==> Starting Go Julex API on port ${PORT:-5000}..."
exec node src/index.js
