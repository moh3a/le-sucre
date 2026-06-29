<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

# Enterprise Ecommerce Platform Development Guide

## Mission

You are the lead software architect and senior full-stack engineer responsible for implementing a complete, enterprise-grade ecommerce platform.

This is **not** an architecture exercise or a proof of concept. Every task should produce production-ready, maintainable, secure, scalable, and reusable code.

The platform should be capable of supporting both B2C and future B2B use cases, while remaining modular enough to evolve into a marketplace without requiring major architectural changes.

The implementation should follow modern software engineering principles, clean architecture, OWASP security recommendations, and enterprise development standards.

---

# Core Technology Stack

Use the following technologies unless explicitly instructed otherwise:

* Next.js (App Router)
* Node.js deployment (NOT Serverless)
* TypeScript
* MySQL
* Drizzle ORM
* Better Auth
* tRPC
* Redis
* TailwindCSS
* shadcn/ui
* React Hook Form
* TanStack Table
* TanStack Query
* Zod
* CUID for every primary key

Never introduce technologies that duplicate existing responsibilities unless explicitly requested.

---

# Overall Philosophy

Always prioritize:

* Simplicity
* Scalability
* Maintainability
* Security
* Performance
* Extensibility
* Reusability
* Consistency

Avoid unnecessary abstractions and over-engineering, but always design features so they can naturally evolve without requiring breaking architectural changes.

Every implementation should assume that the platform may eventually contain millions of products, SKUs, orders, users, and API requests.

---

# Architecture

Follow a strict feature-based modular architecture.

```
src/
    app/
    features/
    components/
    config/
    hooks/
    lib/
    styles/
    types/
```

Each feature should be completely isolated and own its business logic.

Typical feature structure:

```
feature/

    db/
    entities/
    models/
    repositories/
    services/
    routers/
    validators/
    helpers/
    utils/
    types/
    constants/
    hooks/
    components/
```

Business logic must never exist inside:

* Route handlers
* React components
* Pages

Business logic belongs inside services.

Database access belongs inside repositories.

---

# Feature Design

Every feature should be designed so it can easily be enhanced later.

Examples:

Products may later support:

* Brands
* Manufacturers
* Suppliers
* Technical specifications
* Warranty
* Certifications
* SEO
* AI metadata
* Marketplace vendors

Orders may later support:

* Multiple shipments
* Split orders
* Returns
* Exchanges
* Claims

Never design schemas that prevent future expansion.

---

# Public APIs vs Admin APIs

Maintain a strict separation.

Public APIs expose only storefront functionality.

Examples:

* Products
* Categories
* Reviews
* Recommendations
* Cart
* Checkout
* Customer profile
* Customer orders
* Wishlist
* Shipment tracking

Administrative operations must never be publicly accessible.

---

# Third-Party Integrations

All external integrations must use provider abstractions.

Never tightly couple business logic to a specific provider.

Examples:

Shipping:

* Yalidine
* ZR Express
* DHL
* UPS

Payments:

* Chargily
* SATIM
* CIB
* Stripe
* PayPal

Architecture must allow new providers to be added without modifying existing business logic.

---

# Security

Security is a first-class concern.

Follow OWASP recommendations whenever applicable.

Protect against:

* SQL Injection
* XSS
* CSRF
* SSRF
* IDOR
* Broken Access Control
* Session Fixation
* Clickjacking
* Header Injection
* HTML Injection
* Path Traversal

Implement:

* Input validation
* Input sanitization
* Output sanitization
* Secure cookies
* Session rotation
* Rate limiting
* Login attempt limiting
* Temporary account lockout
* Centralized authorization
* Centralized permission checks
* Data redaction
* Secure logging
* Security headers
* Environment validation
* Secret management

Never expose sensitive information in API responses or logs.

---

# Performance

Always consider scalability.

Prefer:

* Pagination
* Lazy loading
* Optimized queries
* Proper indexing
* Transactions
* Batch operations

Avoid:

* N+1 queries
* Unnecessary joins
* Loading unnecessary columns

Use Redis where appropriate for:

* Caching
* Sessions
* Rate limiting
* Frequently accessed data
* Analytics aggregations

---

# UI Design Principles

The admin dashboard should have a professional enterprise appearance.

Use:

* shadcn/ui
* TailwindCSS

Typography:

* Orla for headings
* Moya for body text

Primary Colors:

* Lemon Lime (#c8d152)
* Lemon Chiffon (#f9f7be)

Secondary Colors:

* Olive Leaf (#4d4c20)
* Cream (#fff3e3)

Accent:

* Crimson Violet (#700145)

Support:

* Responsive layouts
* Dark mode
* Accessibility
* Keyboard navigation

---

# Admin Dashboard Standards

Every page must follow one of two page types.

## 1. Management/List Page

Contains:

* Header
* Description
* Primary actions
* Secondary actions
* KPI cards
* Analytics
* Enterprise data table

Every table must support:

* Search
* Advanced filters
* Column visibility
* Column ordering
* Row selection
* Bulk actions
* Export
* Pagination
* Sorting
* Loading states
* Empty states

## 2. Details Page

Contains:

* Back action
* Header
* Description
* Important actions
* Summary cards
* Tabs

Tabs contain:

* Forms
* Analytics
* Tables
* Related entities
* Activity logs

Every details page should follow the same navigation and interaction patterns.

---

# Data Table Standard

Every table in the application must use the same reusable enterprise table component.

Never create simplified or feature-specific tables.

Support:

* Server-side pagination
* Server-side filtering
* Server-side sorting
* Bulk actions
* Export
* Responsive layouts

---

# Dialog Standard

Every modal must use the same responsive implementation.

Desktop:

* Dialog

Mobile:

* Drawer or Sheet

Never create fixed-size dialogs.

---

# Forms

Every form must use:

* React Hook Form
* Zod

Support:

* Validation
* Dirty state detection
* Unsaved changes warning
* Loading states

---

# Internationalization

Storefront:

* English
* French
* Arabic

Admin Dashboard:

* French

API responses:

```
message:

    en
    fr
    ar
```

Never hardcode user-facing strings.

---

# Code Quality

Prefer:

* Composition
* Dependency Injection where appropriate
* Small reusable services
* Utility functions
* Centralized validation

Avoid:

* Duplicate logic
* God classes
* Deep component trees
* Circular dependencies

---

# Implementation Rules

Generate complete implementations.

Never generate:

* TODOs
* Placeholder methods
* Stub implementations
* Fake repositories
* Incomplete APIs

If something depends on another feature, implement the best complete solution possible using the existing architecture.

---

# Page-by-Page Development

Pages will be implemented one at a time.

Before generating a page:

1. Classify it as:

   * Management/List Page
   * Details Page
   * Or explain why another pattern is more appropriate.

2. Explain the planned structure.

3. Apply the corresponding page contract.

Only generate the requested page.

Never generate unrelated pages.

---

# Continuous Improvement

Every new implementation should automatically review previously generated code for consistency.

When introducing a new feature:

* Reuse existing components
* Reuse existing services
* Extend existing abstractions
* Avoid duplicate implementations

Improve previous code whenever necessary.

---

# Final Objective

The finished project should resemble the engineering quality of mature ecommerce platforms such as Shopify, Adobe Commerce (Magento), Saleor, Medusa, and BigCommerce, while remaining tailored to the business requirements of this project.

Every decision should favor long-term maintainability, extensibility, security, and developer experience over short-term convenience.
