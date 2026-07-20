/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Heart,
  ShoppingCart,
  Share2,
  Star,
  Truck,
  RotateCcw,
  CircleAlert,
  PackageOpen,
  Clock,
} from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { ProductGallery } from "@/features/product_information_management/products/components/storefront/product-gallery";
import { ProductPrice } from "@/features/product_information_management/products/components/storefront/product-price";
import { ProductRating } from "@/features/product_information_management/products/components/storefront/product-rating";
import { ProductQuantitySelector } from "@/features/product_information_management/products/components/storefront/product-quantity-selector";
import { ProductCard, ProductCardSkeleton } from "@/features/product_information_management/products/components/storefront/product-card";
import type { create_preorder_allocation_dto } from "@/features/order_management_system/preorders/models/preorder.dto";

type PreorderInput = z.infer<typeof create_preorder_allocation_dto>;
import { SectionHeader } from "@/components/storefront/section-header";
import { ProductSpecs } from "@/features/product_information_management/products/components/storefront/product-specs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LabelSelector } from "@/components/ui/label-selector";
import { ColorSwatchSelector } from "@/components/ui/color-swatch-selector";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";
import type { StorefrontProduct } from "@/components/storefront/types";
import { AppLocale } from "@/i18n/config";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

interface Props {
  slug: string;
  locale: AppLocale;
}

function get_or_create_session_key(): string {
  if (typeof window === "undefined") return "";
  let key = localStorage.getItem("session_key");
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem("session_key", key);
  }
  return key;
}

export function ProductDetailClient({ slug, locale }: Props) {
  const t = useTranslations("product_detail");
  const sessionKey = useSessionKey();
  const { data: session } = authClient.useSession();

  const product_query = trpc.products.getBySlug.useQuery({ slug, locale });
  const product_id = product_query.data?.product?.id;

  const reviews_query = trpc.reviews.listByProduct.useQuery(
    { product_id: product_id ?? "", page: 1, limit: 10 },
    { enabled: !!product_id },
  );

  const recommendations_query = trpc.recommendations.byProduct.useQuery(
    { slug, locale, limit: 8 },
    { enabled: !!slug },
  );

  const recent_query = trpc.recommendations.recent.useQuery(
    { locale, session_key: sessionKey, limit: 8 },
    { enabled: !!sessionKey },
  );

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const track_view = trpc.recommendations.trackView.useMutation();
  const create_preorder = trpc.preorders.createAllocation.useMutation();
  useEffect(() => {
    if (product_id && sessionKey) {
      track_view.mutate({ product_id, session_key: sessionKey });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product_id, sessionKey]);

  if (product_query.isLoading) return <ProductDetailSkeleton />;

  if (product_query.error) {
    return (
      <div className="mx-auto container px-4 py-8">
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-1">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {product_query.error instanceof Error
                  ? product_query.error.message
                  : "Une erreur est survenue lors du chargement du produit."}
              </AlertDescription>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  const data = product_query.data;
  if (!data?.product) {
    return (
      <div className="mx-auto container px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageOpen className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Produit non trouvé</EmptyTitle>
            <EmptyDescription>
              Le produit que vous recherchez n&apos;existe pas ou a été retiré.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const { product, translation, media, brand, review_summary, variant_config, sku_list } = data;
  const name = translation?.name ?? product.sku;
  const description = translation?.description ?? "";
  const all_media_urls = media.map((m) => m.url);

  const parsed_metadata: Record<string, unknown> = product.metadata
    ? (JSON.parse(product.metadata) as Record<string, unknown>)
    : {};
  const specs = parsed_metadata.technical_specs as
    | Record<string, string | number | boolean>
    | undefined;
  const spec_items = specs
    ? Object.entries(specs).map(([label, value]) => ({ label, value: String(value) }))
    : [];

  const variant_properties: Array<{
    id: string;
    code: string;
    name: string;
    sort_order: number;
    values: Array<{
      id: string;
      code: string;
      label: string;
      sort_order: number;
      thumbnail_image: string | null;
      color_hex: string | null;
    }>;
  }> = variant_config?.properties ?? [];
  const variant_skus: Array<{
    sku_id: string;
    sku_code: string;
    base_price: string | null;
    offer_price: string | null;
    currency: string | null;
    stock_available: number;
    options: Array<{
      property_code: string | null;
      value_code: string | null;
      value_label: string | null;
      thumbnail_image: string | null;
      color_hex: string | null;
    }>;
  }> = sku_list ?? [];

  const matched_sku = variant_skus.find((sku) =>
    sku.options.every(
      (opt) => opt.property_code && selectedOptions[opt.property_code] === opt.value_code,
    ),
  );

  const matched_sku_thumbnails = matched_sku
    ? matched_sku.options.map((o) => o.thumbnail_image).filter((t): t is string => t !== null)
    : [];
  const images = matched_sku_thumbnails.length > 0 ? matched_sku_thumbnails : all_media_urls;

  const display_price =
    matched_sku?.offer_price ??
    matched_sku?.base_price ??
    product.offer_price ??
    product.base_price;
  const display_original =
    matched_sku?.base_price &&
    matched_sku.offer_price &&
    Number(matched_sku.offer_price) < Number(matched_sku.base_price)
      ? matched_sku.base_price
      : !matched_sku &&
          product.offer_price != null &&
          Number(product.offer_price) < Number(product.base_price)
        ? String(product.base_price)
        : null;
  const display_currency = matched_sku?.currency ?? product.currency;
  const default_sku = variant_skus[0];
  const display_in_stock = matched_sku
    ? matched_sku.stock_available > 0
    : default_sku
      ? default_sku.stock_available > 0
      : true;
  const has_discount = display_original !== null;
  const discount_pct =
    has_discount && display_original
      ? Math.round((1 - Number(display_price) / Number(display_original)) * 100)
      : null;

  return (
    <div className="mx-auto container px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={images} alt={name} />

        <div className="space-y-6">
          {brand && (
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {brand.name}
            </p>
          )}

          <h1 className="font-orla text-3xl leading-tight font-bold">{name}</h1>

          <div className="flex items-center gap-3">
            <ProductPrice
              price={String(display_price)}
              originalPrice={display_original}
              currency={display_currency}
              size="lg"
            />
            {discount_pct && <Badge variant="destructive">-{discount_pct}%</Badge>}
          </div>

          {review_summary && (
            <ProductRating
              rating={Math.round(review_summary.average_rating)}
              reviewCount={review_summary.review_count}
              size="md"
            />
          )}

          {variant_properties.length > 0 && (
            <div className="space-y-4">
              {variant_properties.map((prop) => (
                <VariantPropertyGroup
                  key={prop.id}
                  label={prop.name}
                  values={prop.values}
                  selectedCode={selectedOptions[prop.code] ?? null}
                  onChange={(valueCode) =>
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [prop.code]: prev[prop.code] === valueCode ? "" : valueCode,
                    }))
                  }
                />
              ))}
            </div>
          )}

          {variant_properties.length > 0 && matched_sku === undefined && (
            <p className="text-muted-foreground text-sm">Sélectionnez toutes les options</p>
          )}

          <QuantityAndCartSection
            quantityDefault={1}
            disabled={variant_properties.length > 0 && !matched_sku}
            display_in_stock={display_in_stock}
            sku_id={matched_sku?.sku_id ?? default_sku?.sku_id ?? null}
            session={session ?? null}
            create_preorder={create_preorder}
            onAddToCart={() => {}}
          />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2">
              <Heart className="h-4 w-4" />
              {t("add_to_wishlist")}
            </Button>
            <Button variant="outline" size="icon" className="shrink-0">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <Card className="space-y-2 p-4 text-sm">
            <p className="flex items-center gap-2">
              <Truck className="text-crimson-violet h-4 w-4" />
              {t("free_shipping")}
            </p>
            <p className="flex items-center gap-2">
              <RotateCcw className="text-crimson-violet h-4 w-4" />
              {t("returns")}
            </p>
          </Card>

          <Separator />

          {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
        </div>
      </div>

      <Separator className="my-12" />

      <Tabs defaultValue="description" className="w-full">
        <TabsList
          className="w-full justify-start rounded-none border-b bg-transparent"
          variant="line"
        >
          <TabsTrigger
            value="description"
            className="data-[state=active]:border-crimson-violet rounded-none data-[state=active]:border-b-2"
          >
            {t("description")}
          </TabsTrigger>
          {spec_items.length > 0 && (
            <TabsTrigger
              value="specifications"
              className="data-[state=active]:border-crimson-violet rounded-none data-[state=active]:border-b-2"
            >
              {t("specifications")}
            </TabsTrigger>
          )}
          {(() => {
            const qualifying = (reviews_query.data?.items as Array<{ rating: number }> ?? []).filter(
              (r) => r.rating >= 3,
            );
            if (qualifying.length < 3) return null;
            return (
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:border-crimson-violet rounded-none data-[state=active]:border-b-2"
              >
                {t("reviews_section")}
                <span className="text-muted-foreground ml-1 text-xs">
                  ({qualifying.length})
                </span>
              </TabsTrigger>
            );
          })()}
        </TabsList>

        <TabsContent value="description" className="pt-6">
          <div className="text-muted-foreground leading-relaxed">
            {description || <span className="italic">{t("description_placeholder")}</span>}
          </div>
        </TabsContent>

        {spec_items.length > 0 && (
          <TabsContent value="specifications" className="pt-6">
            <ProductSpecs specs={spec_items} />
          </TabsContent>
        )}

        <TabsContent value="reviews" className="pt-6">
          <ReviewsSection query={reviews_query} />
        </TabsContent>
      </Tabs>

      <Separator className="my-12" />

      {/* Related products */}
      <section className="space-y-6">
        <SectionHeader title={t("related")} />
        {recommendations_query.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : recommendations_query.data ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Object.values(recommendations_query.data)
              .flat()
              .slice(0, 8)
              .map((item) => (
                <ProductCard key={item.id} product={toStorefrontProduct(item)} variant="catalog" />
              ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("recently_viewed_empty")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </section>

      <Separator className="my-12" />

      {/* Recently viewed */}
      <section className="space-y-6">
        <SectionHeader title={t("recently_viewed")} />
        {recent_query.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : recent_query.data && recent_query.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recent_query.data.slice(0, 8).map((item) => (
              <ProductCard key={item.id} product={toStorefrontProduct(item)} variant="catalog" />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("recently_viewed_empty")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </div>
  );
}

// ─── Hook ───

function useSessionKey() {
  const [key] = useState(() => get_or_create_session_key());
  return key;
}

// ─── Helpers ───

function toStorefrontProduct(item: {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  currency: string;
  min_price: string;
  max_price: string | null;
  is_featured: boolean;
  in_stock: boolean;
  brand_name: string | null;
}): StorefrontProduct {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    image_url: item.image_url,
    currency: item.currency,
    min_price: item.min_price,
    max_price: item.max_price,
    is_featured: item.is_featured,
    in_stock: item.in_stock,
    brand_name: item.brand_name,
  };
}

// ─── Sub-components ───

function VariantPropertyGroup({
  label,
  values,
  selectedCode,
  onChange,
}: {
  label: string;
  values: Array<{
    id: string;
    code: string;
    label: string;
    color_hex: string | null;
    thumbnail_image: string | null;
  }>;
  selectedCode: string | null;
  onChange: (code: string) => void;
}) {
  const isColorVariant = values.some((v) => v.color_hex);

  if (isColorVariant) {
    return (
      <ColorSwatchSelector.Root
        value={selectedCode ?? ""}
        onValueChange={onChange}
      >
        <ColorSwatchSelector.Label value={label} />
        <ColorSwatchSelector.Content>
          {values.map((value) => (
            <ColorSwatchSelector.Item
              key={value.id}
              value={value.code}
              color={value.color_hex ?? undefined}
            />
          ))}
        </ColorSwatchSelector.Content>
      </ColorSwatchSelector.Root>
    );
  }

  return (
    <LabelSelector.Root
      value={selectedCode ?? ""}
      onValueChange={onChange}
    >
      <LabelSelector.Label value={label} />
      <LabelSelector.Content>
        {values.map((value) => (
          <LabelSelector.Item
            key={value.id}
            value={value.code}
            label={value.label}
            variant="default"
            rounded="full"
          />
        ))}
      </LabelSelector.Content>
    </LabelSelector.Root>
  );
}

function QuantityAndCartSection({
  quantityDefault,
  disabled,
  display_in_stock,
  sku_id,
  session,
  create_preorder,
  onAddToCart,
}: {
  quantityDefault: number;
  disabled?: boolean;
  display_in_stock: boolean;
  sku_id: string | null;
  session: { user?: { name?: string | null; email?: string | null } } | null;
  create_preorder: { mutateAsync: (input: PreorderInput) => Promise<{ ok: boolean }>; isPending: boolean };
  onAddToCart: (quantity: number) => void;
}) {
  const t = useTranslations("product_detail");
  const [quantity, setQuantity] = useState(quantityDefault);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isOutOfStock = !disabled && !display_in_stock;

  const preorder_form = useForm({
    resolver: zodResolver(
      z.object({
        contact_name: z.string().min(1, "Veuillez saisir votre nom").max(255),
        contact_phone: z.string().max(50).optional().or(z.literal("")),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    ),
    defaultValues: {
      contact_name: session?.user?.name ?? "",
      contact_phone: "",
      quantity,
    },
  });

  const [submitted, setSubmitted] = useState(false);

  async function onPreorder(values: {
    contact_name: string;
    contact_phone?: string;
    quantity: number;
  }) {
    if (!sku_id) return;
    await create_preorder.mutateAsync({
      sku_id,
      quantity: values.quantity,
      contact_name: values.contact_name,
      contact_phone: values.contact_phone || undefined,
    });
    setSubmitted(true);
  }

  return (
    <div className="flex items-center gap-4">
      <ProductQuantitySelector value={quantity} onChange={setQuantity} />

      {isOutOfStock && sku_id ? (
        <ResponsiveDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <ResponsiveDialogTrigger asChild>
            <Button className="flex-1 gap-2" size="lg" disabled={disabled}>
              <Clock className="h-4 w-4" />
              Précommander
            </Button>
          </ResponsiveDialogTrigger>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Précommander</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Soyez informé dès que ce produit sera disponible.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            {submitted ? (
              <div className="py-8 text-center">
                <p className="mb-2 text-lg font-medium">Précommande confirmée</p>
                <p className="text-muted-foreground text-sm">
                  Nous vous contacterons au numero {preorder_form.getValues("contact_phone")} dès
                  que le produit sera disponible.
                </p>
              </div>
            ) : (
              <form onSubmit={preorder_form.handleSubmit(onPreorder)} className="space-y-4 p-1">
                <div className="space-y-2">
                  <label htmlFor="preorder-name" className="text-sm font-medium">
                    Nom complet
                  </label>
                  <Input
                    id="preorder-name"
                    placeholder="Votre nom"
                    {...preorder_form.register("contact_name")}
                  />
                   {preorder_form.formState.errors.contact_name?.message && (
                    <p className="text-destructive text-xs">
                      {String(preorder_form.formState.errors.contact_name.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="preorder-phone" className="text-sm font-medium">
                    Téléphone (optionnel)
                  </label>
                  <Input
                    id="preorder-phone"
                    placeholder="05 XX XX XX XX"
                    {...preorder_form.register("contact_phone")}
                  />
                  {preorder_form.formState.errors.contact_phone?.message && (
                    <p className="text-destructive text-xs">
                      {String(preorder_form.formState.errors.contact_phone.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="preorder-qty" className="text-sm font-medium">
                    Quantité
                  </label>
                  <Input
                    id="preorder-qty"
                    type="number"
                    min={1}
                    max={99}
                    {...preorder_form.register("quantity")}
                  />
                  {preorder_form.formState.errors.quantity?.message && (
                    <p className="text-destructive text-xs">
                      {String(preorder_form.formState.errors.quantity.message)}
                    </p>
                  )}
                </div>
                <ResponsiveDialogFooter>
                  <Button type="submit" disabled={create_preorder.isPending}>
                    {create_preorder.isPending ? "Envoi en cours..." : "Confirmer la précommande"}
                  </Button>
                </ResponsiveDialogFooter>
              </form>
            )}
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      ) : (
        <Button
          className="flex-1 gap-2"
          size="lg"
          disabled={disabled}
          onClick={() => onAddToCart(quantity)}
        >
          <ShoppingCart className="h-4 w-4" />
          {disabled ? "Rupture de stock" : t("add_to_cart")}
        </Button>
      )}
    </div>
  );
}

function ReviewsSection({
  query,
}: {
  query: { isLoading: boolean; error: unknown; data?: { items?: unknown[] } };
}) {
  if (query.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="flex items-start justify-center">
        <Alert variant="destructive" className="max-w-md">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {query.error instanceof Error ? query.error.message : "Impossible de charger les avis."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const reviews = (query.data?.items as Array<{
    id: string;
    author_name: string;
    rating: number;
    title: string | null;
    body: string;
    created_at: string;
  }> ?? []).filter((r) => r.rating >= 3);

  if (!reviews.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Star className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Aucun avis pour le moment.</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <Card key={review.id} className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{review.author_name}</span>
            <ProductRating rating={review.rating} showCount={false} />
          </div>
          {review.title && <p className="text-sm font-semibold">{review.title}</p>}
          <p className="text-muted-foreground text-sm">{review.body}</p>
          <p className="text-muted-foreground text-xs">
            {new Date(review.created_at).toLocaleDateString()}
          </p>
        </Card>
      ))}
    </div>
  );
}

// ─── Loading Skeleton ───

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto container px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square w-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-16 rounded-full" />
            ))}
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32 rounded-md" />
            <Skeleton className="h-12 flex-1 rounded-md" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>

      <Separator className="my-12" />

      <Skeleton className="h-10 w-96 rounded-md" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
