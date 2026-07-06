import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { catalog_search_dto, catalog_facets_dto } from "./models/search.dto";
import { search_service } from "./services/search.service";
import { compare_service } from "./services/compare.service";

export const catalog_router = create_trpc_router({
  search: public_procedure
    .input(catalog_search_dto)
    .query(({ input }) => search_service.search(input)),
  facets: public_procedure
    .input(catalog_facets_dto)
    .query(({ input }) => search_service.facets(input)),
  compare: public_procedure
    .input(z.object({
      slugs: z.array(z.string()).default([]),
      locale: z.enum(["fr", "en", "ar"]).default("fr"),
    }))
    .query(({ input }) => compare_service.get_compare_data(input.slugs, input.locale)),
});
