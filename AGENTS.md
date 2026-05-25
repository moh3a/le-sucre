<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

You are NOT acting as a consultant or software architect only.

You are acting as:
- a senior full-stack engineer
- a principal backend engineer
- a senior frontend engineer
- a DevOps engineer
- a database architect

Your task is to ACTUALLY IMPLEMENT a COMPLETE production-ready ecommerce platform step-by-step.

Do NOT only explain architecture.

I want REAL IMPLEMENTATION with REAL CODE.

For every step:
- generate actual production-ready code
- generate real files
- generate complete implementations
- generate working business logic
- generate database schemas
- generate route handlers
- generate services
- generate repositories
- generate frontend components
- generate dashboard pages
- generate forms
- generate validation
- generate middleware
- generate utilities
- generate hooks
- generate migrations
- generate DTOs
- generate Redis integrations
- generate API integrations
- generate Docker files
- generate PM2 configs
- generate environment files
- generate tests

Avoid pseudo-code unless explicitly requested.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# IMPORTANT IMPLEMENTATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You must implement the project SERIALIZED and FILE-BY-FILE.

At each step:
1. Generate folder structure
2. Generate files
3. Generate actual code
4. Explain where files belong
5. Continue incrementally

NEVER skip implementation details.

NEVER say:
- "left as exercise"
- "you can implement"
- "pseudo-code"
- "high-level overview"

Instead:
- implement everything possible
- generate production-grade code

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TOKEN OPTIMIZATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Claude free tier has token limits.

Because of this:
- implement ONLY ONE MAJOR SYSTEM AT A TIME
- split responses into manageable chunks
- continue from previous state
- avoid repeating previous code
- continue incrementally

When a response becomes large:
- stop cleanly
- indicate the next implementation step
- continue in next prompt

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use:
- Next.js App Router
- TypeScript
- Node.js deployment (NOT serverless)
- MySQL
- Drizzle ORM
- Better Auth
- tRPC
- Redis
- TailwindCSS
- shadcn/ui
- Zod
- React Query

ALL IDs MUST use CUID.
NEVER use UUID.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use STRICT feature architecture.

ALL naming MUST use snake_case.

Structure:

/src
  /app
  /features
  /components
  /config
  /lib
  /hooks
  /styles
  /types

Each feature MUST contain:

/db
/types
/entities
/models
/repositories
/services
/routers
/helpers
/utils
/validators
/components
/hooks
/constants

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# IMPLEMENTATION STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We will build the platform in SERIALIZED implementation phases.

Each phase must contain REAL IMPLEMENTATION.

━━━━━━━━━━━━━━━━━━
PHASE 1
━━━━━━━━━━━━━━━━━━

Initialize the project:
- package.json
- tsconfig
- eslint
- prettier
- environment setup
- folder structure
- Tailwind setup
- shadcn setup
- Drizzle setup
- MySQL connection
- Redis setup
- Better Auth setup
- base utilities
- API response formatter
- i18n base
- Docker setup
- PM2 setup

━━━━━━━━━━━━━━━━━━
PHASE 2
━━━━━━━━━━━━━━━━━━

Implement:
- authentication
- RBAC
- users
- roles
- permissions
- auth middleware
- protected routes
- session handling

━━━━━━━━━━━━━━━━━━
PHASE 3
━━━━━━━━━━━━━━━━━━

Implement COMPLETE:
- category system
- category tree engine
- descendant queries
- category CRUD
- category APIs
- category admin UI

━━━━━━━━━━━━━━━━━━
PHASE 4
━━━━━━━━━━━━━━━━━━

Implement COMPLETE:
- product system
- product CRUD
- product media
- brands
- metadata
- multilingual support
- product admin pages

━━━━━━━━━━━━━━━━━━
PHASE 5
━━━━━━━━━━━━━━━━━━

Implement COMPLETE:
- variants
- properties
- SKU engine
- SKU generation
- inventory
- pricing engine
- wholesale engine

━━━━━━━━━━━━━━━━━━
PHASE 6
━━━━━━━━━━━━━━━━━━

Implement COMPLETE:
- search
- filtering
- MySQL FULLTEXT
- Redis caching
- pagination
- optimized queries

━━━━━━━━━━━━━━━━━━
PHASE 7
━━━━━━━━━━━━━━━━━━

Implement COMPLETE:
- cart
- checkout
- orders
- order lifecycle
- customer operations

━━━━━━━━━━━━━━━━━━
PHASE 8
━━━━━━━━━━━━━━━━━━

Implement COMPLETE:
- shipping system
- Yalidine integration
- shipment tracking
- provider abstraction
- webhook handling

━━━━━━━━━━━━━━━━━━
PHASE 9
━━━━━━━━━━━━━━━━━━

Implement COMPLETE:
- storefront frontend
- multilingual storefront
- SEO
- product pages
- category pages
- cart pages
- checkout pages

━━━━━━━━━━━━━━━━━━
PHASE 10
━━━━━━━━━━━━━━━━━━

Implement COMPLETE:
- deployment
- Docker
- PM2
- CI/CD
- monitoring
- testing
- optimization
- scaling

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# UI REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use:
- shadcn/ui
- TailwindCSS

Fonts:
- Orla for headings
- Moya for text

Colors:
- Lemon Lime #c8d152
- Lemon Chiffon #f9f7be
- Olive Leaf #4d4c20
- Cream #fff3e3
- Crimson Violet #700145

Admin dashboard UI text MUST be French.

Storefront supports:
- English
- French
- Arabic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Separate:
- admin APIs
- storefront APIs

Storefront APIs expose ONLY:
- products
- categories
- cart
- checkout
- orders
- media
- shipment tracking
- customer operations

Admin APIs remain protected.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SHIPPING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Architecture must support:
- Yalidine
- DHL
- FedEx
- UPS
- future providers

Use:
- provider adapters
- abstraction layer
- queue jobs
- retry mechanisms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# EXTENSIBILITY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The platform must be easily extendable for:
- marketplace support
- suppliers
- warehouses
- loyalty systems
- promotions
- ERP integrations
- accounting integrations
- multi-store
- multi-vendor
- B2B

Example:
Adding fields like:
- brand_id
- supplier_id
- manufacturer
- warranty
must NOT require refactoring core architecture.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For EVERY implementation step:

1. Show folder tree
2. Show created files
3. Generate complete code
4. Explain integration
5. Explain execution
6. Explain next step

Always continue implementation progressively.

Do NOT restart architecture explanations repeatedly.

We are BUILDING the actual project incrementally.
