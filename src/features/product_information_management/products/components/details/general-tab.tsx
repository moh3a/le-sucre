import z from "zod";

import { ProductTranslationsPanel } from "../product-translations-panel";
import { ProductStatusBadge } from "../product-status-badge";
import { product_details_dto, upsert_translation_dto } from "../../models/product.dto";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProductDetailGeneralTab({
  product,
  product_id,
  translations,
}: {
  product_id: string;
  product: z.infer<typeof product_details_dto>;
  translations: Array<z.infer<typeof upsert_translation_dto>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
        <CardDescription>Manage main product details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card className="col-span-2 md:col-span-3">
            <CardHeader>
              <CardTitle>Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Slug: <span className="font-semibold">{product.slug}</span>
              </p>
              <p>
                Keywords:{" "}
                <span>
                  {product.keywords?.split(",").map((keyword) => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </span>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductStatusBadge status={product.status} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Prix</CardTitle>
            </CardHeader>
            <CardContent>
              {product.base_price} {product.currency}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Promo</CardTitle>
            </CardHeader>
            <CardContent>{product.offer_price ?? "—"}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>{product.category_id}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Marque</CardTitle>
            </CardHeader>
            <CardContent>{product.brand_id}</CardContent>
          </Card>
        </div>
        <ProductTranslationsPanel product_id={product_id} translations={translations} />
      </CardContent>
    </Card>
  );
}
