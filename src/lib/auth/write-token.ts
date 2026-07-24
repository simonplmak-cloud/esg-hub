import { timingSafeEqual } from "node:crypto";

const BEARER_PREFIX = "Bearer ";

function extractToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return null;
  }
  const token = header.slice(BEARER_PREFIX.length);
  if (token.length === 0) {
    return null;
  }
  return token;
}

export function validateWriteToken(request: Request): boolean {
  const provided = extractToken(request);
  if (!provided) {
    return false;
  }

  const expected = process.env.ESG_HUB_WRITE_TOKEN;
  if (!expected || expected.length === 0) {
    return false;
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

export function requireWriteToken(request: Request): Response | null {
  if (validateWriteToken(request)) {
    return null;
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Bearer realm="ESG Hub Write API"',
      "Content-Type": "text/plain",
    },
  });
}
