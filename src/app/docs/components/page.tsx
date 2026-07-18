"use client";

import { useState } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Field, FieldContent, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputList } from "@/components/ui/tags-input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperSeparator, StepperTitle, StepperDescription, StepperContent, StepperPrev, StepperNext } from "@/components/ui/stepper";
import { Rating, RatingItem } from "@/components/ui/rating";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Kbd } from "@/components/ui/kbd";
import { ButtonGroup } from "@/components/ui/button-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Sun, Moon, Plus, Info, CircleCheck, CircleX, TriangleAlert, OctagonX,
  PackageOpen, WifiOff, RefreshCw, Loader2, CheckCircle2, XCircle,
  MoreHorizontal, ChevronDown, Settings, User, Trash2, CreditCard,
  Search, Command as CommandIcon, CalendarDays, Star, Upload,
  Bold, Italic, Underline, Copy, Scissors, ClipboardPaste, Undo2, Redo2,
  PanelLeft, PanelRightClose, Hash, AtSign, Mail, Phone,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
  { month: "Jan", revenue: 42000 },
  { month: "Fév", revenue: 58000 },
  { month: "Mar", revenue: 65000 },
  { month: "Avr", revenue: 48000 },
  { month: "Mai", revenue: 72000 },
  { month: "Jun", revenue: 89000 },
];

const chartConfig = {
  revenue: { label: "Revenu", color: "var(--color-primary)" },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-widest text-accent mb-1.5">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-heading text-[clamp(1.44rem,2.5vw,2rem)] font-normal leading-tight tracking-tight mb-6">{children}</h2>;
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return <div className="w-full text-xs font-semibold text-muted-foreground mb-[-4px]">{children}</div>;
}

export default function ComponentsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({ email: true, edition: false });
  const [sliderValue, setSliderValue] = useState([50]);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [stepperValue, setStepperValue] = useState(0);
  const [ratingValue, setRatingValue] = useState(3);
  const [commandOpen, setCommandOpen] = useState(false);
  const [sheetSide, setSheetSide] = useState<"right" | "left" | "top" | "bottom">("right");
  const [tags, setTags] = useState(["Pâtisserie", "Moules", "Ingrédients"]);

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-12 pb-24">
      {/* Header */}
      <header className="flex justify-between items-start mb-14 pb-6 border-b border-border">
        <div>
          <h1 className="font-heading text-[clamp(2rem,3.5vw,3rem)] font-normal leading-none tracking-tight">
            ORLA <span className="text-accent">Components</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Reusable UI library &middot; shadcn/ui radix-maia preset
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setTheme(isDark ? "light" : "dark")} className="gap-2 shrink-0">
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {isDark ? "Light" : "Dark"}
        </Button>
      </header>

      {/* ── 01 Buttons ────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>01 &mdash; Actions</SectionLabel>
        <SectionTitle>Buttons</SectionTitle>
        <div className="mb-5">
          <RowLabel>Variants</RowLabel>
          <div className="flex flex-wrap items-center gap-2.5 mt-2">
            <Button>Ajouter au Panier</Button>
            <Button variant="secondary">Sauvegarder</Button>
            <Button variant="outline">Annuler</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Supprimer</Button>
            <Button variant="link">En savoir plus</Button>
          </div>
        </div>
        <div className="mb-5">
          <RowLabel>Sizes</RowLabel>
          <div className="flex flex-wrap items-center gap-2.5 mt-2">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon-sm" aria-label="Add"><Plus className="size-4" /></Button>
            <Button size="icon" aria-label="Add"><Plus className="size-4" /></Button>
            <Button size="icon-lg" aria-label="Add"><Plus className="size-4" /></Button>
          </div>
        </div>
        <div>
          <RowLabel>States</RowLabel>
          <div className="flex flex-wrap items-center gap-2.5 mt-2">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled</Button>
          </div>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 02 Button Group ───────────────────────── */}
      <section className="mb-14">
        <SectionLabel>02 &mdash; Actions</SectionLabel>
        <SectionTitle>Button Group</SectionTitle>
        <div className="flex flex-wrap gap-4">
          <ButtonGroup>
            <Button size="sm" variant="outline"><Bold className="size-3.5" /></Button>
            <Button size="sm" variant="outline"><Italic className="size-3.5" /></Button>
            <Button size="sm" variant="outline"><Underline className="size-3.5" /></Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button size="sm"><Copy className="size-3.5" /> Copier</Button>
            <Button size="sm"><Scissors className="size-3.5" /> Couper</Button>
            <Button size="sm"><ClipboardPaste className="size-3.5" /> Coller</Button>
          </ButtonGroup>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 03 Badges ─────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>03 &mdash; Status</SectionLabel>
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

      <Separator className="my-14" />

      {/* ── 04 Alerts ─────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>04 &mdash; Feedback</SectionLabel>
        <SectionTitle>Alerts</SectionTitle>
        <div className="flex flex-col gap-3">
          <Alert>
            <Info className="size-4 shrink-0 mt-0.5" />
            <div><AlertTitle>Nouvelle commande reçue</AlertTitle><AlertDescription>La commande #2847 a été passée par un client à Alger.</AlertDescription></div>
          </Alert>
          <Alert variant="success">
            <CircleCheck className="size-4 shrink-0 mt-0.5" />
            <div><AlertTitle>Produit créé avec succès</AlertTitle><AlertDescription>Moule Silicone 12 Cavités a été ajouté au catalogue.</AlertDescription></div>
          </Alert>
          <Alert variant="warning">
            <TriangleAlert className="size-4 shrink-0 mt-0.5" />
            <div><AlertTitle>Stock insuffisant</AlertTitle><AlertDescription>Boîte Kraft 20×20×10 — seulement 12 articles restants.</AlertDescription></div>
          </Alert>
          <Alert variant="destructive">
            <CircleX className="size-4 shrink-0 mt-0.5" />
            <div><AlertTitle>Erreur de paiement</AlertTitle><AlertDescription>Le paiement Chargily a échoué pour la commande #2831.</AlertDescription></div>
          </Alert>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 05 Form Controls ──────────────────────── */}
      <section className="mb-14">
        <SectionLabel>05 &mdash; Input</SectionLabel>
        <SectionTitle>Form Controls</SectionTitle>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 mb-5">
          <div className="flex flex-col gap-1.5">
            <Label>Nom du produit</Label>
            <Input placeholder="Ex: Moule à Gâteau Round" />
            <span className="text-xs text-muted-foreground">Nom tel qu&apos;il apparaîtra sur la boutique</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Prix (DA)</Label>
            <Input defaultValue="2,500" className="font-semibold" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Catégorie</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="outils">Outils de Pâtisserie</SelectItem>
                <SelectItem value="ingredients">Ingrédients</SelectItem>
                <SelectItem value="packaging">Boîtes &amp; Packaging</SelectItem>
                <SelectItem value="moules">Moules</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Code postal</Label>
            <Input defaultValue="1600" className="border-destructive focus-visible:ring-destructive/20" />
            <span className="text-xs text-destructive">Code postal invalide</span>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex flex-col gap-1.5 max-w-[540px]">
            <Label>Description</Label>
            <Textarea placeholder="Décrivez le produit..." />
          </div>
        </div>

        <div className="mb-5">
          <div className="flex flex-col gap-1.5 max-w-[360px]">
            <Label>Input Group</Label>
            <InputGroup>
              <InputGroupAddon><Mail className="size-4" /></InputGroupAddon>
              <InputGroupInput placeholder="email@orla.dz" />
              <InputGroupAddon>.dz</InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        <div className="mb-5">
          <RowLabel>Tags Input</RowLabel>
          <div className="max-w-[360px] mt-2">
            <TagsInput value={tags} onValueChange={setTags}>
              <TagsInputList>
                {tags.map((tag) => (
                  <TagsInputItem key={tag} value={tag}>{tag}</TagsInputItem>
                ))}
                <TagsInputInput placeholder="Ajouter un tag..." />
              </TagsInputList>
            </TagsInput>
          </div>
        </div>

        <div className="mb-5">
          <RowLabel>Slider</RowLabel>
          <div className="max-w-[360px] mt-2">
            <Slider value={sliderValue} onValueChange={setSliderValue} />
            <div className="text-xs text-muted-foreground mt-1.5">Valeur : {sliderValue[0]}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 items-center">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <Checkbox defaultChecked /> Actif
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <Checkbox /> Visible en boutique
          </label>
          <div className="flex items-center gap-2">
            <Switch checked={switchStates.email} onCheckedChange={(v) => setSwitchStates((s) => ({ ...s, email: v }))} />
            <span className="text-sm">Notification email</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={switchStates.edition} onCheckedChange={(v) => setSwitchStates((s) => ({ ...s, edition: v }))} />
            <span className="text-sm">Mode édition</span>
          </div>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 06 Field Component ────────────────────── */}
      <section className="mb-14">
        <SectionLabel>06 &mdash; Forms</SectionLabel>
        <SectionTitle>Field</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          <Field>
            <FieldContent>
              <FieldLabel>Nom du produit</FieldLabel>
              <Input placeholder="Ex: Moule à Gâteau Round" />
              <FieldDescription>Nom tel qu&apos;il apparaîtra sur la boutique</FieldDescription>
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <FieldLabel>Prix (DA)</FieldLabel>
              <Input defaultValue="2,500" />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <FieldLabel>Code postal</FieldLabel>
              <Input defaultValue="00" className="border-destructive" />
              <FieldError errors={[{ message: "Code postal invalide" }]} />
            </FieldContent>
          </Field>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 07 Cards ──────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>07 &mdash; Layout</SectionLabel>
        <SectionTitle>Cards</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          <Card>
            <CardHeader>
              <CardDescription className="text-[0.6875rem] font-semibold uppercase tracking-widest text-accent">KPI</CardDescription>
              <CardTitle className="font-heading text-lg font-normal">Chiffre d&apos;Affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading text-[clamp(1.6rem,2.5vw,2rem)] font-normal leading-none tracking-tight">482,300 DA</div>
              <p className="text-sm text-muted-foreground mt-2">+12.4% ce mois-ci</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-[0.6875rem] font-semibold uppercase tracking-widest text-accent">Commande #2847</CardDescription>
              <CardTitle className="font-heading text-lg font-normal">Livraison en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">3 articles &middot; Alger, 16000 &middot; Yalidine</p>
              <div className="mt-2.5"><Badge variant="warning">En attente</Badge></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription className="text-[0.6875rem] font-semibold uppercase tracking-widest text-accent">Producteur Local</CardDescription>
              <CardTitle className="font-heading text-lg font-normal">Moule Silicone 12 Cavités</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Moule haute qualité pour gâteaux et tartes individuelles.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Voir</Button>
              <Button size="sm" variant="outline">Modifier</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 08 Tabs ───────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>08 &mdash; Navigation</SectionLabel>
        <SectionTitle>Tabs</SectionTitle>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2.5">Default variant</h3>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="variants">Variantes</TabsTrigger>
            <TabsTrigger value="inventory">Inventaire</TabsTrigger>
            <TabsTrigger value="media">Médias</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="text-sm text-muted-foreground py-3">Contenu de l&apos;onglet Général — informations produit, prix, description.</TabsContent>
          <TabsContent value="variants" className="text-sm text-muted-foreground py-3">Gestion des variantes — taille, couleur, materiau.</TabsContent>
          <TabsContent value="inventory" className="text-sm text-muted-foreground py-3">Suivi des stocks, alertes de stock bas, prévisions.</TabsContent>
          <TabsContent value="media" className="text-sm text-muted-foreground py-3">Photos, vidéos, galeries du produit.</TabsContent>
        </Tabs>
        <h3 className="text-sm font-semibold text-muted-foreground mt-8 mb-2.5">Line variant</h3>
        <Tabs defaultValue="orders">
          <TabsList variant="line">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="shipping">Expédition</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="text-sm text-muted-foreground py-3">Historique des commandes récentes avec statut de livraison.</TabsContent>
          <TabsContent value="payments" className="text-sm text-muted-foreground py-3">Détails de paiement et méthodes utilisées.</TabsContent>
          <TabsContent value="shipping" className="text-sm text-muted-foreground py-3">Suivi d&apos;expédition et transporteurs.</TabsContent>
        </Tabs>
      </section>

      <Separator className="my-14" />

      {/* ── 09 Accordion ──────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>09 &mdash; Disclosure</SectionLabel>
        <SectionTitle>Accordion</SectionTitle>
        <Accordion type="single" collapsible className="max-w-[540px]">
          <AccordionItem value="shipping">
            <AccordionTrigger>Politique de livraison</AccordionTrigger>
            <AccordionContent>Livraison gratuite à Alger pour les commandes supérieures à 5000 DA. Délai : 2-3 jours ouvrables.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger>Retours &amp; remboursements</AccordionTrigger>
            <AccordionContent>Retour gratuit sous 14 jours. Le produit doit être dans son emballage d&apos;origine.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="payment">
            <AccordionTrigger>Moyens de paiement</AccordionTrigger>
            <AccordionContent>Paiement à la livraison, CCP/BaridiMob, et Chargily Pay (CIB/Edahabia).</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <Separator className="my-14" />

      {/* ── 10 Collapsible ────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>10 &mdash; Disclosure</SectionLabel>
        <SectionTitle>Collapsible</SectionTitle>
        <Collapsible className="max-w-[540px] border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">@pedro du compte</div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon-sm"><ChevronDown className="size-4" /></Button>
            </CollapsibleTrigger>
          </div>
          <div className="text-sm text-muted-foreground mt-1">@pedro a été forké 3 fois cette semaine.</div>
          <CollapsibleContent className="mt-3 space-y-2">
            <div className="rounded-md border border-border px-4 py-2 text-sm">@radix-ui/primitives</div>
            <div className="rounded-md border border-border px-4 py-2 text-sm">@radix-ui/colors</div>
            <div className="rounded-md border border-border px-4 py-2 text-sm">@stitches/react</div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      <Separator className="my-14" />

      {/* ── 11 Progress & Skeleton ────────────────── */}
      <section className="mb-14">
        <SectionLabel>11 &mdash; Indicators</SectionLabel>
        <SectionTitle>Progress &amp; Skeleton</SectionTitle>
        <div className="max-w-[400px] mb-5">
          <div className="flex justify-between mb-1.5"><span className="text-sm font-medium">Stock restant</span><span className="text-sm text-muted-foreground">72%</span></div>
          <Progress value={72} />
        </div>
        <div className="max-w-[400px] mb-8">
          <div className="flex justify-between mb-1.5"><span className="text-sm font-medium">Objectif mensuel</span><span className="text-sm text-muted-foreground">45%</span></div>
          <Progress value={45} className="[&>[data-slot=progress-indicator]]:bg-accent" />
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2.5">Skeleton loaders</h3>
        <div className="flex flex-col gap-3 max-w-[400px]">
          <div className="flex gap-3 items-center">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5"><Skeleton className="h-3 w-[60%]" /><Skeleton className="h-2.5 w-[40%]" /></div>
          </div>
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-[85%]" />
          <Skeleton className="h-[100px] w-full" />
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 12 Avatar & Separator ─────────────────── */}
      <section className="mb-14">
        <SectionLabel>12 &mdash; Misc</SectionLabel>
        <SectionTitle>Avatar &amp; Separator</SectionTitle>
        <div className="flex gap-3 items-center mb-5">
          <Avatar size="sm"><AvatarFallback>A</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>M</AvatarFallback></Avatar>
          <Avatar size="lg"><AvatarFallback>OR</AvatarFallback></Avatar>
          <Avatar size="lg"><AvatarFallback className="bg-primary text-primary-foreground">S</AvatarFallback></Avatar>
        </div>
        <Separator className="my-4" />
        <div className="flex gap-4 items-center h-10">
          <span className="text-sm">Produit</span>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm">Ingrédient</span>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm">Packaging</span>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 13 Rating ─────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>13 &mdash; Input</SectionLabel>
        <SectionTitle>Rating</SectionTitle>
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">Default (1 step)</div>
            <Rating value={ratingValue} onValueChange={setRatingValue}>
              {Array.from({ length: 5 }, (_, i) => <RatingItem key={i} index={i} />)}
            </Rating>
            <div className="text-xs text-muted-foreground mt-1.5">Note : {ratingValue}/5</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">Read-only</div>
            <Rating value={4} readOnly>
              {Array.from({ length: 5 }, (_, i) => <RatingItem key={i} index={i} />)}
            </Rating>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-2">Half steps</div>
            <Rating defaultValue={3.5} step={0.5}>
              {Array.from({ length: 5 }, (_, i) => <RatingItem key={i} index={i} />)}
            </Rating>
          </div>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 14 Table ──────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>14 &mdash; Data</SectionLabel>
        <SectionTitle>Table</SectionTitle>
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"><Checkbox defaultChecked /></TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Moule Silicone 12 Cavités", cat: "Outils", price: "2,500 DA", stock: 142, status: "success" as const, label: "En stock" },
                { name: "Farine T55 Bio 1kg", cat: "Ingrédients", price: "380 DA", stock: 89, status: "success" as const, label: "En stock" },
                { name: "Boîte Kraft 20×20×10", cat: "Packaging", price: "150 DA", stock: 12, status: "warning" as const, label: "Stock bas" },
                { name: "Colorant Alimentaire Set 6", cat: "Ingrédients", price: "850 DA", stock: 0, status: "destructive" as const, label: "Épuisé" },
              ].map((row) => (
                <TableRow key={row.name}>
                  <TableCell><Checkbox /></TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.cat}</TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.stock}</TableCell>
                  <TableCell><Badge variant={row.status}>{row.label}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon-sm" className="size-7"><MoreHorizontal className="size-3.5" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 15 Chart ──────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>15 &mdash; Data</SectionLabel>
        <SectionTitle>Chart</SectionTitle>
        <Card className="max-w-[540px]">
          <CardHeader>
            <CardTitle className="font-heading text-lg font-normal">Revenus Mensuels</CardTitle>
            <CardDescription>Janvier — Juin 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-14" />

      {/* ── 16 Scroll Area ────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>16 &mdash; Layout</SectionLabel>
        <SectionTitle>Scroll Area</SectionTitle>
        <ScrollArea className="h-[200px] w-[360px] rounded-lg border border-border p-4">
          <div className="text-sm space-y-4">
            <p>Les ingrédients de base pour la pâtisserie algérienne incluent la farine, le sucre, les œufs, et le beurre.</p>
            <p>Les moules silicone sont idéaux pour la pâtisserie car ils permettent une démoulage facile et sont résistants à la chaleur.</p>
            <p>Le packaging est essentiel pour la présentation des gâteaux et pâtisseries en boutique.</p>
            <p>Les colorants alimentaires naturels sont de plus en plus demandés par les clients soucieux de leur santé.</p>
            <p>La livraison à domicile est un service apprécié par les clients d&apos;Alger et des grandes villes.</p>
            <p>Les outils de décoration permettent de créer des motifs élégants sur les gâteaux et tartes.</p>
          </div>
        </ScrollArea>
      </section>

      <Separator className="my-14" />

      {/* ── 17 Kbd ────────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>17 &mdash; Misc</SectionLabel>
        <SectionTitle>Keyboard Shortcuts</SectionTitle>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1.5 text-sm">
            <span>Sauvegarder</span>
            <Kbd>Ctrl</Kbd><Kbd>S</Kbd>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span>Annuler</span>
            <Kbd>Ctrl</Kbd><Kbd>Z</Kbd>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span>Rechercher</span>
            <Kbd>Ctrl</Kbd><Kbd>K</Kbd>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span>Supprimer</span>
            <Kbd>Del</Kbd>
          </div>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 18 Stepper ────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>18 &mdash; Navigation</SectionLabel>
        <SectionTitle>Stepper</SectionTitle>
        <div className="max-w-[540px]">
          <Stepper value={stepperValue} onValueChange={setStepperValue}>
            <StepperItem value="info">
              <StepperTrigger><StepperIndicator /></StepperTrigger>
              <div className="hidden sm:block"><StepperTitle>Informations</StepperTitle><StepperDescription>Données produit</StepperDescription></div>
            </StepperItem>
            <StepperSeparator />
            <StepperItem value="media">
              <StepperTrigger><StepperIndicator /></StepperTrigger>
              <div className="hidden sm:block"><StepperTitle>Médias</StepperTitle><StepperDescription>Photos & vidéos</StepperDescription></div>
            </StepperItem>
            <StepperSeparator />
            <StepperItem value="pricing">
              <StepperTrigger><StepperIndicator /></StepperTrigger>
              <div className="hidden sm:block"><StepperTitle>Prix</StepperTitle><StepperDescription>Tarification</StepperDescription></div>
            </StepperItem>
            <StepperSeparator />
            <StepperItem value="confirm">
              <StepperTrigger><StepperIndicator /></StepperTrigger>
              <div className="hidden sm:block"><StepperTitle>Confirmation</StepperTitle><StepperDescription>Publier</StepperDescription></div>
            </StepperItem>
            <StepperContent value="info" className="mt-4 p-4 border border-border rounded-lg text-sm text-muted-foreground">
              Étape 1 — Remplissez les informations de base du produit (nom, description, catégorie).
            </StepperContent>
            <StepperContent value="media" className="mt-4 p-4 border border-border rounded-lg text-sm text-muted-foreground">
              Étape 2 — Ajoutez les photos et vidéos du produit.
            </StepperContent>
            <StepperContent value="pricing" className="mt-4 p-4 border border-border rounded-lg text-sm text-muted-foreground">
              Étape 3 — Définissez le prix et les options de livraison.
            </StepperContent>
            <StepperContent value="confirm" className="mt-4 p-4 border border-border rounded-lg text-sm text-muted-foreground">
              Étape 4 — Vérifiez et publiez le produit.
            </StepperContent>
          </Stepper>
          <div className="flex gap-2 mt-4">
            <StepperPrev asChild><Button size="sm" variant="outline">Précédent</Button></StepperPrev>
            <StepperNext asChild><Button size="sm">Suivant</Button></StepperNext>
          </div>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 19 Calendar ───────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>19 &mdash; Input</SectionLabel>
        <SectionTitle>Calendar</SectionTitle>
        <Calendar mode="single" selected={calendarDate} onSelect={setCalendarDate} className="rounded-lg border border-border w-fit" />
      </section>

      <Separator className="my-14" />

      {/* ── 20 Dialog & AlertDialog ───────────────── */}
      <section className="mb-14">
        <SectionLabel>20 &mdash; Overlays</SectionLabel>
        <SectionTitle>Dialog &amp; Alert Dialog</SectionTitle>

        <div className="flex flex-wrap gap-3 mb-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Supprimer le produit</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le produit sera définitivement supprimé du catalogue.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction variant="destructive">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet>
            <SheetTrigger asChild><Button size="sm">Ouvrir le panneau</Button></SheetTrigger>
            <SheetContent side={sheetSide}>
              <SheetHeader>
                <SheetTitle>Détails du produit</SheetTitle>
                <SheetDescription>Moule Silicone 12 Cavités — Informations complètes.</SheetDescription>
              </SheetHeader>
              <div className="py-4 text-sm text-muted-foreground space-y-3">
                <p>Le moule silicone 12 cavités est idéal pour la fabrication de gâteaux et tartes individuelles.</p>
                <p>Prix : 2,500 DA</p>
                <p>Stock : 142 unités</p>
              </div>
              <SheetFooter>
                <Button size="sm">Modifier</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">Sheet side :</span>
          {(["right", "left", "top", "bottom"] as const).map((side) => (
            <Button key={side} size="xs" variant={sheetSide === side ? "default" : "outline"} onClick={() => setSheetSide(side)}>{side}</Button>
          ))}
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 21 Drawer ─────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>21 &mdash; Overlays</SectionLabel>
        <SectionTitle>Drawer</SectionTitle>
        <Drawer>
          <DrawerTrigger asChild><Button size="sm">Ouvrir le tiroir</Button></DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Ajouter au panier</DrawerTitle>
              <DrawerDescription>Moule Silicone 12 Cavités — 2,500 DA</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              Sélectionnez la quantité et les options de livraison.
            </div>
            <DrawerFooter>
              <Button>Ajouter — 2,500 DA</Button>
              <DrawerClose asChild><Button variant="outline">Annuler</Button></DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </section>

      <Separator className="my-14" />

      {/* ── 22 Tooltip, Popover, Dropdown ─────────── */}
      <section className="mb-14">
        <SectionLabel>22 &mdash; Overlays</SectionLabel>
        <SectionTitle>Tooltip, Popover &amp; Dropdown</SectionTitle>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="outline" size="sm">Hover me</Button></TooltipTrigger>
              <TooltipContent><p>Information contextuelle</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" size="sm">Open Popover</Button></PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="font-medium text-sm mb-1">Détails du produit</div>
              <p className="text-xs text-muted-foreground">Moule Silicone 12 Cavités — 2,500 DA. En stock.</p>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem><User className="size-4" /> Voir le profil</DropdownMenuItem>
              <DropdownMenuItem><Settings className="size-4" /> Paramètres</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive"><Trash2 className="size-4" /> Supprimer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 23 Command Palette ────────────────────── */}
      <section className="mb-14">
        <SectionLabel>23 &mdash; Navigation</SectionLabel>
        <SectionTitle>Command Palette</SectionTitle>
        <Button size="sm" onClick={() => setCommandOpen(true)} className="gap-2">
          <CommandIcon className="size-4" /> Rechercher <Kbd className="ml-2">Ctrl+K</Kbd>
        </Button>
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandInput placeholder="Rechercher un produit, une commande..." />
          <CommandList>
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
            <CommandGroup heading="Produits">
              <CommandItem><PackageOpen className="size-4" /> Moule Silicone 12 Cavités</CommandItem>
              <CommandItem><PackageOpen className="size-4" /> Farine T55 Bio 1kg</CommandItem>
              <CommandItem><PackageOpen className="size-4" /> Boîte Kraft 20×20×10</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem><Plus className="size-4" /> Créer un produit</CommandItem>
              <CommandItem><User className="size-4" /> Ajouter un client</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </section>

      <Separator className="my-14" />

      {/* ── 24 Toast ──────────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>24 &mdash; Notifications</SectionLabel>
        <SectionTitle>Toast Notifications</SectionTitle>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" size="sm" onClick={() => toast.success("Produit créé", { description: "Ajouté au catalogue avec succès" })}>Succès</Button>
          <Button variant="outline" size="sm" onClick={() => toast.error("Erreur", { description: "Une erreur est survenue" })}>Erreur</Button>
          <Button variant="outline" size="sm" onClick={() => toast.warning("Stock bas", { description: "Il ne reste que 12 articles" })}>Alerte</Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Nouvelle commande", { description: "Commande #2847 reçue" })}>Info</Button>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 25 Empty State ────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>25 &mdash; States</SectionLabel>
        <SectionTitle>Empty State</SectionTitle>
        <Card className="max-w-[480px]">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><PackageOpen className="size-6" /></EmptyMedia>
              <EmptyTitle>Aucun produit</EmptyTitle>
              <EmptyDescription>Commencez par ajouter des produits à votre catalogue pour les vendre en ligne.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button size="sm"><Plus className="size-4" /> Créer un produit</Button></EmptyContent>
          </Empty>
        </Card>
      </section>

      <Separator className="my-14" />

      {/* ── 26 Error State ────────────────────────── */}
      <section className="mb-14">
        <SectionLabel>26 &mdash; States</SectionLabel>
        <SectionTitle>Error State</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-4">
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><WifiOff className="size-6" /></EmptyMedia>
                <EmptyTitle>Connexion perdue</EmptyTitle>
                <EmptyDescription>Vérifiez votre connexion internet et réessayez.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent><Button size="sm"><RefreshCw className="size-4" /> Réessayer</Button></EmptyContent>
            </Empty>
          </Card>
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><OctagonX className="size-6" /></EmptyMedia>
                <EmptyTitle>Erreur serveur</EmptyTitle>
                <EmptyDescription>Une erreur interne s&apos;est produite. L&apos;équipe technique a été notifiée.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent><Button size="sm" variant="outline">Retour à l&apos;accueil</Button></EmptyContent>
            </Empty>
          </Card>
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><XCircle className="size-6" /></EmptyMedia>
                <EmptyTitle>Paiement échoué</EmptyTitle>
                <EmptyDescription>Le paiement par Chargily a été refusé.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button size="sm">Réessayer</Button>
                  <Button size="sm" variant="outline">Changer de moyen</Button>
                </div>
              </EmptyContent>
            </Empty>
          </Card>
        </div>
        <Alert variant="destructive">
          <CircleX className="size-4 shrink-0 mt-0.5" />
          <div>
            <AlertTitle>Erreur de chargement</AlertTitle>
            <AlertDescription>Les données n&apos;ont pas pu être chargées. <Button variant="link" size="sm" className="h-auto p-0 ml-1 text-destructive underline">Réessayer</Button></AlertDescription>
          </div>
        </Alert>
      </section>

      <Separator className="my-14" />

      {/* ── 27 Loading State ──────────────────────── */}
      <section className="mb-14">
        <SectionLabel>27 &mdash; States</SectionLabel>
        <SectionTitle>Loading State</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-4">
          <Card>
            <CardHeader><Skeleton className="h-4 w-[120px]" /><Skeleton className="h-5 w-[200px]" /></CardHeader>
            <CardContent className="space-y-3"><Skeleton className="h-8 w-[160px]" /><Skeleton className="h-3.5 w-[100px]" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-4 w-[100px]" /><Skeleton className="h-5 w-[180px]" /></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-[70%]" /><Skeleton className="h-2.5 w-[45%]" /></div>
              </div>
              <Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-[90%]" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Spinner className="size-6 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Chargement en cours...</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-3 items-center mb-4">
          <Button size="sm" disabled><Loader2 className="size-4 animate-spin" /> Sauvegarde...</Button>
          <Button size="sm" variant="outline" disabled><Loader2 className="size-4 animate-spin" /> Chargement</Button>
        </div>
        <div className="border border-border rounded-lg overflow-hidden bg-card max-w-[540px]">
          <Table>
            <TableHeader><TableRow><TableHead>Produit</TableHead><TableHead>Catégorie</TableHead><TableHead>Prix</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[160px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[70px] rounded-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator className="my-14" />

      {/* ── 28 Success State ──────────────────────── */}
      <section className="mb-14">
        <SectionLabel>28 &mdash; States</SectionLabel>
        <SectionTitle>Success State</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-4">
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><CheckCircle2 className="size-6 text-success" /></EmptyMedia>
                <EmptyTitle>Produit créé</EmptyTitle>
                <EmptyDescription>Moule Silicone 12 Cavités a été ajouté au catalogue avec succès.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2"><Button size="sm">Voir le produit</Button><Button size="sm" variant="outline">Créer un autre</Button></div>
              </EmptyContent>
            </Empty>
          </Card>
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><CheckCircle2 className="size-6 text-success" /></EmptyMedia>
                <EmptyTitle>Commande confirmée</EmptyTitle>
                <EmptyDescription>La commande #2847 a été confirmée et est en cours de traitement.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent><Button size="sm">Voir la commande</Button></EmptyContent>
            </Empty>
          </Card>
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><CheckCircle2 className="size-6 text-success" /></EmptyMedia>
                <EmptyTitle>Paiement reçu</EmptyTitle>
                <EmptyDescription>Le paiement de 2,500 DA a été traité avec succès via Chargily.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent><Button size="sm" variant="outline">Télécharger le reçu</Button></EmptyContent>
            </Empty>
          </Card>
        </div>
        <Alert variant="success">
          <CircleCheck className="size-4 shrink-0 mt-0.5" />
          <div><AlertTitle>Enregistré</AlertTitle><AlertDescription>Les modifications ont été sauvegardées avec succès.</AlertDescription></div>
        </Alert>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="success">Livré</Badge>
          <Badge variant="success">Payé</Badge>
          <Badge variant="success">Confirmé</Badge>
          <Badge variant="success">Envoyé</Badge>
          <Badge variant="success">Approuvé</Badge>
        </div>
      </section>
    </div>
  );
}
