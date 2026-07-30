"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Sun, Moon } from "lucide-react";

const brandColors = [
  {
    name: "Lemon Lime",
    token: "--primary",
    hex: "#c8d152",
    oklch: "oklch(0.852 0.199 91.9)",
    bg: "bg-primary",
    fg: "text-primary-foreground",
  },
  {
    name: "Lemon Chiffon",
    token: "--secondary",
    hex: "#f9f7be",
    oklch: "oklch(0.97 0.035 95)",
    bg: "bg-secondary",
    fg: "text-secondary-foreground",
  },
  {
    name: "Olive Leaf",
    token: "--olive",
    hex: "#4d4c20",
    oklch: "oklch(0.32 0.045 85)",
    bg: "bg-olive",
    fg: "text-white",
  },
  {
    name: "Cream",
    token: "--cream",
    hex: "#fff3e3",
    oklch: "oklch(0.97 0.015 75)",
    bg: "bg-cream",
    fg: "text-foreground",
  },
  {
    name: "Crimson Violet",
    token: "--accent",
    hex: "#700145",
    oklch: "oklch(0.35 0.20 350)",
    bg: "bg-accent",
    fg: "text-accent-foreground",
  },
];

const semanticColors = [
  { name: "Background", token: "--background", bg: "bg-background", fg: "text-foreground" },
  { name: "Card", token: "--card", bg: "bg-card", fg: "text-card-foreground" },
  { name: "Muted", token: "--muted", bg: "bg-muted", fg: "text-muted-foreground" },
  { name: "Success", token: "--success", bg: "bg-success", fg: "text-success-foreground" },
  { name: "Warning", token: "--warning", bg: "bg-warning", fg: "text-warning-foreground" },
  { name: "Info", token: "--info", bg: "bg-info", fg: "text-info-foreground" },
  {
    name: "Destructive",
    token: "--destructive",
    bg: "bg-destructive",
    fg: "text-destructive-foreground",
  },
];

const spacingScale = [
  { token: "0.5", px: 2, rem: "0.125rem" },
  { token: "1", px: 4, rem: "0.25rem" },
  { token: "2", px: 8, rem: "0.5rem" },
  { token: "3", px: 12, rem: "0.75rem" },
  { token: "4", px: 16, rem: "1rem" },
  { token: "5", px: 20, rem: "1.25rem" },
  { token: "6", px: 24, rem: "1.5rem" },
  { token: "8", px: 32, rem: "2rem" },
  { token: "10", px: 40, rem: "2.5rem" },
  { token: "12", px: 48, rem: "3rem" },
  { token: "16", px: 64, rem: "4rem" },
  { token: "20", px: 80, rem: "5rem" },
];

const radiusScale = [
  { token: "sm", value: "6px" },
  { token: "md", value: "8px" },
  { token: "lg", value: "10px" },
  { token: "xl", value: "14px" },
  { token: "2xl", value: "18px" },
  { token: "full", value: "9999px" },
];

const elevationLevels = [
  { name: "Flat", class: "shadow-none border border-border" },
  { name: "XS", class: "shadow-[var(--shadow-xs)]" },
  { name: "SM", class: "shadow-sm" },
  { name: "MD", class: "shadow-md" },
  { name: "LG", class: "shadow-lg" },
  { name: "XL", class: "shadow-xl" },
];

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-accent mb-1.5 text-xs font-semibold tracking-widest uppercase">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading mb-8 text-[clamp(1.44rem,2.5vw,2rem)] leading-tight font-normal tracking-tight">
      {children}
    </h2>
  );
}

export default function DesignSystemPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="mx-auto max-w-300 px-8 py-12 pb-24">
      {/* Header */}
      <header className="border-border mb-16 flex items-start justify-between border-b pb-8">
        <div>
          <h1 className="font-heading text-[clamp(2.4rem,4vw,3.5rem)] leading-none font-normal tracking-tight">
            ORLA <span className="text-accent">Design System</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Ecommerce platform tokens &middot; Storefront + Admin Dashboard
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="shrink-0 gap-2"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {isDark ? "Light" : "Dark"}
        </Button>
      </header>

      {/* ── 01 Color ──────────────────────────────── */}
      <section className="mb-16">
        <SectionLabel>01 &mdash; Color</SectionLabel>
        <SectionTitle>Palette</SectionTitle>

        <h3 className="text-muted-foreground mb-3 text-sm font-semibold">Brand Colors</h3>
        <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {brandColors.map((c) => (
            <div key={c.token} className="border-border bg-card overflow-hidden rounded-lg border">
              <div className={`flex h-20 items-end px-3.5 pb-2.5 ${c.bg}`}>
                <span
                  className={`rounded-sm bg-black/10 px-1.5 py-0.5 text-[0.6875rem] font-semibold ${c.fg}`}
                >
                  {c.name.toUpperCase()}
                </span>
              </div>
              <div className="px-3.5 py-3">
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="text-muted-foreground text-xs">{c.token}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {c.hex} &middot; {c.oklch}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-muted-foreground mb-3 text-sm font-semibold">Semantic Tokens</h3>
        <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {semanticColors.map((c) => (
            <div key={c.token} className="border-border bg-card overflow-hidden rounded-lg border">
              <div className={`flex h-20 items-end px-3.5 pb-2.5 ${c.bg}`}>
                <span
                  className={`rounded-sm bg-black/10 px-1.5 py-0.5 text-[0.6875rem] font-semibold ${c.fg}`}
                >
                  {c.name.toUpperCase()}
                </span>
              </div>
              <div className="px-3.5 py-3">
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="text-muted-foreground text-xs">{c.token}</div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-muted-foreground mb-3 text-sm font-semibold">Chart Palette</h3>
        <div className="flex h-12 gap-2">
          {chartColors.map((color, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-opacity hover:opacity-80"
              style={{ background: color }}
              title={`Chart ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── 02 Typography ─────────────────────────── */}
      <section className="mb-16">
        <SectionLabel>02 &mdash; Typography</SectionLabel>
        <SectionTitle>Type Scale</SectionTitle>

        <div className="flex flex-col">
          {[
            {
              role: "Display",
              spec: "Orla Serif 400 · 38–56px · -0.025em",
              sample: "Pâtisserie Algérienne",
              class:
                "font-heading text-[clamp(2.4rem,4vw,3.5rem)] font-normal leading-[1.1] tracking-tight",
            },
            {
              role: "Heading 1",
              spec: "Orla Serif 400 · 29–40px · -0.02em",
              sample: "Outils de Boulangerie",
              class:
                "font-heading text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-[1.15] tracking-tight",
            },
            {
              role: "Heading 2",
              spec: "Orla Serif 400 · 23–32px · -0.015em",
              sample: "Ingrédients & Packaging",
              class:
                "font-heading text-[clamp(1.44rem,2.5vw,2rem)] font-normal leading-[1.2] tracking-tight",
            },
            {
              role: "Heading 3",
              spec: "Orla Serif 400 · 18–26px · -0.01em",
              sample: "Catégories Populaires",
              class:
                "font-heading text-[clamp(1.15rem,2vw,1.6rem)] font-normal leading-[1.25] tracking-tight",
            },
            {
              role: "Heading 4",
              spec: "Montserrat 600 · 20px",
              sample: "Gâteaux & Tartes",
              class: "text-xl font-semibold leading-[1.3]",
            },
            {
              role: "Heading 5",
              spec: "Montserrat 600 · 18px",
              sample: "Produits Vedettes",
              class: "text-lg font-semibold leading-[1.4]",
            },
            {
              role: "Body Large",
              spec: "Montserrat 400 · 18px · 1.6",
              sample:
                "Découvrez notre sélection d'outils professionnels pour la pâtisserie algérienne.",
              class: "text-lg leading-relaxed",
            },
            {
              role: "Body",
              spec: "Montserrat 400 · 16px · 1.6",
              sample: "Nous proposons une large gamme d'ingrédients et d'ustensiles.",
              class: "text-base leading-relaxed",
            },
            {
              role: "Body Small",
              spec: "Montserrat 400 · 14px · +0.01em",
              sample: "Livraison gratuite pour les commandes supérieures à 5000 DA",
              class: "text-sm tracking-wide",
            },
            {
              role: "Caption",
              spec: "Montserrat 500 · 12px · +0.02em",
              sample: "Ajouté au panier il y a 2 minutes",
              class: "text-xs font-medium tracking-wide text-muted-foreground",
            },
            {
              role: "Overline",
              spec: "Montserrat 600 · 11px · +0.08em · UPPERCASE",
              sample: "Nouveau Arrivage",
              class: "text-[0.6875rem] font-semibold tracking-widest uppercase",
            },
          ].map((row) => (
            <div
              key={row.role}
              className="border-border flex items-baseline gap-6 border-b py-4 last:border-b-0"
            >
              <div className="w-50 shrink-0">
                <div className="text-sm font-semibold">{row.role}</div>
                <div className="text-muted-foreground mt-0.5 text-xs">{row.spec}</div>
              </div>
              <div className={`min-w-0 flex-1 truncate ${row.class}`}>{row.sample}</div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── 03 Components ─────────────────────────── */}
      <section className="mb-16">
        <SectionLabel>03 &mdash; Components</SectionLabel>
        <SectionTitle>Buttons</SectionTitle>

        <div className="mb-5">
          <div className="text-muted-foreground mb-2 text-xs font-semibold">Variants</div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button>Ajouter au Panier</Button>
            <Button variant="secondary">Sauvegarder</Button>
            <Button variant="outline">Annuler</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Supprimer</Button>
            <Button variant="link">En savoir plus</Button>
          </div>
        </div>

        <div className="mb-5">
          <div className="text-muted-foreground mb-2 text-xs font-semibold">Sizes</div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <div>
          <div className="text-muted-foreground mb-2 text-xs font-semibold">States</div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled
            </Button>
          </div>
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── Badges ─────────────────────────────────── */}
      <section className="mb-16">
        <SectionTitle>Badges</SectionTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>En stock</Badge>
          <Badge variant="secondary">Nouveau</Badge>
          <Badge variant="accent">Promo</Badge>
          <Badge variant="outline">Brouillon</Badge>
          <Badge variant="success">Livré</Badge>
          <Badge variant="warning">En attente</Badge>
          <Badge variant="destructive">Annulé</Badge>
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── Form Controls ──────────────────────────── */}
      <section className="mb-16">
        <SectionTitle>Form Controls</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Nom du produit</label>
            <Input placeholder="Ex: Moule à Gâteau Round" />
            <span className="text-muted-foreground text-xs">
              Nom tel qu&apos;il apparaîtra sur la boutique
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Prix (DA)</label>
            <Input defaultValue="2,500" className="font-semibold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Code postal</label>
            <Input
              defaultValue="1600"
              className="border-destructive focus-visible:ring-destructive/20"
            />
            <span className="text-destructive text-xs">Code postal invalide</span>
          </div>
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── Cards ──────────────────────────────────── */}
      <section className="mb-16">
        <SectionTitle>Cards</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          <Card>
            <CardHeader>
              <CardDescription className="text-accent text-[0.6875rem] font-semibold tracking-widest uppercase">
                KPI
              </CardDescription>
              <CardTitle className="font-heading text-lg font-normal">
                Chiffre d&apos;Affaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading text-[clamp(1.6rem,2.5vw,2rem)] leading-none font-normal tracking-tight">
                482,300 DA
              </div>
              <p className="text-muted-foreground mt-2 text-sm">+12.4% ce mois-ci</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="text-accent text-[0.6875rem] font-semibold tracking-widest uppercase">
                Commande #2847
              </CardDescription>
              <CardTitle className="font-heading text-lg font-normal">Livraison en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                3 articles &middot; Alger, 16000 &middot; Yalidine
              </p>
              <div className="mt-2.5">
                <Badge variant="warning">En attente</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription className="text-accent text-[0.6875rem] font-semibold tracking-widest uppercase">
                Producteur Local
              </CardDescription>
              <CardTitle className="font-heading text-lg font-normal">
                Moule Silicone 12 Cavités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Moule haute qualité pour gâteaux et tartes individuelles.
              </p>
            </CardContent>
            <div className="flex gap-2 px-6 pb-5">
              <Button size="sm">Voir</Button>
              <Button size="sm" variant="outline">
                Modifier
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── Spacing ────────────────────────────────── */}
      <section className="mb-16">
        <SectionLabel>04 &mdash; Layout</SectionLabel>
        <SectionTitle>Spacing Scale</SectionTitle>
        <div className="flex flex-col gap-2">
          {spacingScale.map((s) => (
            <div key={s.token} className="flex items-center gap-4">
              <span className="text-muted-foreground w-20 shrink-0 text-right text-xs font-medium">
                {s.token} ({s.px}px)
              </span>
              <div
                className="bg-primary h-6 rounded-sm opacity-70 transition-opacity hover:opacity-100"
                style={{ width: `${s.px}px` }}
              />
              <span className="text-muted-foreground shrink-0 text-xs">{s.rem}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── Radius ─────────────────────────────────── */}
      <section className="mb-16">
        <SectionTitle>Border Radius</SectionTitle>
        <div className="flex flex-wrap gap-5">
          {radiusScale.map((r) => (
            <div key={r.token} className="flex flex-col items-center gap-2">
              <div
                className="bg-primary h-16 w-16 opacity-70 transition-opacity hover:opacity-100"
                style={{ borderRadius: `var(--radius-${r.token})` }}
              />
              <span className="text-muted-foreground text-xs">
                {r.token} &middot; {r.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── Elevation ──────────────────────────────── */}
      <section className="mb-16">
        <SectionTitle>Elevation</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
          {elevationLevels.map((e) => (
            <div
              key={e.name}
              className={`bg-card text-muted-foreground flex h-20 items-center justify-center rounded-lg text-xs font-semibold ${e.class}`}
            >
              {e.name}
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── Posture Rules ──────────────────────────── */}
      <section className="mb-16">
        <SectionLabel>05 &mdash; Principles</SectionLabel>
        <SectionTitle>Posture Rules</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
          {[
            {
              num: "01",
              title: "Warm over clinical",
              desc: "The Cream/Lemon palette reads warm; never override to cool gray or pure white backgrounds.",
            },
            {
              num: "02",
              title: "Accent restraint",
              desc: "Crimson Violet appears at most twice per visible screen: one primary CTA + one supplementary element.",
            },
            {
              num: "03",
              title: "Heading discipline",
              desc: "H1–H3 use Orla Serif; H4–H6 use Montserrat 600. Never mix serif into UI chrome.",
            },
            {
              num: "04",
              title: "RTL-first spacing",
              desc: "All directional padding/margin uses logical properties. No hardcoded left/right spacing.",
            },
            {
              num: "05",
              title: "Dark mode is not inverted",
              desc: "Dark mode uses deep olive backgrounds, not black. The warmth is preserved.",
            },
            {
              num: "06",
              title: "Data density in dashboard",
              desc: "Admin uses tighter spacing (8–12px gaps), storefront uses generous spacing (16–24px gaps).",
            },
          ].map((rule) => (
            <div key={rule.num} className="border-border bg-card rounded-lg border p-5">
              <div className="text-accent mb-1 text-xs font-semibold tracking-widest uppercase">
                Rule {rule.num}
              </div>
              <div className="font-heading mb-1 text-base font-normal">{rule.title}</div>
              <p className="text-muted-foreground text-sm leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── 06 Animation & Transitions ──────────────── */}
      <section className="mb-16">
        <SectionLabel>06 &mdash; Motion</SectionLabel>
        <SectionTitle>Animation &amp; Transitions</SectionTitle>

        <h3 className="text-muted-foreground mb-3 text-sm font-semibold">Duration Scale</h3>
        <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {[
            { token: "100", ms: "100ms", desc: "Micro (hover fill)" },
            { token: "150", ms: "150ms", desc: "Fast (toggle)" },
            { token: "200", ms: "200ms", desc: "Normal (tab switch)" },
            { token: "300", ms: "300ms", desc: "Moderate (dialog)" },
            { token: "500", ms: "500ms", desc: "Slow (page transition)" },
          ].map((d) => (
            <div key={d.token} className="border-border bg-card rounded-lg border p-4">
              <div className="font-mono text-sm font-semibold">{d.token}</div>
              <div className="text-muted-foreground mt-0.5 text-xs">{d.ms}</div>
              <div className="text-muted-foreground mt-1 text-xs">{d.desc}</div>
            </div>
          ))}
        </div>

        <h3 className="text-muted-foreground mb-3 text-sm font-semibold">Easing Curves</h3>
        <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {[
            { token: "ease-in", curve: "cubic-bezier(0.4, 0, 1, 1)", desc: "Entering states" },
            { token: "ease-out", curve: "cubic-bezier(0, 0, 0.2, 1)", desc: "Exiting states" },
            {
              token: "ease-in-out",
              curve: "cubic-bezier(0.4, 0, 0.2, 1)",
              desc: "Default transitions",
            },
            {
              token: "spring",
              curve: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              desc: "Bouncy / playful",
            },
          ].map((e) => (
            <div key={e.token} className="border-border bg-card rounded-lg border p-4">
              <div className="font-mono text-sm font-semibold">{e.token}</div>
              <div className="text-muted-foreground mt-0.5 font-mono text-[0.6875rem]">
                {e.curve}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">{e.desc}</div>
            </div>
          ))}
        </div>

        <h3 className="text-muted-foreground mb-3 text-sm font-semibold">Duration in Action</h3>
        <div className="flex flex-wrap gap-3">
          {["100", "150", "200", "300", "500"].map((ms) => (
            <button
              key={ms}
              className="group bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-4 py-2 text-sm font-medium transition-all"
              style={{ transitionDuration: `${ms}ms` }}
            >
              {ms}ms
            </button>
          ))}
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── 07 Focus States ────────────────────────── */}
      <section className="mb-16">
        <SectionLabel>07 &mdash; Accessibility</SectionLabel>
        <SectionTitle>Focus States</SectionTitle>

        <p className="text-muted-foreground mb-5 max-w-lg text-sm">
          All interactive elements use a visible focus ring for keyboard navigation. Click any
          element below to see its focus ring.
        </p>

        <div className="mb-6 flex flex-wrap gap-3">
          <Button className="focus-visible:ring-ring/50 focus-visible:ring-[3px]">
            Primary Focus
          </Button>
          <Button variant="outline" className="focus-visible:ring-ring/50 focus-visible:ring-[3px]">
            Outline Focus
          </Button>
          <Button variant="ghost" className="focus-visible:ring-ring/50 focus-visible:ring-[3px]">
            Ghost Focus
          </Button>
          <Button
            variant="destructive"
            className="focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            Destructive Focus
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Badge className="focus-visible:ring-ring/50 focus-visible:ring-[3px]" tabIndex={0}>
            Badge Focus
          </Badge>
          <Badge
            variant="success"
            className="focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            tabIndex={0}
          >
            Success Focus
          </Badge>
          <Badge
            variant="accent"
            className="focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            tabIndex={0}
          >
            Accent Focus
          </Badge>
        </div>

        <div className="max-w-90">
          <Input
            placeholder="Tab to this input..."
            className="focus-visible:ring-ring/15 focus-visible:ring-[3px]"
          />
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── 08 Overlay Patterns ────────────────────── */}
      <section className="mb-16">
        <SectionLabel>08 &mdash; Overlays</SectionLabel>
        <SectionTitle>Overlay Patterns</SectionTitle>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="from-primary/20 to-accent/10 relative flex h-32 items-center justify-center bg-linear-to-br">
              <div className="bg-background/60 absolute inset-0 backdrop-blur-sm" />
              <span className="relative z-10 text-sm font-medium">backdrop-blur-sm</span>
            </div>
            <div className="p-4">
              <div className="text-sm font-semibold">Light Blur</div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                Use for modals and dropdown menus
              </div>
            </div>
          </div>

          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="from-primary/20 to-accent/10 relative flex h-32 items-center justify-center bg-linear-to-br">
              <div className="bg-background/80 absolute inset-0 backdrop-blur-md" />
              <span className="relative z-10 text-sm font-medium">backdrop-blur-md</span>
            </div>
            <div className="p-4">
              <div className="text-sm font-semibold">Medium Blur</div>
              <div className="text-muted-foreground mt-0.5 text-xs">Use for dialog overlays</div>
            </div>
          </div>

          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="from-primary/20 to-accent/10 relative flex h-32 items-center justify-center bg-linear-to-br">
              <div className="bg-background/80 absolute inset-0 backdrop-blur-lg" />
              <span className="relative z-10 text-sm font-medium">backdrop-blur-lg</span>
            </div>
            <div className="p-4">
              <div className="text-sm font-semibold">Heavy Blur</div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                Use for full-screen overlays
              </div>
            </div>
          </div>
        </div>

        <div className="border-border bg-card mt-6 rounded-lg border p-5">
          <h3 className="mb-3 text-sm font-semibold">Overlay Opacity Scale</h3>
          <div className="flex items-end gap-3">
            {["5%", "15%", "30%", "50%", "80%"].map((op) => (
              <div key={op} className="flex flex-col items-center gap-1.5">
                <div
                  className="bg-primary border-border h-14 w-14 rounded-lg border"
                  style={{ opacity: op }}
                />
                <span className="text-muted-foreground text-[0.6875rem]">{op}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="my-16" />

      {/* ── Tailwind Mapping ───────────────────────── */}
      <section className="mb-16">
        <SectionTitle>Tailwind v4 Theme Mapping</SectionTitle>
        <div className="border-border bg-card overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="text-muted-foreground bg-muted px-4 py-2.5 text-left text-xs font-semibold">
                  CSS Token
                </th>
                <th className="text-muted-foreground bg-muted px-4 py-2.5 text-left text-xs font-semibold">
                  Tailwind Class
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["--background", "bg-background"],
                ["--foreground", "text-foreground"],
                ["--card", "bg-card"],
                ["--primary", "bg-primary"],
                ["--primary-foreground", "text-primary-foreground"],
                ["--secondary", "bg-secondary"],
                ["--muted", "bg-muted"],
                ["--accent", "bg-accent"],
                ["--destructive", "bg-destructive"],
                ["--success", "bg-success"],
                ["--warning", "bg-warning"],
                ["--info", "bg-info"],
                ["--border", "border-border"],
                ["--ring", "ring-ring"],
              ].map(([token, cls]) => (
                <tr
                  key={token}
                  className="border-border hover:bg-muted/50 border-b last:border-b-0"
                >
                  <td className="px-4 py-2 font-mono text-xs">{token}</td>
                  <td className="px-4 py-2 font-mono text-xs">{cls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
