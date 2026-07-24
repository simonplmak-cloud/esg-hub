/**
 * Pipeline Embedder — text embedding via fastembed-js, with golden-vector
 * cross-validation against browser (Transformers.js) vectors.
 *
 * Dependencies: fastembed-js (npm install @huggingface/fastembed)
 * Requires: Node.js 18+
 *
 * Uses FlagEmbedding with BAAI/bge-small-en-v1.5 (384-dimensional vectors).
 *
 * Embedder is a singleton — initEmbedder() caches the instance.
 */

// ---------------------------------------------------------------------------
// Singleton cache
// ---------------------------------------------------------------------------

/** @type {object|null} */
let _embedder = null;
/** @type {Promise<object>|null} */
let _initPromise = null;

/** @type {{ modelRevisionHash?: string, onnxVersion?: string }} */
export const embedderMetadata = {};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Initialize the fastembed-js embedder singleton.
 * Subsequent calls return the cached instance.
 *
 * @returns {Promise<object>} The embedder instance.
 */
export async function initEmbedder() {
  if (_embedder) return _embedder;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      // Dynamic import to avoid requiring the package at module load time
      const fastembed = await import("@huggingface/fastembed");
      const { FlagEmbedding } = fastembed;

      const embedder = await FlagEmbedding.init({
        model: "BAAI/bge-small-en-v1.5",
      });

      // Store metadata
      if (embedder.model && typeof embedder.model.revision === "string") {
        embedderMetadata.modelRevisionHash = embedder.model.revision;
      }
      // ONNX version is typically bound to the fastembed package version
      try {
        const pkg = await import("@huggingface/fastembed/package.json", {
          assert: { type: "json" },
        });
        embedderMetadata.onnxVersion = pkg.default?.dependencies?.onnxruntime_node
          || pkg.default?.dependencies?.onnxruntime_webgpu
          || "unknown";
      } catch {
        embedderMetadata.onnxVersion = "unknown";
      }

      console.error("[initEmbedder] Initialized BAAI/bge-small-en-v1.5", embedderMetadata);

      _embedder = embedder;
      _initPromise = null;
      return _embedder;
    } catch (err) {
      _initPromise = null;
      console.error(`[initEmbedder] initialization failed: ${err.message}`);
      throw err;
    }
  })();

  return _initPromise;
}

/**
 * Embed text(s) into 384-dimensional float vectors.
 *
 * @param {string|string[]} texts - Single string or array of strings
 * @returns {Promise<number[]|number[][]>} 384-d vector (single) or array of vectors (batch)
 */
export async function embed(texts) {
  const embedder = await initEmbedder();

  const input = Array.isArray(texts) ? texts : [texts];
  const isSingle = !Array.isArray(texts);

  try {
    // fastembed returns a 2D array [docs, dim]. Convert to plain arrays.
    const rawIterator = embedder.embed(input);
    const results = [];
    for await (const chunk of rawIterator) {
      results.push(chunk);
    }

    if (isSingle) {
      // Return the first (and only) vector as a plain number array
      const vec = results[0];
      // fastembed may return Float32Array — convert to plain array
      return Array.from(vec);
    }

    return results.map((vec) => Array.from(vec));
  } catch (err) {
    console.error(`[embed] failed: ${err.message}`);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Vector comparison utilities
// ---------------------------------------------------------------------------

/**
 * Cosine similarity between two vectors.
 *
 * @param {number[]|Float32Array} a
 * @param {number[]|Float32Array} b
 * @returns {number} Cosine similarity [-1, 1]
 */
function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = a.length;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dot / denominator;
}

/**
 * Compute top-K overlap between two ranked lists.
 *
 * @param {number[]} listA - Sorted indices (best first)
 * @param {number[]} listB - Sorted indices (best first)
 * @param {number} k
 * @returns {number} Fraction of overlap (0-1)
 */
function topKOverlap(listA, listB, k) {
  const setA = new Set(listA.slice(0, k));
  const setB = new Set(listB.slice(0, k));
  let overlap = 0;
  for (const item of setA) {
    if (setB.has(item)) overlap++;
  }
  return overlap / k;
}

/**
 * NDCG@K for a single ranked list against an ideal (reference) ranking.
 *
 * @param {number[]} idealScores - Relevance scores in ideal order (descending)
 * @param {number[]} actualOrder - Indices in actual ranked order
 * @param {number} k
 * @returns {number} NDCG value [0, 1]
 */
function ndcgAtK(idealScores, actualOrder, k) {
  const actualTop = actualOrder.slice(0, k);
  let dcg = 0;
  for (let i = 0; i < k; i++) {
    const score = idealScores[actualTop[i]] ?? 0;
    dcg += score / Math.log2(i + 2);
  }
  // IDCG: sort ideal scores descending
  const sorted = [...idealScores].sort((a, b) => b - a);
  let idcg = 0;
  for (let i = 0; i < Math.min(k, sorted.length); i++) {
    idcg += sorted[i] / Math.log2(i + 2);
  }
  if (idcg === 0) return 0;
  return dcg / idcg;
}

// ---------------------------------------------------------------------------
// Golden vector verification
// ---------------------------------------------------------------------------

/**
 * Compare browser (Transformers.js) vectors against server (fastembed-js)
 * vectors to verify embedding consistency across runtimes.
 *
 * @param {number[][]|Float32Array[]} browserVectors - Vectors from browser runtime
 * @param {number[][]|Float32Array[]} serverVectors - Vectors from server runtime
 * @param {{ threshold?: number }} [options]
 * @returns {{
 *   passed: boolean,
 *   metrics: { avgCosine: number, top10Overlap: number, ndcgDiff: number },
 *   thresholdResults: { avgCosine: { passed: boolean, value: number, threshold: number } }
 * }}
 */
export function verifyGoldenVectors(browserVectors, serverVectors, options = {}) {
  const threshold = options.threshold ?? 0.95;

  if (!browserVectors || !serverVectors) {
    return {
      passed: false,
      metrics: { avgCosine: 0, top10Overlap: 0, ndcgDiff: 1 },
      thresholdResults: {
        avgCosine: { passed: false, value: 0, threshold },
      },
    };
  }

  const n = Math.min(browserVectors.length, serverVectors.length);

  if (n === 0) {
    return {
      passed: false,
      metrics: { avgCosine: 0, top10Overlap: 0, ndcgDiff: 1 },
      thresholdResults: {
        avgCosine: { passed: false, value: 0, threshold },
      },
    };
  }

  // Compute pairwise cosine similarities
  const cosines = [];
  for (let i = 0; i < n; i++) {
    cosines.push(cosineSimilarity(browserVectors[i], serverVectors[i]));
  }

  const avgCosine = cosines.reduce((s, c) => s + c, 0) / n;

  // Build ranked lists for top-10 overlap and NDCG
  // We compute similarity of each browser vector against all server vectors
  // to build a cross-runtime ranking matrix, then compare.

  // For each server vector, compute similarity to all browser vectors (as scores)
  // Use browser→browser similarity as the "ideal" ranking
  const idealScores = [];
  for (let i = 0; i < n; i++) {
    // "Ideal" score = self-similarity plus similarity to others in same runtime
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += cosineSimilarity(browserVectors[i], browserVectors[j]);
    }
    idealScores.push(sum);
  }

  // Actual ranking from browser→server similarities
  const browserServerSimilarities = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      row.push(cosineSimilarity(browserVectors[i], serverVectors[j]));
    }
    browserServerSimilarities.push(row);
  }

  // For each browser vector, get the top-N server indices
  const browserRankings = browserServerSimilarities.map((row) => {
    return row
      .map((score, idx) => ({ score, idx }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.idx);
  });

  // Ideal ranking: each vector's own index first, then by similarity
  const idealRankings = [];
  for (let i = 0; i < n; i++) {
    const similarities = [];
    for (let j = 0; j < n; j++) {
      similarities.push({ score: cosineSimilarity(browserVectors[i], browserVectors[j]), idx: j });
    }
    idealRankings.push(
      similarities.sort((a, b) => b.score - a.score).map((item) => item.idx)
    );
  }

  // Top-10 overlap: average overlap across all vectors
  const overlaps = [];
  for (let i = 0; i < n; i++) {
    overlaps.push(topKOverlap(idealRankings[i], browserRankings[i], Math.min(10, n)));
  }
  const top10Overlap = overlaps.reduce((s, o) => s + o, 0) / n;

  // NDCG@10 difference
  const ndcgsBrowser = [];
  const ndcgsServer = [];
  for (let i = 0; i < n; i++) {
    ndcgsBrowser.push(ndcgAtK(idealScores, idealRankings[i], Math.min(10, n)));
    ndcgsServer.push(ndcgAtK(idealScores, browserRankings[i], Math.min(10, n)));
  }
  const avgNdcgBrowser =
    ndcgsBrowser.reduce((s, v) => s + v, 0) / n;
  const avgNdcgServer =
    ndcgsServer.reduce((s, v) => s + v, 0) / n;
  const ndcgDiff = Math.abs(avgNdcgBrowser - avgNdcgServer);

  const avgCosinePassed = avgCosine >= threshold;

  return {
    passed: avgCosinePassed,
    metrics: {
      avgCosine: Math.round(avgCosine * 1e6) / 1e6,
      top10Overlap: Math.round(top10Overlap * 1e6) / 1e6,
      ndcgDiff: Math.round(ndcgDiff * 1e6) / 1e6,
    },
    thresholdResults: {
      avgCosine: {
        passed: avgCosinePassed,
        value: Math.round(avgCosine * 1e6) / 1e6,
        threshold,
      },
    },
  };
}
