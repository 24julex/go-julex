# AGENTS.md

GO JULEX — a 0% platform fee, multi-tenant D2C e-commerce SaaS / merchant marketplace (currency: INR ₹). React SPA frontend + Express/Prisma REST API backend.

## Repo layout

- `src/` — React 18 + Vite + Tailwind 3 frontend (port 3000)
  - `src/pages/customer/` — public storefront; `src/pages/admin/` — merchant console (`/admin`); `src/pages/super-admin/` — master portal (`/super-admin`)
  - `src/context/` — Auth, Cart, Product, MerchantAdmin, SuperAdmin, Theme contexts
  - `src/services/api.js` — all backend calls; base URL hardcoded to `http://localhost:5000/api`
  - `src/data/` — mock/seed data still used by some super-admin pages
- `server/` — Express REST API (port 5000), separate package.json/lockfile
  - `server/src/routes/` — auth, products, brands, orders, admin, coupons, invoices, upload, superAdmin, customers (mounted under `/api/*`)
  - `server/prisma/` — schema + SQLite `dev.db`; migrations dir contains SQL but `db push` is the workflow
  - `server/src/generated/client/` — Prisma generated client, committed; never hand-edit, regenerate with `prisma generate`
- `server/.env` — `PORT`, `DATABASE_URL`, `JWT_SECRET` (exists locally, do not commit secrets)

## Commands

Frontend (repo root):
- `npm run dev` — Vite dev server on port 3000
- `npm run build` / `npm run preview`

Backend (from `server/`):
- `npm start` (or `npm run dev`) — `node src/index.js`, no nodemon; restart manually after edits
- `npm run db:setup` — prisma generate + db push + seed (`src/seed.js`)

No lint, typecheck, or test runner is configured. `server/test-api.mjs` and `server/test-mutations.mjs` are ad-hoc manual scripts. Run both frontend and backend together for anything touching auth/orders/products.

## Conventions & gotchas

- Components use **named exports** (`export const App`), not default exports — follow this in new files.
- `vite.config.js` sets `path.resolve()` as root and defines the `@` alias (`@` → `src/`). Prefer `@/` imports.
- JWT auth: frontend reads token from localStorage keys `gojulex_jwt_token` or `chronos_jwt_token` (legacy fallback) and sends `Authorization: Bearer`.
- Route protection lives in `src/App.jsx` (`ProtectedAdminRoute`, `ProtectedSuperAdminRoute`); super-admin requires `isSuperAdmin` from AuthContext. Impersonation flow exists (`/auth/impersonate`).
- Styling: Tailwind theme tokens `julex.*`, `gold.*`, `obsidian.*` plus font families (Cinzel, Playfair Display, Plus Jakarta Sans, Great Vibes) defined in `tailwind.config.js`; fonts loaded via Google Fonts in `index.html`. Dark mode is `class`-based; `<html>` starts with `class="dark"`.
- Tailwind scans only `index.html` and `src/**` — classes used in `server/` or standalone HTML files (e.g. `font_test.html`) are not compiled.
- Multi-tenant model: core Prisma models are User, Tenant, Product, Brand, Order/OrderItem, Coupon, AuditLog, plus invoice template configs. Tenant scoping matters in admin/super-admin routes.
