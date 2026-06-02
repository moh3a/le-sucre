import { json_ok, json_error } from "@/lib/http";
import { get_storefront_identity } from "@/features/order_management_system/carts/cart-context.helper";
import { review_service } from "@/features/product_reviews_management/services/review.service";
import { product_repository } from "@/features/product_information_management/products/repositories/product.repository";
import { z } from "zod";
import { REVIEW_SORT } from "@/features/product_reviews_management/constants/review-status";

const list_reviews_dto = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.enum(Object.keys(REVIEW_SORT) as [keyof typeof REVIEW_SORT]).optional(),
});

const create_review_dto = z.object({
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().min(3).max(200),
    content: z.string().min(20).max(5000),
    locale: z.enum(["en", "fr"]).default("en"),
});

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;
        const product = await product_repository.find_by_slug(slug);
        if (!product) {
            return json_error(new Error("Product not found"), 404);
        }

        const url = new URL(req.url);
        const input = list_reviews_dto.parse({
            page: url.searchParams.get("page"),
            limit: url.searchParams.get("limit"),
            sort: url.searchParams.get("sort"),
        });

        const summary = await review_service.get_product_summary(product.id);
        const reviews = await review_service.list_product_reviews({
            product_id: product.id,
            page: input.page,
            limit: input.limit,
            sort: input.sort || "newest",
            verified_only: true,
        });

        return json_ok({ summary, reviews });
    } catch (e) {
        return json_error(e);
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const identity = await get_storefront_identity(req.headers);
        if (!identity.user_id) {
            return json_error(new Error("Unauthorized"), 401);
        }

        const { slug } = await params;
        const product = await product_repository.find_by_slug(slug);
        if (!product) {
            return json_error(new Error("Product not found"), 404);
        }

        const body = await req.json();
        const input = create_review_dto.parse(body);

        const review = await review_service.create_review(identity.user_id, {
            product_id: product.id,
            rating: input.rating,
            title: input.title,
            body: input.content,
            locale: input.locale,
        });

        return json_ok(review);
    } catch (e) {
        return json_error(e);
    }
}
