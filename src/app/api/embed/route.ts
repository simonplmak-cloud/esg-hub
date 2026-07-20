import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Embedding API (deprecated)
 * 
 * Embedding generation is now handled client-side using @huggingface/transformers
 * in the browser via WebAssembly. This endpoint is kept for backwards compatibility.
 * 
 * Use the /api/semantic-search endpoint with a pre-computed embedding vector instead.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST() {
  return NextResponse.json(
    {
      message:
        "Embedding generation is now handled client-side. Use the search page for semantic search.",
      redirect: "/search",
    },
    { status: 410 }
  );
}
