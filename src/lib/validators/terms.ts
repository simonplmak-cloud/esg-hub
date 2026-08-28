import { z } from "zod";

export const TermProposalSchema = z.object({
  name: z.string().min(1).max(500).transform((s) => s.trim()),
  definition: z.string().min(1).max(10000).transform((s) => s.trim()),
  facets: z.record(z.string(), z.unknown()).optional(),
  source_urls: z.array(z.string().url()).optional(),
});

export type TermProposal = z.infer<typeof TermProposalSchema>;

export const ListTermsParamsSchema = z.object({
  q: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(100000).default(0),
});

export type ListTermsParams = z.infer<typeof ListTermsParamsSchema>;
