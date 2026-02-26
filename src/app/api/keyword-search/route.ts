import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import { keywordSearch } from "@/lib/search";

/**
 * Keyword Search API
 * 
 * GET /api/keyword-search?q=query&locale=zh
 * Returns: { results: SearchResult[] }
 */
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q");
    const locale = request.nextUrl.searchParams.get("locale") || "en";

    if (!q || typeof q !== "string") {
      return NextResponse.json(
        { error: "q query parameter is required" },
        { status: 400 }
      );
    }

    const results = await keywordSearch(q, locale);

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Keyword search error:", err);
    return NextResponse.json(
      { error: "Search failed", results: [] },
      { status: 500 }
    );
  }
}
