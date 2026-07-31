#!/usr/bin/env node
/**
 * Search evaluation benchmark (specs/esg-hub-km-transformation, tasks.md E2-4).
 *
 * Loads hand-labeled queries, runs each against the search API, computes
 * nDCG@10 and MRR, and asserts minimum quality thresholds.
 *
 *   node scripts/eval-search.mjs [--base http://localhost:3000]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchPageIndex, buildSlugMap, expandLabels, isRelevant } from "./lib/eval-resolver.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const EVAL_MODE = process.env.EVAL_MODE || "keyword";
const QUERIES_PATH = path.join(ROOT, "specs/esg-hub-km-transformation/eval-queries.json");
const LIMIT = 10;

const THRESHOLD_NDCG = 0.6;
const THRESHOLD_MRR = 0.5;

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function loadQueries(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const queries = JSON.parse(raw);
  if (!Array.isArray(queries)) throw new Error("eval-queries.json must be an array");
  for (const q of queries) {
    if (!q.query || !Array.isArray(q.relevant)) {
      throw new Error(`Invalid query entry: ${JSON.stringify(q)}`);
    }
  }
  return queries;
}

/**
 * Search the API via GET /api/v1/search.
 * Mode-aware: keyword mode returns `body.data`, hybrid mode returns `body.results`.
 */
async function search(query, mode = "keyword") {
  const url = new URL(`${API_BASE}/api/v1/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(LIMIT));
  url.searchParams.set("mode", mode);

  const res = await fetch(url.href, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Search API returned ${res.status}: ${await res.text().catch(() => "")}`);
  const body = await res.json();
  const items = mode === "hybrid" ? (body.results ?? []) : (body.data ?? []);
  return Array.isArray(items) ? items : [];
}

/**
 * Check if a result matches any relevant label (resolved via the page index).
 */
function isRelevantResult(resultId, permalink, relevantSet) {
  return isRelevant({ id: resultId, permalink }, relevantSet);
}

/**
 * DCG@k = sum(reli / log2(i+2))  where i is 0-indexed.
 */
function dcg(results, relevantSet, k) {
  let score = 0;
  for (let i = 0; i < Math.min(results.length, k); i++) {
    const rel = isRelevantResult(results[i].id, results[i].permalink, relevantSet);
    if (rel) {
      score += rel / Math.log2(i + 2);
    }
  }
  return score;
}

/**
 * IDCG@k: ideal DCG — sort relevants by gain descending, take top k.
 * All gains are 1 (binary relevance), so IDCG = sum_{j=0}^{min(k, |relevant|)-1} 1/log2(j+2)
 */
function idcg(relevantSet, k) {
  const n = Math.min(relevantSet.length, k);
  let score = 0;
  for (let j = 0; j < n; j++) {
    score += 1 / Math.log2(j + 2);
  }
  return score;
}

/**
 * MRR: 1 / (rank of first relevant result + 1). Returns 0 if none found.
 */
function mrr(results, relevantSet) {
  for (let i = 0; i < results.length; i++) {
    if (isRelevantResult(results[i].id, results[i].permalink, relevantSet)) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

async function main() {
  console.log(`ESG Hub Search Evaluation\n`);
  console.log(`  API base : ${API_BASE}`);
  console.log(`  Mode     : ${EVAL_MODE}`);
  console.log(`  Queries  : ${QUERIES_PATH}`);
  console.log(`  Limit    : ${LIMIT}\n`);

  let queries;
  try {
    queries = loadQueries(QUERIES_PATH);
  } catch (err) {
    console.error(`${RED}Failed to load queries: ${err.message}${RESET}`);
    process.exit(1);
  }
  console.log(`  Loaded ${queries.length} queries\n`);

  const details = [];
  let sumNdcg = 0;
  let sumMrr = 0;
  let failures = 0;

  // Resolve slug-style labels (page:climate-change) to real record IDs + permalinks.
  let slugMap;
  try {
    console.log(`  Resolving page labels via ${API_BASE}/api/v1/pages ...`);
    const pageIndex = await fetchPageIndex(API_BASE);
    slugMap = buildSlugMap(pageIndex);
    console.log(`  Indexed ${pageIndex.length} pages\n`);
  } catch (err) {
    console.error(`${YELLOW}WARN${RESET} label resolution failed (${err.message}); falling back to exact-ID matching`);
    slugMap = new Map();
  }

  for (let idx = 0; idx < queries.length; idx++) {
    const { query, relevant } = queries[idx];
    const relevantSet = expandLabels(relevant, slugMap);
    const label = `[${String(idx + 1).padStart(2, "0")}/${queries.length}]`;
    process.stdout.write(`${label} "${query}" ... `);

    let results;
    try {
      results = await search(query, EVAL_MODE);
    } catch (err) {
      console.log(`${RED}ERROR${RESET} (${err.message})`);
      details.push({ query, relevant, ndcg: 0, mrr: 0, resultsFound: 0, error: err.message });
      failures++;
      continue;
    }

    const dcgScore = dcg(results, relevant, LIMIT);
    const idcgScore = idcg(relevant, LIMIT);
    const ndcgScore = idcgScore > 0 ? dcgScore / idcgScore : 0;
    const mrrScore = mrr(results, relevant);

    sumNdcg += ndcgScore;
    sumMrr += mrrScore;

    const topIds = results.slice(0, 5).map(r => r.id).join(", ");
    const status = ndcgScore >= 0.5 ? `${GREEN}OK${RESET}` : `${YELLOW}LOW${RESET}`;
    console.log(`${status}  nDCG=${ndcgScore.toFixed(3)}  MRR=${mrrScore.toFixed(3)}  top=[${topIds}]`);

    details.push({
      query,
      relevant,
      ndcg: Math.round(ndcgScore * 10000) / 10000,
      mrr: Math.round(mrrScore * 10000) / 10000,
      resultsFound: results.length,
      topResults: results.slice(0, 5).map(r => ({ id: r.id, title: r.title })),
    });
  }

  const avgNdcg = sumNdcg / queries.length;
  const avgMrr = sumMrr / queries.length;
  const pass = avgNdcg >= THRESHOLD_NDCG && avgMrr >= THRESHOLD_MRR;

  console.log(`\n${pass ? GREEN : RED}${"─".repeat(60)}${RESET}`);
  console.log(`  Aggregate nDCG@${LIMIT} : ${avgNdcg.toFixed(4)}  (threshold: ${THRESHOLD_NDCG})`);
  console.log(`  Aggregate MRR            : ${avgMrr.toFixed(4)}  (threshold: ${THRESHOLD_MRR})`);
  console.log(`  Result                   : ${pass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`}`);
  console.log(`${pass ? GREEN : RED}${"─".repeat(60)}${RESET}\n`);

  const output = {
    pass,
    nDCG: Math.round(avgNdcg * 10000) / 10000,
    MRR: Math.round(avgMrr * 10000) / 10000,
    thresholds: { nDCG: THRESHOLD_NDCG, MRR: THRESHOLD_MRR },
    queries: queries.length,
    failures,
    details,
  };

  // Write JSON output for CI parsing
  const outPath = path.join(ROOT, "eval-search-results.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Results written to ${outPath}\n`);

  if (!pass) {
    console.log(`${JSON.stringify(output)}`);
  }

  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(`${RED}Fatal: ${err.message}${RESET}`);
  process.exit(1);
});
