import "server-only";

import { and, count, desc, eq, like, or, asc, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { media, media_usage } from "../db/schema";

export class MediaRepository {
  async find_by_id(id: string) {
    const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
    return row ?? null;
  }

  async find_by_storage_key(storage_key: string) {
    const [row] = await db.select().from(media).where(eq(media.storage_key, storage_key)).limit(1);
    return row ?? null;
  }

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    kind?: string;
    mime_type?: string;
    provider?: string;
    entity_type?: string;
    entity_id?: string;
    is_public?: boolean;
    sort_by?: string;
    sort_order?: string;
  }) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const filters: ReturnType<typeof eq | typeof like>[] = [];

    if (params.kind) filters.push(eq(media.kind, params.kind));
    if (params.mime_type) filters.push(eq(media.mime_type, params.mime_type));
    if (params.provider) filters.push(eq(media.provider, params.provider));
    if (params.is_public !== undefined) filters.push(eq(media.is_public, params.is_public));

    if (params.search) {
      const q = `%${params.search}%`;
      filters.push(or(like(media.filename, q), like(media.original_name, q), like(media.alt, q))!);
    }

    const where = filters.length ? and(...filters) : undefined;

    let order_clause;
    if (params.sort_by === "filename") {
      order_clause = params.sort_order === "asc" ? asc(media.filename) : desc(media.filename);
    } else if (params.sort_by === "size") {
      order_clause = params.sort_order === "asc" ? asc(media.size) : desc(media.size);
    } else {
      order_clause = params.sort_order === "asc" ? asc(media.created_at) : desc(media.created_at);
    }

    if (params.entity_type && params.entity_id) {
      const usage_join_filters = and(
        eq(media_usage.entity_type, params.entity_type),
        eq(media_usage.entity_id, params.entity_id),
      );

      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(media)
          .innerJoin(media_usage, eq(media.id, media_usage.media_id))
          .where(usage_join_filters ? and(where, usage_join_filters) : usage_join_filters)
          .orderBy(order_clause)
          .limit(limit)
          .offset(offset),
        db
          .select({ total: count() })
          .from(media)
          .innerJoin(media_usage, eq(media.id, media_usage.media_id))
          .where(usage_join_filters ? and(where, usage_join_filters) : usage_join_filters),
      ]);

      const total_records = Number(total ?? 0);
      return {
        items: items.map((row) => row.media),
        meta: {
          page,
          limit,
          total_records,
          total_pages: Math.ceil(total_records / limit) || 1,
          has_more: page * limit < total_records,
        },
      };
    }

    const [items, [{ total }]] = await Promise.all([
      db
        .select({
          id: media.id,
          filename: media.filename,
          original_name: media.original_name,
          mime_type: media.mime_type,
          kind: media.kind,
          size: media.size,
          width: media.width,
          height: media.height,
          url: media.url,
          storage_key: media.storage_key,
          provider: media.provider,
          alt: media.alt,
          caption: media.caption,
          metadata: media.metadata,
          is_public: media.is_public,
          uploaded_by: media.uploaded_by,
          created_at: media.created_at,
          updated_at: media.updated_at,
          usage_count: sql<number>`(SELECT COUNT(*) FROM ${media_usage} WHERE ${media_usage.media_id} = ${media.id})`,
        })
        .from(media)
        .where(where)
        .orderBy(order_clause)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(media).where(where),
    ]);

    const total_records = Number(total ?? 0);
    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.ceil(total_records / limit) || 1,
        has_more: page * limit < total_records,
      },
    };
  }

  async get_usages(media_id: string) {
    return db
      .select()
      .from(media_usage)
      .where(eq(media_usage.media_id, media_id))
      .orderBy(desc(media_usage.created_at));
  }

  async get_entity_usages(entity_type: string, entity_id: string) {
    return db
      .select()
      .from(media_usage)
      .where(and(eq(media_usage.entity_type, entity_type), eq(media_usage.entity_id, entity_id)))
      .orderBy(asc(media_usage.sort_order));
  }

  async count_usages(media_id: string) {
    const [result] = await db
      .select({ total: count() })
      .from(media_usage)
      .where(eq(media_usage.media_id, media_id));
    return Number(result?.total ?? 0);
  }

  async find_usage_by_id(id: string) {
    const [row] = await db.select().from(media_usage).where(eq(media_usage.id, id)).limit(1);
    return row ?? null;
  }

  create(data: typeof media.$inferInsert) {
    return db.insert(media).values(data);
  }

  update(id: string, data: Partial<typeof media.$inferInsert>) {
    return db.update(media).set(data).where(eq(media.id, id));
  }

  delete(id: string) {
    return db.delete(media).where(eq(media.id, id));
  }

  create_usage(data: typeof media_usage.$inferInsert) {
    return db.insert(media_usage).values(data);
  }

  update_usage(id: string, data: Partial<typeof media_usage.$inferInsert>) {
    return db.update(media_usage).set(data).where(eq(media_usage.id, id));
  }

  delete_usage(id: string) {
    return db.delete(media_usage).where(eq(media_usage.id, id));
  }

  delete_usages_by_media(media_id: string) {
    return db.delete(media_usage).where(eq(media_usage.media_id, media_id));
  }

  clear_primary_for_entity(entity_type: string, entity_id: string, field?: string) {
    const filters: ReturnType<typeof eq>[] = [
      eq(media_usage.entity_type, entity_type),
      eq(media_usage.entity_id, entity_id),
      eq(media_usage.is_primary, true),
    ];
    if (field) filters.push(eq(media_usage.field, field));
    return db
      .update(media_usage)
      .set({ is_primary: false })
      .where(and(...filters));
  }

  async get_stats() {
    const [total_media, total_images, total_videos, total_documents, total_size] =
      await Promise.all([
        db.select({ total: count() }).from(media),
        db.select({ total: count() }).from(media).where(eq(media.kind, "image")),
        db.select({ total: count() }).from(media).where(eq(media.kind, "video")),
        db.select({ total: count() }).from(media).where(eq(media.kind, "document")),
        db.select({ total: sql<number>`COALESCE(SUM(${media.size}), 0)` }).from(media),
      ]);

    return {
      total_media: Number(total_media[0].total ?? 0),
      total_images: Number(total_images[0].total ?? 0),
      total_videos: Number(total_videos[0].total ?? 0),
      total_documents: Number(total_documents[0].total ?? 0),
      total_size: Number(total_size[0].total ?? 0),
    };
  }
}

export const media_repository = new MediaRepository();
