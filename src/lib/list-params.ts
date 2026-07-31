import { sanitize, sanitizeInt } from "@/lib/surrealdb";

export interface ListParams {
  limit: number;
  offset: number;
  q: string;
}

export function parseListParams(params: URLSearchParams): ListParams {
  const limit = sanitizeInt(params.get("limit"), 20, 1, 100);
  const offset = sanitizeInt(params.get("offset"), 0, 0, 100000);
  const q = (params.get("q") ?? "").trim();
  return { limit, offset, q: sanitize(q) };
}
