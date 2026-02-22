import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  return NextResponse.json({
    host: request.headers.get("host"),
    "x-forwarded-host": request.headers.get("x-forwarded-host"),
    "x-vercel-deployment-url": request.headers.get("x-vercel-deployment-url"),
    allHeaders: headers,
    url: request.url,
  });
}
