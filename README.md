# GO JULEX

GO JULEX is a multi-tenant D2C storefront platform for Indian merchants. It has a React/Vite customer and merchant interface and an Express/Prisma API. The current checkout supports **cash on delivery only**. Online payment, custom-domain activation, transactional email, and production tax invoicing require further configuration and integration.

## What works today

- Merchants can configure storefronts, themes, products, stock, coupons, and order fulfillment.
- Storefront checkout calculates prices and discounts on the server, reserves stock transactionally, and creates a pending-payment order. Repeated checkout requests use an idempotency key. Merchants can record cash collection after delivery with an audit entry.
- Authenticated merchant endpoints enforce tenant ownership. Customers cannot view another customer's order.
- Product reviews require a signed-in customer with a paid purchase.
- The default interface uses white, cream, and golden yellow. Storefront themes remain individually customizable.
- Merchant products, orders, customers, and coupons now load from the API. Analytics exclude unpaid orders from collected sales, apply the selected date range, and export the displayed orders as CSV.
- Invoice settings load and save merchant legal details and the selected layout. Layout previews are samples; invoices for real orders require recorded payment and a configured legal name and address.

## Local development

Use two terminals:

```bash
cd server
cp ../.env.example .env
npm ci
npm run prisma:generate
npm run prisma:push
node src/bootstrap.js
npm start
```

```bash
npm ci
npm run dev
```

App: http://localhost:3000. API: http://localhost:5000/api/health. Set a unique `JWT_SECRET` in `server/.env`. To create the first platform admin, set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` before running bootstrap; the password must have at least 16 characters. `npm run db:setup` intentionally seeds demo data and should only be used in disposable development databases.

## Docker

Set `JWT_SECRET`, `BOOTSTRAP_ADMIN_EMAIL`, and `BOOTSTRAP_ADMIN_PASSWORD` in a root `.env` file before running:

```bash
docker compose up --build -d
```

The admin bootstrap is idempotent. Demo accounts and stores are **off by default**; set `SEED_DEMO_DATA=1` only for a disposable demonstration. SQLite data and uploaded images live in the `julex-db` Docker volume. Back up that volume before upgrades. The `UPLOAD_DIR` setting controls image storage.

## Checks

```bash
npm run build
cd server
node test-api.mjs
node test-mutations.mjs
node test-critical.mjs
```

API tests need a running server with an isolated seeded database. Do not run them against customer data because they create and mutate records.

## Before a public launch

1. Integrate a payment provider with server-verified webhooks and refund handling. Until then, checkout is cash on delivery and orders stay pending payment.
2. Complete merchant legal and tax details before issuing invoices. Validate GST treatment and invoice rules with a qualified professional.
3. Configure SMTP and test order, password-reset, and operational email delivery. The UI does not claim an email was sent when no sender is configured.
4. Implement domain ownership checks, DNS verification, and TLS provisioning before enabling custom domains.
5. Replace remaining local-only channel, theme, and platform-admin workflows with persisted APIs. Add monitoring, backups, recovery drills, and deployment-specific CORS/HTTPS settings.
6. Add end-to-end tests for checkout, admin operations, accessibility, and mobile devices. The current production bundle is large and should be split before growth.

## Layout

- `src/`: React customer, merchant, and platform admin interfaces
- `server/src/routes/`: API routes
- `server/prisma/schema.prisma`: data model
- `docker-compose.yml`: local container deployment
