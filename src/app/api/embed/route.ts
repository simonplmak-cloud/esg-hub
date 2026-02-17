import { NextRequest, NextResponse } from "next/server";

/**
 * Embedding Generation API
 * 
 * Generates text embeddings using the fastembed Python library via a subprocess.
 * This is a server-side only endpoint that runs the embedding model locally.
 * 
 * POST /api/embed
 * Body: { text: string }
 * Returns: { embedding: number[], dimensions: number }
 */

import { execSync } from "child_process";

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

    // Truncate to reasonable length
    const truncated = text.slice(0, 2000);

    // Generate embedding using Python fastembed
    const escapedText = truncated
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, " ")
      .replace(/\r/g, "");

    const pythonScript = `
import json
from fastembed import TextEmbedding
model = TextEmbedding("BAAI/bge-small-en-v1.5")
emb = list(model.embed(["${escapedText}"]))[0]
print(json.dumps(emb.tolist()))
`;

    const result = execSync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}'`, {
      timeout: 30000,
      encoding: "utf-8",
    });

    const embedding = JSON.parse(result.trim());

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
