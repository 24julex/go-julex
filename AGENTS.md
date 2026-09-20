# AGENTS.md

GO JULEX — a 0% platform fee, multi-tenant D2C e-commerce SaaS / merchant marketplace (currency: INR ₹). React SPA frontend + Express/Prisma REST API backend.

## Repo layout

- `src/` — React 18 + Vite + Tailwind 3 frontend (port 3000)
  - `src/pages/customer/` — public storefront; `src/pages/admin/` — merchant console (`/admin`); `src/pages/super-admin/` — master portal (`/super-admin`)
  - `src/context/` — Auth, Cart, Product, MerchantAdmin, SuperAdmin, Theme contexts
  - `src/services/api.js` — all backend calls; base URL is `import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'` (Docker builds set `/api`, proxied to the backend by nginx)
  - `src/data/` — mock/seed data still used by some super-admin pages
- `server/` — Express REST API (port 5000), separate package.json/lockfile
  - `server/src/routes/` — auth, products, brands, orders, admin, coupons, invoices, upload, superAdmin, customers, store, themes, domains, plans (mounted under `/api/*`)
  - `server/src/middleware/` — `auth.js` (JWT guards: `requireMerchantAdmin`, `requireSuperAdmin`), `rateLimit.js`
  - `server/src/utils/` — `mailer.js` (nodemailer), `slug.js`, `totp.js` (email-OTP login)
  - `server/src/bootstrap.js` — idempotent startup upserts (plans, master invoice templates); run on boot in Docker
  - `server/prisma/` — schema + SQLite `dev.db`; migrations dir contains SQL but `db push` is the workflow
  - `server/src/generated/client/` — Prisma generated client, committed; never hand-edit, regenerate with `prisma generate`
- `server/.env` — `PORT`, `DATABASE_URL`, `JWT_SECRET` (exists locally, do not commit secrets)
- `Dockerfile` + `nginx.conf` + `docker-compose.yml` — frontend container (nginx serves SPA, proxies `/api`); `server/Dockerfile` + `entrypoint.sh` — backend container
- `scripts/apply-theme-images.mjs` — downloads theme imagery to `public/theme-images/` and rewrites `src/data/themeRegistry.js`; run from inside `scripts/` (resolves repo root as `cwd/..`)

## Commands

Frontend (repo root):
- `npm run dev` — Vite dev server on port 3000
- `npm run build` / `npm run preview`

Backend (from `server/`):
- `npm start` (or `npm run dev`) — `node src/index.js`, no nodemon; restart manually after edits
- `npm run db:setup` — prisma generate + db push + seed (`src/seed.js`)

No lint, typecheck, or test runner is configured. `server/test-api.mjs`, `server/test-mutations.mjs`, and `server/test-critical.mjs` are ad-hoc manual scripts (`test-critical.mjs` mutates data — run it only against a disposable, seeded DB; base URL via `TEST_API_BASE`). Run both frontend and backend together for anything touching auth/orders/products.

Deployment (Docker):
- `docker compose up -d --build` — backend on `127.0.0.1:5000`, frontend via nginx on port 80 proxying `/api`
- VPS override: `docker compose -f docker-compose.yml -f docker-compose.vps.yml up -d --build` — backend on host network, port 5001 (Hostinger VPS firewall drops Docker bridge outbound traffic)
- Backend entrypoint runs `prisma db push --skip-generate` + `bootstrap.js` on every start; demo seed is opt-in via `SEED_DEMO_DATA=1` (guarded by `/data/.seeded` marker)

## Conventions & gotchas

- Components use **named exports** (`export const App`), not default exports — follow this in new files.
- `vite.config.js` sets `path.resolve()` as root and defines the `@` alias (`@` → `src/`). Prefer `@/` imports.
- JWT auth: frontend reads token from localStorage keys `gojulex_jwt_token` or `chronos_jwt_token` (legacy fallback) and sends `Authorization: Bearer`.
- Auth also supports Google Sign-In via Firebase (`src/firebase.js`, backend verifies with `FIREBASE_API_KEY`), Google/Microsoft OAuth (env-provided client IDs/secrets), and email-OTP login (`totp.js`; `ALLOW_DEV_OTP` exposes the OTP in the response for dev only).
- Route protection lives in `src/App.jsx` (`ProtectedAdminRoute`, `ProtectedSuperAdminRoute`); super-admin requires `isSuperAdmin` from AuthContext. Impersonation flow exists (`/auth/impersonate`).
- Styling: Tailwind theme tokens `julex.*`, `gold.*`, `obsidian.*` plus font families (Cinzel, Playfair Display, Plus Jakarta Sans, Great Vibes) defined in `tailwind.config.js`; fonts loaded via Google Fonts in `index.html`. Dark mode is `class`-based; `<html>` starts with `class="dark"`.
- Tailwind scans only `index.html` and `src/**` — classes used in `server/` or standalone HTML files (e.g. `font_test.html`) are not compiled.
- Multi-tenant model: core Prisma models are User, Tenant, Product, Brand, Order/OrderItem, Coupon, AuditLog, plus invoice template configs. Tenant scoping matters in admin/super-admin routes.
