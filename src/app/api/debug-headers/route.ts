import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Temporary: expose env var presence (not values) for deployment debugging
  const envCheck = {
    SURREAL_ENDPOINT: !!process.env.SURREAL_ENDPOINT ? `set (${(process.env.SURREAL_ENDPOINT || "").substring(0, 20)}...)` : "MISSING",
    SURREAL_USERNAME: !!process.env.SURREAL_USERNAME ? "set" : "MISSING",
    SURREAL_PASSWORD: !!process.env.SURREAL_PASSWORD ? `set (len=${(process.env.SURREAL_PASSWORD || "").length})` : "MISSING",
    SURREAL_NAMESPACE: process.env.SURREAL_NAMESPACE || "MISSING",
    SURREAL_DATABASE: process.env.SURREAL_DATABASE || "MISSING",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  return NextResponse.json({
    host: request.headers.get("host"),
    "x-forwarded-host": request.headers.get("x-forwarded-host"),
    "x-vercel-deployment-url": request.headers.get("x-vercel-deployment-url"),
    envCheck,
    url: request.url,
  });
}
