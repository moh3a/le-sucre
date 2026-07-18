# ORLA — Design System

> Design tokens, brand identity, component library, and pattern catalog for the ORLA ecommerce platform.
> shadcn/ui radix-maia preset · Hand-written CSS · Standalone HTML deliverables.

## Brand

**ORLA** — Algerian shop selling pastry/sweets making tools, cooking ingredients, and boxes/packaging.

Palette inspired by pastry craft: warm creams, fresh citrus greens, deep olive, and a luxurious crimson-violet accent.

## Languages

- Storefront: English, French, Arabic (RTL)
- Admin Dashboard: French

---

## Deliverables

All files share a single `tokens.css` as the source of truth. No Tailwind CSS — all CSS is hand-written custom properties.

| File | Purpose | Sections |
|---|---|---|
| `tokens.css` | Shared CSS custom properties — single source of truth for all themes | `:root` + `.dark` theme variables, base reset, keyframes, `prefers-reduced-motion`, `.sr-only` |
| `design-tokens.html` | Visual token reference | 12 sections: Color Palette, Sidebar Tokens, Chart Colors, Brand Tokens, Typography Scale, Spacing Scale, Border Radius, Shadow Elevation, Duration Scale, Easing Curves, Z-Index Stacking, Breakpoints |
| `brand-guide.html` | Brand style guide | 9 sections: Brand Identity, Color Palette, Typography System, Posture Rules, Motion Principles, Spacing Philosophy, RTL Considerations, Elevation Hierarchy, Focus States |
| `components.html` | Component library | 31 sections: Animation & Transitions, Focus States, Overlay Patterns, Buttons, Badges, Avatar & Separator, Progress & Skeleton, Form Controls, Form Validation States, Datetime Picker, Variant Selector, Color Picker, Color Swatch Selector, Cards, Accordion, Stats Cards, Tabs, Breadcrumb, Stepper, Alerts, Toast Notifications, Empty State, Error State, Loading State, Success State, Tooltip/Popover/Dropdown, Dialog, Alert Dialog, Responsive Dialog/Drawer, Charts, Carousel |
| `patterns.html` | Pattern library | 21 sections: Data Table (admin), Action Bar (admin), Top Navigation, Bottom Navigation, Side Navigation, Login Flows, Form Layouts, Product Card, Product Search, Product Details, My Orders (storefront), Order Details, Checkout, Cart, Wishlist, Saved Products, Campaigns & Promotions, Recently Viewed, Compare Products, Categories, Category Products |

---

## Color System

All colors defined as OKLCH in CSS custom properties. Two themes: light (default) and dark.

### Light Theme

| Token | OKLCH | Hex | Role |
|---|---|---|---|
| `--background` | `oklch(0.985 0.008 80)` | `#faf6ed` | Page background — warm cream |
| `--foreground` | `oklch(0.22 0.025 80)` | `#3a3520` | Primary text — dark olive |
| `--card` | `oklch(1 0 0)` | `#ffffff` | Card/surface background |
| `--card-foreground` | `oklch(0.22 0.025 80)` | `#3a3520` | Card text |
| `--popover` | `oklch(1 0 0)` | `#ffffff` | Popover background |
| `--popover-foreground` | `oklch(0.22 0.025 80)` | `#3a3520` | Popover text |
| `--primary` | `oklch(0.852 0.199 91.936)` | `#c8d152` | Lemon Lime — primary actions |
| `--primary-foreground` | `oklch(0.20 0.03 80)` | `#3a3520` | Text on primary |
| `--secondary` | `oklch(0.97 0.035 95)` | `#f9f7be` | Lemon Chiffon — secondary surfaces |
| `--secondary-foreground` | `oklch(0.30 0.04 85)` | `#4d4c20` | Text on secondary |
| `--muted` | `oklch(0.955 0.012 85)` | `#f0edd6` | Muted background |
| `--muted-foreground` | `oklch(0.50 0.025 80)` | `#8a8460` | Muted text |
| `--accent` | `oklch(0.35 0.20 350)` | `#700145` | Crimson Violet — accent/CTA |
| `--accent-foreground` | `oklch(0.97 0.01 350)` | `#fce8f3` | Text on accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `#dc2626` | Error/danger |
| `--destructive-foreground` | `oklch(0.985 0 0)` | `#fafafa` | Text on destructive |
| `--success` | `oklch(0.65 0.17 145)` | `#2d9a3e` | Success state |
| `--success-foreground` | `oklch(0.18 0.04 145)` | `#1a3a1a` | Text on success — dark olive |
| `--warning` | `oklch(0.82 0.16 80)` | `#c8a520` | Warning state |
| `--warning-foreground` | `oklch(0.25 0.04 80)` | `#3a3520` | Text on warning |
| `--info` | `oklch(0.60 0.12 240)` | `#3b82f6` | Info state |
| `--info-foreground` | `oklch(0.15 0.03 240)` | `#1a2a40` | Text on info — dark navy |
| `--border` | `oklch(0.90 0.015 85)` | `#e2deca` | Default border |
| `--input` | `oklch(0.90 0.015 85)` | `#e2deca` | Input border |
| `--ring` | `oklch(0.852 0.199 91.936)` | `#c8d152` | Focus ring — matches primary |

### Dark Theme

| Token | OKLCH | Hex | Role |
|---|---|---|---|
| `--background` | `oklch(0.18 0.015 80)` | `#2a2517` | Page background — deep olive |
| `--foreground` | `oklch(0.955 0.012 85)` | `#f0edd6` | Primary text — warm cream |
| `--card` | `oklch(0.22 0.02 80)` | `#33301d` | Card background |
| `--card-foreground` | `oklch(0.955 0.012 85)` | `#f0edd6` | Card text |
| `--popover` | `oklch(0.22 0.02 80)` | `#33301d` | Popover background |
| `--popover-foreground` | `oklch(0.955 0.012 85)` | `#f0edd6` | Popover text |
| `--primary` | `oklch(0.87 0.19 92)` | `#d4dc60` | Lemon Lime — slightly brighter for dark bg |
| `--primary-foreground` | `oklch(0.20 0.03 80)` | `#2a2517` | Text on primary |
| `--secondary` | `oklch(0.28 0.025 85)` | `#464328` | Olive — dark secondary surface |
| `--secondary-foreground` | `oklch(0.92 0.02 90)` | `#e8e4c8` | Text on secondary |
| `--muted` | `oklch(0.26 0.02 80)` | `#3d3a24` | Muted background |
| `--muted-foreground` | `oklch(0.65 0.02 85)` | `#a8a37a` | Muted text |
| `--accent` | `oklch(0.42 0.19 350)` | `#9a0460` | Crimson Violet — brighter for dark bg |
| `--accent-foreground` | `oklch(0.97 0.01 350)` | `#fce8f3` | Text on accent |
| `--destructive` | `oklch(0.65 0.22 25)` | `#ef4444` | Error/danger |
| `--destructive-foreground` | `oklch(0.15 0 0)` | `#1a1a1a` | Text on destructive |
| `--success` | `oklch(0.72 0.17 145)` | `#34c759` | Success state |
| `--success-foreground` | `oklch(0.15 0 0)` | `#1a1a1a` | Text on success |
| `--warning` | `oklch(0.85 0.16 80)` | `#d4b030` | Warning state |
| `--warning-foreground` | `oklch(0.20 0.03 80)` | `#2a2517` | Text on warning |
| `--info` | `oklch(0.65 0.12 240)` | `#60a5fa` | Info state |
| `--info-foreground` | `oklch(0.15 0 0)` | `#1a1a1a` | Text on info |
| `--border` | `oklch(1 0 0 / 12%)` | `rgba(255,255,255,0.12)` | Semi-transparent border |
| `--input` | `oklch(1 0 0 / 15%)` | `rgba(255,255,255,0.15)` | Input border |
| `--ring` | `oklch(0.87 0.19 92)` | `#d4dc60` | Focus ring |

### Sidebar Tokens

| Token (Light) | Value | Token (Dark) | Value |
|---|---|---|---|
| `--sidebar` | `oklch(0.975 0.008 85)` | `--sidebar` | `oklch(0.20 0.02 80)` |
| `--sidebar-foreground` | `oklch(0.22 0.025 80)` | `--sidebar-foreground` | `oklch(0.955 0.012 85)` |
| `--sidebar-primary` | `oklch(0.852 0.199 91.936)` | `--sidebar-primary` | `oklch(0.87 0.19 92)` |
| `--sidebar-primary-foreground` | `oklch(0.25 0.045 80)` | `--sidebar-primary-foreground` | `oklch(0.20 0.03 80)` |
| `--sidebar-accent` | `oklch(0.955 0.012 85)` | `--sidebar-accent` | `oklch(0.26 0.02 80)` |
| `--sidebar-accent-foreground` | `oklch(0.22 0.025 80)` | `--sidebar-accent-foreground` | `oklch(0.955 0.012 85)` |
| `--sidebar-border` | `oklch(0.90 0.015 85)` | `--sidebar-border` | `oklch(1 0 0 / 10%)` |
| `--sidebar-ring` | `oklch(0.852 0.199 91.936)` | `--sidebar-ring` | `oklch(0.87 0.19 92)` |

### Chart Colors

Sequential Lemon Lime → Olive scale for data visualization:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--chart-1` | `oklch(0.90 0.18 98)` | same | Lightest — positive trends |
| `--chart-2` | `oklch(0.80 0.18 86)` | same | Lemon Lime mid |
| `--chart-3` | `oklch(0.68 0.16 76)` | same | Olive Lime |
| `--chart-4` | `oklch(0.55 0.14 66)` | same | Olive mid |
| `--chart-5` | `oklch(0.48 0.11 62)` | same | Deep Olive |

### Custom Brand Tokens

Additional brand-specific tokens beyond the shadcn set:

```css
--crimson-violet: #700145;
--cream: #fff3e3;
--chiffon: #f9f7be;
--olive: #4d4c20;
--lemon-lime: #c8d152;
```

Use `--crimson-violet` and `--cream`/`--chiffon`/`--olive`/`--lemon-lime` for brand-specific elements that need to reference the exact brand hex outside of the semantic token system.

---

## Typography

### Font Stacks

| Role | Font | Stack |
|---|---|---|
| **Display / Headings** | Orla Serif | `"Orla Serif", Georgia, "Times New Roman", Times, serif` |
| **Body / UI** | Montserrat | `"Montserrat", "Helvetica Neue", Helvetica, Arial, sans-serif` |
| **Monospace** | Geist Mono | `"Geist Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` |

### Type Scale (Major Third — 1.25x)

| Role | Size | Line Height | Letter Spacing | Font |
|---|---|---|---|---|
| Display | `clamp(2.4rem, 4vw, 3.5rem)` (38–56px) | `1.1` | `-0.025em` | Orla Serif 400 |
| H1 | `clamp(1.8rem, 3vw, 2.5rem)` (29–40px) | `1.15` | `-0.02em` | Orla Serif 400 |
| H2 | `clamp(1.44rem, 2.5vw, 2rem)` (23–32px) | `1.2` | `-0.015em` | Orla Serif 400 |
| H3 | `clamp(1.15rem, 2vw, 1.6rem)` (18–26px) | `1.25` | `-0.01em` | Orla Serif 400 |
| H4 | `1.25rem` (20px) | `1.3` | `0` | Montserrat 600 |
| H5 | `1.125rem` (18px) | `1.4` | `0` | Montserrat 600 |
| H6 | `1rem` (16px) | `1.4` | `0` | Montserrat 600 |
| Body Large | `1.125rem` (18px) | `1.6` | `0` | Montserrat 400 |
| Body | `1rem` (16px) | `1.6` | `0` | Montserrat 400 |
| Body Small | `0.875rem` (14px) | `1.5` | `0.01em` | Montserrat 400 |
| Caption | `0.75rem` (12px) | `1.5` | `0.02em` | Montserrat 500 |
| Overline | `0.6875rem` (11px) | `1.5` | `0.08em` | Montserrat 600 uppercase |

### Weight System

| Weight | Name | Use |
|---|---|---|
| 400 | Regular | Body copy, default text |
| 500 | Medium | UI labels, captions, secondary text |
| 600 | Semi-bold | Buttons, navigation, emphasis, H4–H6 |

Avoid weight 700+ — the type scale and color hierarchy provide sufficient emphasis.

### RTL Considerations

- Arabic text uses the same Montserrat body stack; fallback to system Arabic fonts
- `dir="rtl"` applied at `<html>` or container level
- `@radix-ui/react-direction` handles component-level RTL
- All spacing/border-direction utilities mirror automatically via Tailwind RTL support

---

## Spacing Scale

Base unit: `4px`. Multiplicative factor: 1.25x (Tailwind default).

| Token | px | rem | Use |
|---|---|---|---|
| `0` | 0 | 0 | Reset |
| `px` | 1 | 0.0625 | Hairline borders |
| `0.5` | 2 | 0.125 | Tight internal gaps |
| `1` | 4 | 0.25 | Minimum spacing |
| `1.5` | 6 | 0.375 | Compact gaps |
| `2` | 8 | 0.5 | Small gaps |
| `3` | 12 | 0.75 | Default internal padding |
| `4` | 16 | 1 | Standard spacing |
| `5` | 20 | 1.25 | Medium spacing |
| `6` | 24 | 1.5 | Section padding |
| `8` | 32 | 2 | Large section gaps |
| `10` | 40 | 2.5 | Section separation |
| `12` | 48 | 3 | Page-level spacing |
| `16` | 64 | 4 | Hero sections |
| `20` | 80 | 5 | Large hero spacing |

---

## Border Radius

Base radius: `0.625rem` (10px). Derived scale:

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `6.25px` | Small elements (badges, chips) |
| `--radius-md` | `8px` | Standard elements (inputs, select controls, thumbnails) |
| `--radius-lg` | `10px` | Cards, dialogs |
| `--radius-xl` | `14px` | Featured cards, modals |
| `--radius-2xl` | `18px` | Large cards, hero sections |
| `--radius-3xl` | `15px` | Medium containers |
| `--radius-4xl` | `16.25px` | Dialogs, tab triggers |
| `--radius-full` | `9999px` | Pills, circular elements, buttons (Maia preset) |

### Maia Radius Rules

The radix-maia preset applies specific radii per component type:

| Element | Radius | Shape |
|---|---|---|
| Buttons (all variants) | `--radius-full` | Pill shape |
| Inputs / Selects | `--radius-md` | Rounded rectangle |
| Badges | `--radius-full` | Pill shape |
| Tabs | `--radius-4xl` | Rounded pill |
| Dialogs | `--radius-4xl` | Large rounded corners |
| Cards | `--radius-lg` | Subtle rounded corners |
| Dropdowns / Popovers | `--radius-2xl` | Large rounded corners |
| Thumbnails / Avatars | `--radius-md` | Subtle rounded corners |

---

## Shadows

### Light Mode

```css
--shadow-xs: 0 1px 2px oklch(0.22 0.025 80 / 0.05);
--shadow-sm: 0 1px 3px oklch(0.22 0.025 80 / 0.08), 0 1px 2px oklch(0.22 0.025 80 / 0.04);
--shadow-md: 0 4px 6px oklch(0.22 0.025 80 / 0.06), 0 2px 4px oklch(0.22 0.025 80 / 0.04);
--shadow-lg: 0 10px 15px oklch(0.22 0.025 80 / 0.06), 0 4px 6px oklch(0.22 0.025 80 / 0.03);
--shadow-xl: 0 20px 25px oklch(0.22 0.025 80 / 0.08), 0 8px 10px oklch(0.22 0.025 80 / 0.03);
```

### Dark Mode

```css
--shadow-xs: 0 1px 2px oklch(0 0 0 / 0.2);
--shadow-sm: 0 1px 3px oklch(0 0 0 / 0.25), 0 1px 2px oklch(0 0 0 / 0.15);
--shadow-md: 0 4px 6px oklch(0 0 0 / 0.2), 0 2px 4px oklch(0 0 0 / 0.12);
--shadow-lg: 0 10px 15px oklch(0 0 0 / 0.2), 0 4px 6px oklch(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px oklch(0 0 0 / 0.25), 0 8px 10px oklch(0 0 0 / 0.1);
```

---

## Component Tokens

### Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Default | `--primary` | `--primary-foreground` | none | 10% darker primary |
| Secondary | `--secondary` | `--secondary-foreground` | none | 10% darker secondary |
| Outline | `oklch(0.90 0.015 85 / 0.3)` | `--foreground` | `--border` | 50% opacity fill |
| Ghost | transparent | `--foreground` | none | `--muted` fill |
| Accent | `--accent` | `--accent-foreground` | none | 10% darker accent |
| Destructive | `--destructive` | `--destructive-foreground` | none | 90% opacity |
| Link | transparent | `--primary` | none | underline |

### Button Size Scale (Maia Preset)

All buttons use `border-radius: var(--radius-full)` (pill shape).

| Size | Height | Padding X | Font Size | Use |
|---|---|---|---|---|
| `sm` | 32px | 12px | 0.8125rem | Compact UI, secondary actions |
| `md` (default) | 36px | 16px | 0.875rem | Standard buttons |
| `lg` | 40px | 24px | 0.9375rem | Primary CTAs, hero actions |
| `icon` | 36px | 0 (equal width) | — | Icon-only buttons |
| `icon-sm` | 32px | 0 (equal width) | — | Compact icon buttons |

### Inputs

| Property | Value |
|---|---|
| Height | 36px (default), 40px (lg) |
| Padding | 0 12px |
| Border | 1px `--input` |
| Background | `--background` |
| Focus ring | 2px `--ring` with 2px offset |
| Radius | `--radius-md` |
| Font | Montserrat, 0.8125rem |

### Cards

| Property | Value |
|---|---|
| Background | `--card` |
| Text | `--card-foreground` |
| Border | 1px `--border` |
| Radius | `--radius-lg` |
| Shadow | `--shadow-sm` |
| Padding | 24px |

### Badges

All badges use `border-radius: var(--radius-full)` (pill shape).

| Variant | Background | Text | Border |
|---|---|---|---|
| Default | `--primary` | `--primary-foreground` | none |
| Secondary | `--secondary` | `--secondary-foreground` | none |
| Accent | `--accent` | `--accent-foreground` | none |
| Outline | transparent | `--foreground` | `--border` |
| Success | `--success / 0.1` | `--success` | `--success / 0.2` |
| Warning | `--warning / 0.1` | `--warning-foreground` | `--warning / 0.2` |
| Destructive | `--destructive / 0.1` | `--destructive` | `--destructive / 0.2` |

Badge dot variant: `badge-dot::before` adds a 6px colored circle via `currentColor`.

### Variant Selector (Product Details)

| Property | Value |
|---|---|
| Container | Flex, gap 8px, wrap |
| Option height | 32px (padding 6px 16px) |
| Border | 1px `--border` |
| Radius | `--radius-full` (pill) |
| Active state | `--primary` bg, `--primary-foreground` text |
| Hover | Border color shifts to `--foreground` |

---

## Spacing & Layout Patterns

### Page Layout

- Max content width: `1200px` (patterns.html), `1280px` (storefront), `1440px` (admin dashboard)
- Page padding: `16px` mobile, `24px` tablet, `32px` desktop
- Section vertical spacing: `48px`–`64px`

### Grid

- Storefront product grid: 1 col mobile, 2 col tablet, 3–4 col desktop
- Admin dashboard grid: 12-column grid, `16px` gutter
- KPI cards: 1 col mobile, 2 col tablet, 4 col desktop

### Breakpoints

| Name | Min Width | Use |
|---|---|---|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small desktops |
| `xl` | 1280px | Standard desktops |
| `2xl` | 1536px | Large screens |

---

## Elevation Hierarchy

1. **Flat** — background content, inline text
2. **Raised** — cards, panels (`--shadow-sm`)
3. **Overlay** — dropdowns, popovers (`--shadow-md`)
4. **Modal** — dialogs, sheets (`--shadow-lg`)
5. **Toast** — notifications (`--shadow-xl`)

---

## Posture Rules

1. **Warm over clinical** — the Cream/Lemon palette reads warm; never override to cool gray or pure white backgrounds.
2. **Accent restraint** — Crimson Violet (`--accent`) appears at most twice per visible screen: one primary CTA + one supplementary element (badge, link, or highlight).
3. **Heading discipline** — all h1–h3 use Orla Serif; h4–h6 use Montserrat 600. Never mix serif into UI chrome (sidebar labels, button text, table headers).
4. **RTL-first spacing** — all directional padding/margin uses logical properties (`padding-inline`, `margin-block`). No hardcoded `left`/`right` spacing.
5. **Dark mode is not inverted** — dark mode uses deep olive backgrounds, not black. The warmth is preserved.
6. **Data density in dashboard, breathing room in storefront** — admin uses tighter spacing (8–12px gaps), storefront uses generous spacing (16–24px gaps).
7. **Buttons are pills, inputs are rounded** — the Maia preset gives all buttons `--radius-full` (pill shape) while inputs use `--radius-md`. Never flatten buttons to match input radius.

---

## Animation & Transitions

### Duration Scale

| Token | Value | Use |
|---|---|---|
| `duration-75` | `75ms` | Micro-interactions (checkbox, switch) |
| `duration-100` | `100ms` | Focus ring, hover feedback, overlays |
| `duration-150` | `150ms` | Button press, input focus, tab underline |
| `duration-200` | `200ms` | Dropdown open/close, sheet slide |
| `duration-300` | `300ms` | Dialog/modal entrance |
| `duration-500` | `500ms` | Page transitions, skeleton pulse cycle |

### Easing Curves

| Name | Value | Use |
|---|---|---|
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default for most transitions |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Entrance animations (fade-in, slide-in) |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations (fade-out, slide-out) |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Popover/dropdown overshoot |

### Keyframes (tokens.css)

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Animation Classes (tw-animate-css)

All overlay components use these Tailwind animate-in/animate-out patterns:

```css
/* Entrance */
data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95

/* Exit */
data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95

/* Slide-in variants */
data-[side=bottom]:slide-in-from-top-2
data-[side=top]:slide-in-from-bottom-2
data-[side=left]:slide-in-from-right-2
data-[side=right]:slide-in-from-left-2
```

### Skeleton Pulse

Skeleton uses `animate-pulse` with a background color shift:

```css
bg-muted animate-pulse rounded-xl
```

Duration: `2s` cycle (Tailwind default). Use for loading states on cards, tables, and data.

---

## Focus States

### Standard Focus Ring

All interactive elements follow this pattern:

```css
focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50
```

- `--ring` matches `--primary` (Lemon Lime) in both themes
- 3px ring with 50% opacity — visible on light and dark backgrounds
- `focus-visible` only (not on click/mouse — keyboard-only visibility)

### Invalid/Error Focus

Form elements with `aria-invalid`:

```css
aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20
dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40
```

### Focus Within (Parent Components)

For compound components (field groups, input groups):

```css
group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50
peer-disabled:cursor-not-allowed peer-disabled:opacity-50
```

---

## Overlay Patterns

### Backdrop

All overlay components (dialog, sheet, dropdown, popover) share:

```css
bg-black/80 supports-backdrop-filter:backdrop-blur-xs
```

- `bg-black/80` — dark scrim at 80% opacity
- `backdrop-blur-xs` — subtle blur behind scrim
- `supports-backdrop-filter` — only apply blur if supported

### Content Panels

Popover/dropdown content uses glassmorphism:

```css
bg-popover/70 before:backdrop-blur-2xl before:backdrop-saturate-150
ring-1 ring-foreground/5
```

- Semi-transparent background with blur layer
- Subtle ring border at 5% foreground opacity
- `rounded-2xl` for dropdowns/popovers, `rounded-4xl` for dialogs

### Stacking Order

| Level | z-index | Use |
|---|---|---|
| Content | `z-0` | Default page content |
| Sticky | `z-10` | Sticky headers, floating labels |
| Dropdown | `z-50` | Dropdowns, popovers, tooltips |
| Overlay | `z-50` | Dialogs, sheets, drawers |
| Toast | `z-[100]` | Sonner toast notifications |

---

## Empty & Loading States

### Skeleton Loader

Used for: table rows, card grids, KPI cards, product lists.

```tsx
<Skeleton className="h-4 w-[250px]" />   // Text line
<Skeleton className="h-8 w-[200px]" />   // Heading
<Skeleton className="h-[120px] w-full" /> // Card placeholder
<Skeleton className="size-10 rounded-full" /> // Avatar
```

### Empty State

When a list/table/section has no data:

- Icon: `size-12` in `text-muted-foreground`
- Title: `text-base font-medium text-foreground`
- Description: `text-sm text-muted-foreground`
- Action: primary button to create/refresh

Pattern:
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <EmptyIcon className="size-12 text-muted-foreground mb-4" />
  <h3 className="text-base font-medium">Aucun résultat</h3>
  <p className="text-sm text-muted-foreground mt-1">Créez votre premier produit pour commencer.</p>
  <Button className="mt-4">Créer</Button>
</div>
```

### Spinner

For inline loading (button content, form submission):

```tsx
<Loader2Icon className="size-4 animate-spin" />
```

Always pair with appropriate `aria-label` or `aria-busy`.

---

## Toast Notifications (Sonner)

Position: bottom-right (desktop), bottom-center (mobile).

| Type | Icon | Style |
|---|---|---|
| Success | `CircleCheckIcon` | Default toast styling |
| Error | `OctagonXIcon` | Default toast styling |
| Warning | `TriangleAlertIcon` | Default toast styling |
| Info | `InfoIcon` | Default toast styling |
| Loading | `Loader2Icon` with `animate-spin` | Default toast styling |

```tsx
import { toast } from "sonner";

toast.success("Produit créé avec succès");
toast.error("Erreur lors de la création");
toast.warning("Stock insuffisant");
toast.info("Nouvelle commande reçue");
toast.loading("Chargement en cours...");
```

Rich toast with action:
```tsx
toast("Commande confirmée", {
  description: "La commande #2847 est en cours de traitement",
  action: { label: "Voir", onClick: () => router.push("/orders/2847") },
});
```

---

## Form Validation States

### Field States

| State | Border | Ring | Text |
|---|---|---|---|
| Default | `--input` | none | `--foreground` |
| Focus | `--ring` | `ring-ring/50` (3px) | `--foreground` |
| Error | `--destructive` | `ring-destructive/20` (3px) | `--foreground` |
| Disabled | `--input` | none | `--muted-foreground` (50% opacity) |

### Error Message

```tsx
<p className="text-sm text-destructive mt-1">Ce champ est obligatoire</p>
```

### Hint Text

```tsx
<p className="text-sm text-muted-foreground mt-1">Nom tel qu'il apparaîtra sur la boutique</p>
```

---

## Data Table Patterns (Admin Dashboard)

> Data tables are used exclusively in the admin dashboard, not in storefront pages. For customer-facing order lists, see the "My Orders" pattern.

### Architecture

The data table system uses TanStack Table with server-side operations:

- **TanStack Table** — headless table with column definitions
- **Server-side** — pagination, filtering, sorting via tRPC
- **Column visibility** — user-toggleable columns via dropdown
- **Row selection** — checkbox-based multi-select
- **Bulk actions** — toolbar appears when rows selected
- **Export** — CSV/Excel export via server action

### Component Hierarchy

```
DataTable
├── DataTableToolbar
│   ├── Search input
│   ├── FacetedFilter (column-specific)
│   ├── DateRangeFilter
│   ├── RangeFilter
│   └── SliderFilter
├── DataTableColumnHeader (per column)
│   ├── Sort toggle
│   └── Visibility toggle
├── Table (shadcn/ui base)
│   ├── TableHeader
│   │   └── TableRow → TableHead (with checkboxes)
│   └── TableBody
│       └── TableRow → TableCell (with checkboxes)
├── DataTableViewOptions
│   └── Column visibility toggles
└── DataTablePagination
    ├── Rows per page selector
    ├── Page navigation
    └── Row count
```

### Toolbar Layout

```css
flex items-center justify-between gap-2 py-4
```

- Left: search input + faceted filters
- Right: view options + export button

### Filter Variants

| Filter | Component | Use |
|---|---|---|
| Text search | `Input` with search icon | Global search across columns |
| Faceted (multi) | `Popover` + `Command` | Status, category, tag filters |
| Date range | `Popover` + `Calendar` | Order date, created date |
| Range (numeric) | `Slider` | Price range, quantity range |
| Simple select | `Select` | Single-column dropdown filter |

### Column Header Behavior

Each sortable column header shows:
- Column name
- Sort indicator (up/down/none)
- Click to cycle sort states: none → asc → desc → none

### Row Selection Pattern

```tsx
<Checkbox
  checked={table.getIsAllPageRowsSelected()}
  onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
/>
// Per row:
<Checkbox
  checked={row.getIsSelected()}
  onCheckedChange={(value) => row.toggleSelected(!!value)}
/>
```

### Responsive Table

- Desktop: full table with all columns
- Tablet: table with reduced columns
- Mobile: card-based layout (each row becomes a card)

---

## Pattern Catalog

All 21 patterns defined in `patterns.html`. Patterns are labeled Admin (dashboard-only) or Storefront (customer-facing).

### Admin Dashboard Patterns

| # | Pattern | Description |
|---|---|---|
| 01 | Data Table | Full table with search, filters, column visibility, pagination, row selection |
| 02 | Action Bar | Bulk action toolbar — appears when rows selected (delete, export, status change) |

### Storefront Patterns

| # | Pattern | Description |
|---|---|---|
| 03 | Top Navigation | Desktop nav with logo, links, search, cart, account dropdown |
| 04 | Bottom Navigation | Mobile tab bar (Home, Search, Cart, Account) |
| 05 | Side Navigation | Admin sidebar (shared infrastructure, storefront context) |
| 06 | Login Flows | Login/register/forgot password cards with social auth |
| 07 | Form Layouts | Address forms, profile forms, field groups with validation |
| 08 | Product Card | Product thumbnail, badges, wishlist, rating, price, quick actions |
| 09 | Product Search | Search bar with instant results, product suggestions |
| 10 | Product Details | Gallery, variant selector (size), quantity, add-to-cart, meta |
| 11 | My Orders | Single customer's order history with status badges |
| 12 | Order Details | Order timeline, items, shipping/payment info |
| 13 | Checkout | Step indicator, address/payment forms, order summary |
| 14 | Cart | Cart items with quantity controls, summary with totals |
| 15 | Wishlist | Saved products grid with quick-add-to-cart |
| 16 | Saved Products | Product list with price tracking and stock alerts |
| 17 | Campaigns & Promotions | Hero banners, countdown timers, promo codes |
| 18 | Recently Viewed | Horizontal scroll of recently viewed products |
| 19 | Compare Products | Side-by-side feature comparison table |
| 20 | Categories | Category grid with images and product counts |
| 21 | Category Products | Category header, subcategory filters, product grid |

---

## Component Library

All 31 components defined in `components.html`.

### Foundations (01–03)

| # | Component | Description |
|---|---|---|
| 01 | Animation & Transitions | Duration scale, easing curves, overlay animations |
| 02 | Focus States | Focus ring patterns, invalid states, focus-within |
| 03 | Overlay Patterns | Backdrop blur, glassmorphism panels, stacking order |

### Primitives (04–07)

| # | Component | Description |
|---|---|---|
| 04 | Buttons | All variants (primary, secondary, outline, ghost, destructive, link), sizes (sm, md, lg), icon buttons |
| 05 | Badges | All variants (primary, secondary, accent, outline, success, warning, destructive) with dot indicator |
| 06 | Avatar & Separator | Avatar sizes, groups, fallback initials, horizontal/vertical separators |
| 07 | Progress & Skeleton | Progress bars with labels, skeleton loaders for text/card/avatar |

### Input (08–13)

| # | Component | Description |
|---|---|---|
| 08 | Form Controls | Input, textarea, select, checkbox, switch |
| 09 | Form Validation States | Default, focus, error, disabled states with error messages |
| 10 | Datetime Picker | Calendar grid with month/year navigation, time picker |
| 11 | Variant Selector | Pill-style option buttons (size, color) with active state |
| 12 | Color Picker | Color swatches with hex input, custom color support |
| 13 | Color Swatch Selector | Grid of color options with selected state |

### Layout (14–16)

| # | Component | Description |
|---|---|---|
| 14 | Cards | KPI card, order card, product card |
| 15 | Accordion | Interactive expand/collapse sections |
| 16 | Stats Cards | Dashboard KPI cards with trend indicators |

### Navigation (17–19, 22)

| # | Component | Description |
|---|---|---|
| 17 | Tabs | Default (pill) and line variants |
| 18 | Breadcrumb | Hierarchical navigation with separators |
| 22 | Stepper | Step indicator with completed/active/pending states |

### Feedback (23–28)

| # | Component | Description |
|---|---|---|
| 23 | Alerts | Info, success, warning, destructive with icons |
| 24 | Toast Notifications | Success, error, warning, info toasts (sonner) |
| 25 | Empty State | Icon + title + description + action button |
| 26 | Error State | Alert + retry button pattern |
| 27 | Loading State | Spinner + skeleton pattern |
| 28 | Success State | Success alert + confirmation pattern |

### Overlay (29–32)

| # | Component | Description |
|---|---|---|
| 29 | Tooltip, Popover & Dropdown | Interactive hover/click overlays |
| 30 | Dialog | Modal with open/close, form inside dialog |
| 31 | Alert Dialog | Confirmation dialog with destructive action |
| 32 | Responsive Dialog / Drawer | Dialog on desktop, bottom sheet on mobile |

### Data & Media (35–36)

| # | Component | Description |
|---|---|---|
| 35 | Charts | Bar, line, area, pie chart placeholders |
| 36 | Carousel | Product image carousel with navigation |

### Gaps

Sections 19–21 and 33–34 were removed during development (previously data table, nav, and action bar, now consolidated into patterns.html).

---

## Tailwind v4 Theme Mapping

All CSS tokens are mapped to Tailwind utilities via `@theme inline` in `globals.css`. Use these in components:

```
bg-background, text-foreground, bg-card, text-card-foreground
bg-primary, text-primary-foreground
bg-secondary, text-secondary-foreground
bg-muted, text-muted-foreground
bg-accent, text-accent-foreground
bg-destructive, text-destructive-foreground
bg-success, text-success-foreground
bg-warning, text-warning-foreground
bg-info, text-info-foreground
border-border, ring-ring
bg-sidebar, text-sidebar-foreground
```

Brand tokens (outside semantic system):
```
text-crimson-violet, bg-cream, text-chiffon
```

---

## Accessibility

### Reduced Motion

The `tokens.css` base reset includes a `prefers-reduced-motion` media query that disables all animations and transitions for users who prefer reduced motion.

### Screen Reader Only

The `.sr-only` utility class is provided for visually hidden but screen-reader-accessible content.

### ARIA Patterns

- All interactive elements include `aria-label` or visible text labels
- Form fields use `aria-describedby` for error messages
- Dialogs use `aria-modal` and focus trapping
- Data tables use `role="table"` with proper `scope` on headers
- Loading states use `aria-busy` and `aria-live="polite"`

### Contrast

- All text-on-background pairs meet WCAG AA (4.5:1 minimum)
- `--primary-foreground` on `--primary`: dark olive on lemon lime (~6:1)
- `--accent-foreground` on `--accent`: light pink on crimson violet (~3.2:1 — decorative only, not for body text)
- `--success-foreground` on `--success`: dark olive on green (~5.5:1)
- `--info-foreground` on `--info`: dark navy on blue (~5:1)
