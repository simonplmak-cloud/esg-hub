/**
 * Embedding generation using @huggingface/transformers
 * 
 * Uses BAAI/bge-small-en-v1.5 (384 dimensions) — same model used
 * to generate the stored embeddings in SurrealDB.
 * 
 * Configured to use the WASM backend (no native bindings) so it
 * works in Vercel serverless functions.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractorPromise: Promise<any> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      // Disable local model loading — always fetch from HuggingFace Hub
      env.allowLocalModels = false;
      // Force WASM backend (no native onnxruntime-node needed)
      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.numThreads = 1;
      }
      // Use the same model as the stored embeddings
      return await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5", {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dtype: "fp32" as any,
        device: "wasm",
      });
    })();
  }
  return extractorPromise;
}

/**
 * Generate a 384-dimensional embedding vector for the given text.
 * Uses BAAI/bge-small-en-v1.5 via ONNX Runtime WASM (no native bindings).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const truncated = text.slice(0, 2000).replace(/\n/g, " ").replace(/\r/g, "");
  const extractor = await getExtractor();
  const result = await extractor(truncated, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(result.data as Float32Array);
}
