# UMKM Go

## Overview

UMKM Go adalah platform SaaS multi-tenant untuk UMKM Indonesia. Memungkinkan pemilik UMKM membuat website toko profesional dalam 5 menit, serta menyediakan admin dashboard untuk mengelola platform.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (artifacts/umkm-go)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Routing**: Wouter
- **Animations**: Framer Motion
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── umkm-go/            # React + Vite frontend (serves at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Key Features

### User Side (UMKM Owner)
- Landing page with pricing, features, testimonials, FAQ
- Auth: Register/Login (email + password)
- 5-step onboarding wizard: nama toko → kategori → WhatsApp → logo → selesai
- User dashboard: stats cards (visitors, orders, revenue, conversion rate)
- Catalog management: CRUD produk dengan search
- Store settings
- Billing & subscription info
- Support tickets: buat dan pantau tiket bantuan
- Public storefront (/store/:slug): hero, product grid, WhatsApp button

### Admin Side (Platform Manager)
- Protected admin routes (/admin/*)
- Global analytics dashboard: KPI cards, signup trend, tier distribution, top stores
- User management: list, search, filter, suspend/unsuspend
- Revenue monitoring: trend chart, tier breakdown, transaction history
- Platform health: uptime, error rate, response time, services status
- Support tickets: assign, respond, resolve
- Audit logs: searchable admin action history
- Feature flags: toggle on/off, rollout percent control

## Demo Accounts

- **Admin**: admin@umkmgo.id / admin123456 (super_admin role)
- **Demo UMKM**: demo@umkm.id / demo123456 (has store: Warung Makan Sederhana)
- **Demo storefront**: /store/warung-sederhana

## Database Schema

Tables in PostgreSQL:
- `users` - User accounts (id, name, email, password_hash, role, tier, status)
- `categories` - 14 kategori bisnis UMKM
- `stores` - Toko per UMKM (slug, name, category, whatsapp, theme)
- `products` - Produk per toko (name, price, description, imageUrl)
- `support_tickets` - Tiket dukungan pengguna
- `admin_logs` - Audit trail semua aksi admin
- `feature_flags` - Feature flags platform

## API Routes

All routes prefixed with `/api`:

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Stores
- GET /api/stores/my (user's own store)
- GET /api/stores/:slug (public storefront)
- POST /api/stores (create store)
- PUT /api/stores/:slug (update store)

### Products
- GET /api/products (user's products with search/pagination)
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

### Analytics
- GET /api/analytics/dashboard

### Admin (requireAdmin middleware)
- GET /api/admin/stats
- GET /api/admin/users
- POST /api/admin/users/:id/suspend
- POST /api/admin/users/:id/unsuspend
- GET /api/admin/revenue
- GET /api/admin/health
- GET /api/admin/logs

### Support Tickets
- GET /api/tickets
- POST /api/tickets
- GET /api/tickets/:id
- PUT /api/tickets/:id

### Feature Flags
- GET /api/flags
- POST /api/flags
- PUT /api/flags/:id

## Access Control

- `requireAuth` middleware: checks JWT Bearer token
- `requireAdmin` middleware: checks role = admin | super_admin
- JWT stored in localStorage as 'umkm_token'
- User info stored in localStorage as 'umkm_user'

## Frontend Routes

- `/` - Landing page
- `/login` - Login
- `/register` - Register
- `/onboarding` - 5-step store setup wizard
- `/dashboard` - User dashboard
- `/dashboard/catalog` - Product management
- `/dashboard/settings` - Store settings
- `/dashboard/billing` - Billing & plan info
- `/dashboard/support` - Support tickets
- `/store/:slug` - Public storefront
- `/admin/dashboard` - Admin global stats
- `/admin/users` - User management
- `/admin/revenue` - Revenue monitoring
- `/admin/health` - Platform health
- `/admin/tickets` - Support ticket management
- `/admin/logs` - Audit logs
- `/admin/flags` - Feature flags

## Running Locally

```bash
# API server dev
pnpm --filter @workspace/api-server run dev

# Frontend dev
pnpm --filter @workspace/umkm-go run dev

# Push DB schema
pnpm --filter @workspace/db run push

# Run codegen after OpenAPI spec changes
pnpm --filter @workspace/api-spec run codegen
```
