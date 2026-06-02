import z from "zod";
import { ProductTranslationsPanel } from "../product-translations-panel";
import { upsert_translation_dto } from "../../models/product.dto";

export function ProductDetailGeneralTab({
  product,
  product_id,
  translations,
}: {
  product_id: string;
  product: {
    sku: string;
    slug: string;
    status: string;
    base_price: string;
    offer_price: string | null;
    currency: string;
  };
  translations: Array<z.infer<typeof upsert_translation_dto>>;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Statut</p>
          <p className="font-medium">{product.status}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Prix</p>
          <p className="font-medium">
            {product.base_price} {product.currency}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Promo</p>
          <p className="font-medium">{product.offer_price ?? "—"}</p>
        </div>
      </div>
      <ProductTranslationsPanel product_id={product_id} translations={translations} />
    </>
  );
}
