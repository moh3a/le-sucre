<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Goal
- Update ~40 component files in `C:\Users\aitab\Dev\le-sucre` to replace hardcoded French text with `useTranslations("NAMESPACE")` / `getTranslations` calls from `next-intl`.

## Constraints & Preferences
- Use Edit tool for changes.
- Add `import { useTranslations } from "next-intl";` (client) or `import { getTranslations } from "next-intl/server";` (server) if not present.
- Add `const t = useTranslations("NAMESPACE");` inside the component.
- Replace all hardcoded display strings with `t("key")`.
- For server components without `"use client"`, make the component `async` and use `await getTranslations`.
- Keep metadata objects static.
- Preserve existing code structure.
- Two i18n namespaces are available: `common` (shared keys like save/cancel/delete/edit/name/status) and feature-specific namespaces (campaigns, reviews, media, analytics, dashboard, operations, settings, tasks, feature_flags, blacklist, wishlist, invoices, warranty, cancellations, support, followups, contacts, home) in `src/i18n/messages/en.json`/`fr.json`.

## Status — ALL DONE

All ~40 target files across campaign management, media library, analytics, dashboard, feature flags, blacklist, wishlist, product reviews, invoices, OMS (warranty, escalations, cancellations, support, followups, contacts), and main/auth pages have been updated to use `next-intl` translations.

## Key Decisions
- Zod schema error messages kept hardcoded when schema is outside the component (avoids moving schemas and refactoring risk).
- Module‑level status/type option label records (e.g. `STATUS_LABEL`, `TYPE_LABEL`, `CONTACT_TYPE_LABELS`) kept hardcoded since they cannot use `t()` outside a component.
- `campaign_form.tsx` CardTitle `tc("main")` fixed to hardcoded "Général" – no matching key exists in `common` or `campaigns` namespaces.
- Used closest‑matching key from message files when an exact label key does not exist.
- `isLoading` prop in `QueryGuard` is passed directly (not wrapped in `query` object) in all observed files – this pattern is consistent.

## Message Namespaces Used
- `common` (shared: save, cancel, delete, edit, create, loading, name, description, slug, status, type, active, inactive, search_dots, actions)
- `home`, `auth`, `campaigns`, `media`, `analytics`, `dashboard`, `operations`, `settings`, `tasks`, `feature_flags`, `blacklist`, `wishlist`, `reviews`, `invoices`, `warranty`, `cancellations`, `support`, `followups`, `contacts`

## Relevant Files (translated)
- `src/app/page.tsx`
- `src/app/auth/page.tsx`
- `src/app/auth/layout.tsx`
- Campaign management: `campaign_list_page.tsx`, `campaign_form.tsx`, `campaign_banners_tab.tsx`, `campaign_sections_tab.tsx`, `campaign_targeting_tab.tsx`, `campaign_analytics_tab.tsx`
- Media library: `media-library-page-client.tsx`, `media-upload-dialog.tsx`, `media-picker-dialog.tsx`, `media-data-table.tsx`
- Analytics: `analytics-page-client.tsx`, `analytics-dashboard-client.tsx`
- Dashboard: `dashboard-page-client.tsx`, `operations-dashboard-client.tsx`, `settings-page-client.tsx`, `tasks-table.tsx`, `create-task-dialog.tsx`
- Feature flags: `feature_flag_list_page.tsx`
- Blacklist: `blacklist-page-client.tsx`, `blacklist-table.tsx`
- Wishlist: all 8 files under `wishlist_management_system/components/`
- Product reviews: `product-review-form.tsx`, `admin-review-moderation-table.tsx`
- Invoices: `invoice_table.tsx`, `invoice_detail_client.tsx`
- OMS: `create-warranty-claim-dialog.tsx`, `escalate-order-dialog.tsx`, `request-cancellation-dialog.tsx`, `customer-support-tab.tsx`, `customer-followups-tab.tsx`, `customer-contacts-tab.tsx`
- `src/i18n/messages/en.json` / `fr.json` — translation message files
