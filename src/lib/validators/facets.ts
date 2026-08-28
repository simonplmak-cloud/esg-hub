import { z } from "zod";

const VALID_TOPICS = [
  "environmental", "social", "governance", "standards", "sdg",
  "frameworks", "finance", "hk-apac", "emerging-topics",
  "learning", "ratings", "regulations",
] as const;

const VALID_INDUSTRIES = [
  "financial-services", "energy", "manufacturing", "real-estate",
  "technology", "agriculture", "healthcare", "transportation",
] as const;

const VALID_FRAMEWORKS = [
  "gri", "issb", "esrs", "tcfd", "sasb", "cdp", "tnfd",
  "ungc", "sdgs", "pri", "iirc", "csrd", "sfdr",
  "eu-taxonomy", "sec-climate", "hkex-esg",
] as const;

const VALID_JURISDICTIONS = [
  "eu", "us", "hk", "cn", "jp", "sg", "uk", "global", "in",
] as const;

const VALID_STAKEHOLDERS = [
  "investor", "regulator", "company", "ngo", "academic", "public",
] as const;

const VALID_CONTENT_TYPES = [
  "standard_text", "regulation", "framework", "guidance",
  "report", "article", "glossary_term", "entity_profile",
] as const;

export const FacetUpdateSchema = z.object({
  facets: z.object({
    topic: z.array(z.enum(VALID_TOPICS)).optional(),
    industry: z.array(z.enum(VALID_INDUSTRIES)).optional(),
    framework: z.array(z.enum(VALID_FRAMEWORKS)).optional(),
    jurisdiction: z.array(z.enum(VALID_JURISDICTIONS)).optional(),
    stakeholder: z.array(z.enum(VALID_STAKEHOLDERS)).optional(),
    content_type: z.enum(VALID_CONTENT_TYPES).optional(),
  }),
});

export type FacetUpdate = z.infer<typeof FacetUpdateSchema>;
