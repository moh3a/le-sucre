# ADMIN DASHBOARD PAGE DESIGN CONTRACT

This contract applies to ALL admin dashboard features and pages.

Every feature must follow one of the approved page patterns below.

No exceptions unless explicitly justified.

---

# PAGE TYPE 1 — MANAGEMENT / LIST PAGE

Purpose:
Manage a collection of entities.

Examples:

* Products
* Orders
* Customers
* Categories
* Brands
* Reviews
* Shipments
* Campaigns
* Promotions
* Warehouses
* Suppliers
* Users
* Roles

---

## Page Structure

### Header

Top section must contain:

Left:

* Page title
* Page description

Right:

Primary actions:

Examples:

* Create Product
* Create Category
* Create Campaign
* Create Warehouse

Secondary actions:

* Export
* Import
* Bulk Upload
* Generate Report

---

## Overview Analytics Section

Directly below header.

Contains relevant KPIs for the feature.

Examples for Products:

* Total Products
* Active Products
* Revenue Generated
* Units Sold
* Average Rating
* Low Stock Products

Examples for Orders:

* Monthly Revenue
* Monthly Orders
* Pending Orders
* Active Orders
* Average Order Value

Examples for Customers:

* Total Customers
* Active Customers
* Revenue Generated
* Repeat Customers

Use responsive KPI cards.

---

## Analytics Section

Below KPI cards.

Contains feature-specific charts.

Examples:

Products:

* Revenue Trend
* Product Growth
* Product Performance

Orders:

* Revenue Growth
* Orders Growth
* Order Status Distribution

Customers:

* Customer Growth
* Customer Retention
* Customer Segments

Charts must be responsive.

---

## Data Table Section

Below analytics.

Every list page MUST use a full-featured enterprise data table.

Requirements:

### Toolbar

Contains:

* Search
* Filters
* Saved Views
* Export
* Refresh

### Advanced Filters

Examples:

* Status
* Date Range
* Category
* Brand
* Assigned User

Support compound filtering.

### Column Visibility

User can:

* hide columns
* show columns
* reorder columns

### Row Selection

Support:

* single select
* multi select

### Bulk Actions

Examples:

* Delete
* Export
* Activate
* Deactivate
* Assign

### Pagination

Support:

* page size selection
* next page
* previous page
* total count

### Sorting

Support:

* single column sorting
* multi-column sorting

### Table Features

Support:

* loading states
* empty states
* skeletons
* responsive layouts

---

## Dialog Rules

Any create/edit operation must use:

Responsive Dialog

Desktop:

* centered modal

Mobile:

* drawer/sheet

Never use fixed-width dialogs.

Use responsive patterns only.

---

# PAGE TYPE 2 — DETAILS PAGE

Purpose:
Manage a single entity.

Examples:

* Product Details
* Order Details
* Customer Details
* Campaign Details
* Shipment Details

---

## Header

Left:

* Back Action
* Title
* Description

Right:

Primary Actions

Examples:

* Edit
* Publish
* Approve
* Assign

Danger Actions

Examples:

* Delete
* Archive
* Cancel

Utility Actions

Examples:

* Export
* Duplicate
* Print
* Share

---

## Summary Section

Optional.

Show important entity metrics.

Example Product:

* Revenue
* Units Sold
* Rating
* Stock

Example Order:

* Total
* Status
* Shipment Status

---

## Tabs Section

Below header.

Every detail page must use tabs.

Tabs depend on feature.

---

### Product Tabs

* General Information
* Variants & Properties
* Orders & Shipping
* Inventory & Forecasting
* Media
* Reviews
* Analytics

---

### Order Tabs

* General
* Products
* Shipping
* Payments
* Timeline

---

### Customer Tabs

* Profile
* Orders
* Reviews
* Addresses
* Wishlist
* Analytics

---

### Shipment Tabs

* General
* Tracking
* Delivery Attempts
* History

---

### Campaign Tabs

* General
* Targeting
* Products
* Analytics
* Timeline

---

## Tab Content Rules

Each tab can contain:

* Forms
* Charts
* Tables
* Activity Logs
* Related Entities

If a tab contains a table:

Use the SAME enterprise data table component.

Never create simplified tables.

---

# GLOBAL TABLE STANDARD

ALL tables across the system must use the same reusable component.

Feature Requirements:

* TanStack Table
* Server-side pagination
* Server-side filtering
* Server-side sorting
* Column visibility
* Column ordering
* Bulk actions
* Row selection
* Export
* Responsive support

No custom one-off tables.

---

# GLOBAL FORM STANDARD

ALL forms must use:

* React Hook Form
* Zod Validation

Support:

* autosave when appropriate
* dirty state detection
* unsaved changes warning

---

# GLOBAL DIALOG STANDARD

Desktop:

* Dialog

Mobile:

* Drawer / Sheet

Single reusable implementation.

---

# GLOBAL ACTION MENU STANDARD

Each row should have:

Actions Menu

Examples:

* View
* Edit
* Duplicate
* Export
* Archive
* Delete

Consistent across all features.

---

# RESPONSIVE REQUIREMENTS

All pages must work on:

* Mobile
* Tablet
* Laptop
* Desktop

No desktop-only layouts.

---

# IMPLEMENTATION RULE

Before implementing any page:

1. Determine page type.
2. Apply corresponding template.
3. Generate all sections.
4. Generate analytics.
5. Generate actions.
6. Generate enterprise data table.
7. Generate responsive dialogs.
8. Generate tabs if details page.
9. Verify consistency with Products List and Product Details patterns.

No page may deviate from this contract.

# PAGE-BY-PAGE IMPLEMENTATION RULE

When implementing admin dashboard pages, do NOT generate multiple pages at once unless explicitly requested.

We will work page by page.

For each page I provide:

1. First analyze the page.

2. Classify it as one of the following:

   * Management/List Page
   * Details Page
   * If neither applies, explain why and propose the most appropriate page pattern.

3. Before generating any code, explain:

   * Page classification
   * Purpose of the page
   * Required actions
   * Required analytics
   * Required tables
   * Required tabs (if applicable)

4. Then strictly apply the Admin Dashboard Page Design Contract.

5. Generate the complete implementation for that page only.

Do not generate other pages unless explicitly requested.

---

## Management/List Page Requirements

Must contain:

### Header

* Title
* Description
* Primary actions
* Secondary actions

### Overview Analytics

Relevant KPI cards.

### Analytics Section

Relevant charts and insights.

### Data Table Section

Every table MUST use the platform's reusable enterprise data table component and include:

* Search
* Advanced filters
* Column visibility
* Column ordering
* Row selection
* Bulk actions
* Pagination
* Sorting
* Export
* Loading states
* Empty states

### Dialogs

All create/edit dialogs must use the platform's responsive dialog system:

Desktop:

* Dialog

Mobile:

* Drawer/Sheet

---

## Details Page Requirements

Must contain:

### Header

* Back action
* Title
* Description
* Primary actions
* Secondary actions
* Danger actions when applicable

### Summary Section

Relevant statistics and overview cards.

### Tab Navigation

The page must be organized into tabs.

Each tab should represent a major management area of the entity.

Examples:

Product:

* General
* Variants
* Inventory
* Media
* Reviews
* Analytics

Order:

* General
* Items
* Shipping
* Payments
* Timeline

Customer:

* Profile
* Orders
* Reviews
* Wishlist
* Analytics

### Tab Content

Tabs may contain:

* Forms
* Analytics
* Tables
* Activity logs
* Related entities

If a tab contains a table, it MUST use the same enterprise data table component.

---

## Consistency Requirement

Every new page must follow the same structure and UX patterns already established by:

* Products List
* Product Details

These pages are the reference standard for all future pages.

No feature may introduce a different table implementation, dialog implementation, action layout, page layout, or navigation pattern unless explicitly approved.

Before generating the page implementation, always classify the page and explain the structure that will be used.
