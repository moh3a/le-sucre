# Le Sucre

<p align="center">
  <a href="https://github.com/your-org/le-sucre/actions"><img src="https://img.shields.io/github/actions/workflow/status/your-org/le-sucre/security-scan.yml?branch=main&style=flat-square&label=CI&logo=github" alt="CI"></a>
  <img src="https://img.shields.io/badge/version-0.4.11-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/license-proprietary-red?style=flat-square" alt="License">
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.31-blue?style=flat-square&logo=typescript" alt="TypeScript"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React"></a>
  <a href="https://orm.drizzle.team"><img src="https://img.shields.io/badge/Drizzle-ORM-c8d152?style=flat-square" alt="Drizzle ORM"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS"></a>
</p>

<p align="center">
  <a href="https://www.mysql.com"><img src="https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat-square&logo=mysql" alt="MySQL"></a>
  <a href="https://redis.io"><img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis"></a>
  <a href="https://www.docker.com"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker"></a>
  <img src="https://img.shields.io/badge/pnpm-9-FF6914?style=flat-square&logo=pnpm" alt="pnpm">
  <a href="https://trpc.io"><img src="https://img.shields.io/badge/tRPC-11-398CCB?style=flat-square" alt="tRPC"></a>
  <a href="https://www.better-auth.com"><img src="https://img.shields.io/badge/Better_Auth-1.6-FFD166?style=flat-square" alt="Better Auth"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Storefront-FR%20%7C%20EN%20%7C%20AR-700145?style=flat-square" alt="i18n">
  <img src="https://img.shields.io/badge/Admin-French-4D4C20?style=flat-square" alt="Admin">
  <img src="https://img.shields.io/badge/Currency-DZD-4d4c20?style=flat-square" alt="Currency">
  <img src="https://img.shields.io/badge/Tax-19%25-700145?style=flat-square" alt="Tax">
</p>

Enterprise-grade ecommerce platform for pastry and sweets making tools, cooking ingredients, and packaging. Built for the Algerian market with support for B2C and future B2B use cases.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Node.js runtime) |
| Language | TypeScript (strict mode) |
| Database | MySQL 8.4 |
| ORM | Drizzle ORM |
| Auth | Better Auth |
| API | tRPC |
| Cache | Redis 7 |
| Styling | TailwindCSS v4 |
| UI | shadcn/ui (radix-maia) |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| State | TanStack Query, nuqs |
| i18n | next-intl (FR, EN, AR) |
| Charts | Recharts |
| DnD | dnd-kit |
| Logging | Winston |
| Package Manager | pnpm |

## Features

### Storefront

- Product catalog with categories, subcategories, and brands
- Product variants, media gallery, and comparisons
- Full-text search with faceted filtering
- Shopping cart and multi-step checkout
- Order tracking
- Customer account (orders, addresses, wishlists, collections, reviews, returns)
- Flash sales, promotions, and promo codes
- Best sellers, new arrivals, recently viewed
- Shared wishlists and collections via token
- Responsive design with dark mode
- Trilingual support (French, English, Arabic)

### Admin Dashboard

- Analytics overview with KPIs and charts
- Product, category, brand, and variant management
- Order management with status workflow
- Customer management with 360-degree view
- Payment processing (capture, retry, cancel, refunds, installments)
- Invoice generation and PDF download
- Shipping integration (Yalidine) with tracking sync
- Campaign management with A/B testing, automation rules, and landing pages
- Promotion engine with promo codes, flash sales, bundles, and usage tracking
- Inventory management with stock reservations and forecasting
- Procurement and returns/RMA
- Media library with upload and optimization
- Feature flags
- IP blacklist
- RBAC with granular permissions
- Audit logging
- Health monitoring
- Task management

### Infrastructure

- Docker multi-stage build with hardened containers
- PM2 cluster mode for production
- MySQL read replica support
- Redis with ACL security and command restrictions
- Background workers (shipping sync, blacklist expiry, reservation expiry)
- Rate limiting, CSRF protection, and comprehensive security middleware
- Structured logging with daily rotation and audit trail
- GitHub Actions CI/CD with CodeQL, GitLeaks, Trivy, and dependency review

## Prerequisites

- Node.js 22+
- pnpm 9+
- MySQL 8.4
- Redis 7+

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-org/le-sucre.git
cd le-sucre
pnpm install
```

### 2. Environment setup

```bash
cp .env.production.example .env.local
```

Edit `.env.local` and set at minimum:

```env
DATABASE_URL="mysql://app:password@localhost:3306/le_sucre"
REDIS_URL="redis://localhost:6379"
BETTER_AUTH_SECRET="your-secret-at-least-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000"
```

### 3. Database setup

```bash
# Push schema to database
pnpm db:push

# Or generate and run migrations
pnpm db:generate
pnpm db:migrate

# Seed RBAC permissions
pnpm seed:rbac
pnpm seed:blacklist-permissions
```

### 4. Start development server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:generate` | Generate migration files |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm seed:rbac` | Seed RBAC permissions and roles |
| `pnpm seed:blacklist-permissions` | Seed IP blacklist permissions |
| `pnpm backfill:customer-role` | Backfill customer role for existing users |

## Project Structure

```
src/
├── app/                    # Next.js App Router routes
│   ├── (storefront)/       # Public storefront (locale-wrapped)
│   ├── console/            # Admin dashboard
│   ├── api/                # API routes (admin, storefront, auth, webhooks, tRPC)
│   ├── auth/               # Authentication pages
│   └── docs/               # Documentation pages
├── components/             # Shared React components
│   ├── ui/                 # shadcn/ui components (59 components)
│   ├── console/            # Admin-specific components
│   ├── storefront/         # Storefront-specific components
│   ├── layout/             # Layout components
│   ├── providers/          # App providers
│   └── theme/              # Theme provider
├── config/                 # App configuration (env, media, theme)
├── constants/              # App constants
├── features/               # Feature modules (21 features)
│   ├── analytics_management_system/
│   ├── authentication_and_authorization/
│   ├── billing_and_finance_system/
│   ├── campaign_management_system/
│   ├── console_dashboard/
│   ├── contact_management/
│   ├── customer_dashboard/
│   ├── data-table/
│   ├── feature_flag_system/
│   ├── init_system/
│   ├── inventory_management_system/
│   ├── ip_blacklist/
│   ├── media_library/
│   ├── monitoring/
│   ├── operations_workflows/
│   ├── order_management_system/
│   ├── payment_management_system/
│   ├── product_information_management/
│   ├── product_reviews_management/
│   ├── shipping_management_system/
│   └── wishlist_management_system/
├── hooks/                  # Custom React hooks (18 hooks)
├── i18n/                   # Internationalization (messages, config, routing)
├── lib/                    # Core libraries
│   ├── auth/               # Better Auth setup
│   ├── db/                 # Drizzle ORM, migrations, helpers
│   ├── redis/              # Redis client
│   ├── security/           # Security middleware (23 modules)
│   ├── trpc/               # tRPC server, context, router
│   ├── queue/              # Background job workers
│   └── monitoring/         # Health checks
└── styles/                 # Global styles
```

Each feature module follows a consistent structure:

```
feature/
├── db/                     # Database queries
├── entities/               # Entity types
├── models/                 # Business models
├── repositories/           # Data access layer
├── services/               # Business logic
├── routers/                # tRPC routers
├── validators/             # Zod schemas
├── components/             # React components
├── hooks/                  # Feature-specific hooks
├── types/                  # TypeScript types
└── constants/              # Feature constants
```

## Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t le-sucre-app .

# Start all services
docker compose -f docker-compose.prod.yml up -d
```

Services: app (port 3000), MySQL 8.4, Redis 7, shipping worker, blacklist expiry worker, reservation expiry worker.

### PM2

```bash
pnpm build
pm2 start ecosystem.config.cjs
```

Processes: web (cluster mode), shipping worker, reservation worker, blacklist expiry worker (cron).

## Security

- OWASP-recommended protections (SQL injection, XSS, CSRF, SSRF, IDOR)
- Rate limiting with Redis backend
- Login attempt limiting with temporary account lockout
- Session rotation and concurrent session limits
- RBAC with granular permissions
- IP blacklist with automatic expiry
- Input validation and sanitization via Zod
- Security headers (CSP, HSTS, X-Frame-Options, COEP/COOP/CORP)
- Docker containers run as non-root with read-only filesystem
- Redis ACL with dangerous commands disabled
- Structured logging with sensitive data redaction
- GitHub Actions: CodeQL, GitLeaks, Trivy container scanning, dependency review

## Internationalization

| Scope | Languages |
|-------|-----------|
| Storefront | French (default), English, Arabic |
| Admin dashboard | French |
| API responses | Trilingual `{ en, fr, ar }` message objects |

Locale routing: `/fr/...`, `/en/...`, `/ar/...`

## Design System

- **Typography:** Orla Serif (headings), Montserrat (body), Geist Mono (code)
- **Colors:** Lemon Lime `#c8d152`, Lemon Chiffon `#f9f7be`, Olive Leaf `#4d4c20`, Cream `#fff3e3`, Crimson Violet `#700145`
- **Components:** 59 shadcn/ui components with radix-maia style
- **Admin page types:** Management/List pages and Details pages with standardized layouts
- **Responsive:** Mobile-first with adaptive Dialog/Drawer patterns

Full design system documentation is available in `docs/` and at `/docs/design-system` within the application.

## License

Proprietary. All rights reserved.
