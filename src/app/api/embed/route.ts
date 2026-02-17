import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddings";

/**
 * Embedding Generation API
 * 
 * Generates text embeddings using @huggingface/transformers (ONNX Runtime).
 * Uses BAAI/bge-small-en-v1.5 model (384 dimensions).
 * 
 * POST /api/embed
 * Body: { text: string }
 * Returns: { embedding: number[], dimensions: number }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text string is required" },
        { status: 400 }
      );
    }

    const embedding = await generateEmbedding(text);

    return NextResponse.json({
      embedding,
      dimensions: embedding.length,
    });
  } catch (err) {
    console.error("Embedding generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate embedding" },
      { status: 500 }
    );
  }
}
