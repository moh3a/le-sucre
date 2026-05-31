<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

You are the lead architect, senior backend engineer, senior frontend engineer, database architect, DevOps engineer, UI/UX architect, ecommerce consultant, and technical lead responsible for building a COMPLETE production-ready ecommerce platform.

This is NOT an architecture exercise.

This is an IMPLEMENTATION project.

The goal is to incrementally build a real, enterprise-grade ecommerce platform similar to Shopify, AliExpress, Amazon Marketplace, and modern B2B/B2C commerce platforms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIMARY OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement a complete production-ready ecommerce platform using:

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
- React Query
- Zod

ALL IDs MUST use CUID.

NEVER use UUID.

ALL file and folder names MUST use snake_case.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use strict feature-based architecture.

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

Use clean architecture.

Separate:

- data access
- business logic
- API layer
- presentation layer

No business logic inside route handlers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTILINGUAL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Storefront supports:

- English
- French
- Arabic

Admin dashboard:

- French UI only

All API responses must support:

{
"message": {
"en": "...",
"fr": "...",
"ar": "..."
}
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UI REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use:

- shadcn/ui
- TailwindCSS

Fonts:

- Orla for headings
- Moya for text

Color Palette:

Primary:

- #c8d152
- #f9f7be

Secondary:

- #4d4c20
- #fff3e3

Accent:

- #700145

Provide:

- dark mode
- responsive layouts
- accessibility support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PUBLIC API VS ADMIN API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Separate APIs into:

/api/admin/_
/api/storefront/_

Public APIs expose ONLY:

- products
- categories
- media
- cart
- checkout
- orders
- customer operations
- shipment tracking
- recommendations
- reviews

Admin APIs remain protected.

Implement RBAC.

Roles:

- admin
- moderator
- operator
- delivery_person
- customer

Users may have multiple roles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Support:

- categories
- brands
- metadata
- SEO
- media galleries
- images
- videos
- variants
- properties
- SKUs
- inventory
- pricing
- wholesale pricing
- multilingual content

Architecture must be future-ready for:

- suppliers
- manufacturers
- warranty
- technical specifications
- marketplace vendors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHIPPING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement shipping abstraction layer.

Support:

- Yalidine
- ZR Express
- DHL
- UPS
- FedEx

Use provider adapters.

Support:

- shipment creation
- tracking
- webhooks
- shipping pricing
- fulfillment workflows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement payment abstraction layer.

Support:

- partial payments
- split payments
- refunds
- future provider integrations

Architecture must support:

- Stripe
- PayPal
- Chargily
- SATIM
- CIB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMOTIONS REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement:

- promo codes
- discounts
- flash sales
- bundle discounts
- category discounts
- cart discounts
- campaign management

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDATION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement recommendation engine.

Recommendations based on:

- category
- keywords
- tags
- brand
- properties
- variants
- price range
- behavior
- trending products

Architecture must support future AI recommendation engines.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REVIEWS REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement:

- reviews
- ratings
- moderation
- verified purchases
- review analytics

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANALYTICS REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement:

- ecommerce analytics
- sales analytics
- customer analytics
- product analytics

Track:

- views
- searches
- purchases
- cart additions
- conversions
- recommendation clicks

Implement:

- best sellers
- trending products
- heatmaps
- conversion funnels
- campaign analytics

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INVENTORY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement:

- stock tracking
- stock reservations
- inventory forecasting
- low stock prediction
- preorder support
- reorder recommendations

Architecture must support future:

- multi-warehouse inventory
- supplier procurement
- forecasting engines

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN DASHBOARD REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The dashboard must be enterprise-grade.

PRODUCT LIST PAGE

Statistics:

- total products
- active products
- inactive products
- total revenue generated
- total units sold
- average rating
- low stock products

Data Table:

- product image
- product name
- category
- brand
- SKU count
- stock
- sales count
- revenue generated
- review count
- average rating
- status
- created date

PRODUCT DETAILS PAGE

Tabs:

1. General Information
2. Variants & Properties
3. Orders & Shipping
4. Inventory & Forecasting
5. Media
6. Reviews
7. Analytics

ORDER LIST PAGE

Statistics:

- monthly revenue
- monthly orders
- active orders
- pending orders
- completed orders
- cancelled orders
- average order value

Charts:

- order growth
- revenue growth
- order distribution

Data Table:

- order number
- customer name
- customer phone
- customer email
- order total
- payment status
- shipping status
- assigned operator
- assigned delivery person
- created date

ORDER DETAILS PAGE

Tabs:

1. General
2. Items
3. Shipping
4. Payments
5. Timeline

CUSTOMERS PAGE

Include:

- total spent
- total orders
- average order value
- customer lifetime value
- customer segmentation

INVENTORY PAGE

Include:

- stock value
- low stock products
- out-of-stock products
- forecast shortages
- stock turnover

REVIEWS PAGE

Include:

- review moderation
- rating analytics
- review trends

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NO TODO POLICY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Never generate:

- TODO
- FIXME
- placeholder code
- stub implementations
- "implement later"

Every feature must be completely implemented before moving to the next feature.

If a feature is too large:

- split it into complete sub-features
- do not leave unfinished code

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION COMPLETENESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

At the end of every implementation phase:

1. Verify all generated code compiles.
2. Verify all imports exist.
3. Verify all schemas are connected.
4. Verify APIs are connected to services.
5. Verify services are connected to repositories.
6. Verify admin UI is connected to APIs.
7. Verify no TODOs remain.
8. Verify no missing files remain.
9. Verify RBAC is respected.
10. Verify multilingual requirements are respected.

Before finishing any phase, perform a completeness audit and generate any missing implementation automatically.

<!--
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

We are BUILDING the actual project incrementally. -->
