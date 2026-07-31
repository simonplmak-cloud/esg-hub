import { z } from "zod";

export const SearchParamsSchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  source: z.enum(["all", "pages", "external"]).default("all"),
  mode: z.enum(["keyword", "hybrid"]).default("keyword"),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
  embedding: z.string().optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export const PostSearchBodySchema = z.object({
  embedding: z.array(z.number().finite()).length(384),
  k: z.number().int().min(1).max(50).default(10),
  source: z.enum(["all", "pages", "external"]).default("all"),
});

export type PostSearchBody = z.infer<typeof PostSearchBodySchema>;
