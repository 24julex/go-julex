# GO JULEX — 0% Platform Fee D2C E-Commerce SaaS & Merchant Marketplace

A multi-tenant e-commerce platform (currency: INR ₹) where independent brands, artisans, and sellers run their own storefronts on flat subscription plans — **0% commission on every sale**.

React SPA frontend + Express/Prisma REST API backend + SQLite (Postgres-ready), fully Dockerized.

## Features

- **Multi-tenant storefronts** — each merchant gets a themed store at `/store/<subdomain>` with live product catalogs, cart, checkout, and invoices
- **21 storefront themes** (Playful Pop, Editorial Boutique, Quiet Luxe, Parfum Botanical with animations, Markly Editorial, and more) with a live theme previewer and per-store customization
- **Merchant console** (`/admin`) — products, orders, customers, discounts/coupons, analytics, themes, domains, invoice settings
- **Super admin portal** (`/super-admin`) — tenants, plans, revenue/GMV analytics, master theme catalog with edit/delete authority, audit logs
- **Real commerce logic** — database-backed stock deduction on every order, server-validated coupon codes (percentage discounts, minimum order rules, activation toggles), GST invoice templates with signatures
- **JWT auth** with role-based access (customer / merchant / super admin) and merchant impersonation

## Quick Start (Docker — recommended)

```bash
docker compose up --build -d
```

App: http://localhost:3000 · API health: http://localhost:3000/api/health

The database is created, seeded, and persisted on a Docker volume automatically.

## Quick Start (local development)

```bash
# Backend (terminal 1)
cd server
cp ../.env.example .env       # then edit JWT_SECRET
npm install
npm run db:setup              # prisma generate + db push + seed
npm start                     # API on http://localhost:5000

# Frontend (terminal 2)
npm install
npm run dev                   # Vite on http://localhost:3000
```

## Demo Accounts

| Role | Login | Password |
|---|---|---|
| Super Admin | `admin@gojulex.com` | `admin123` |
| Merchant | `merchant@gojulex.com` | `admin123` |
| Customer | `customer@gojulex.com` | `customer123` |

## Project Structure

```
src/                  React 18 + Vite + Tailwind frontend
  pages/customer/     Public storefronts, catalog, checkout
  pages/admin/        Merchant console
  pages/super-admin/  Master portal
  context/            Auth, Cart, Product, MerchantAdmin, SuperAdmin, Theme
server/               Express REST API
  src/routes/         auth, products, brands, orders, coupons, invoices, themes, superAdmin...
  prisma/             Schema (SQLite dev; Postgres-ready)
docker-compose.yml    Frontend (nginx) + backend (Node) + DB volume
```

## Going Live

1. Set a strong `JWT_SECRET` (`JWT_SECRET=... docker compose up -d`)
2. Restrict CORS in `server/src/index.js` to your domain
3. Deploy behind HTTPS (any cloud provider or reverse proxy)
4. Optionally migrate to Postgres by pointing `DATABASE_URL` at a Postgres instance

## License

MIT
