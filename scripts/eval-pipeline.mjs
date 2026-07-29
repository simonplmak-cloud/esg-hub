#!/usr/bin/env node
/**
 * Pipeline quality evaluation (specs/esg-hub-km-transformation, tasks.md E2-5).
 *
 * Loads content_enhancement_log entries with status approved/rejected,
 * groups by job_id to pair extractor confidence with human review outcomes,
 * and computes Expected Calibration Error (ECE) + field-level metrics.
 *
 *   node scripts/eval-pipeline.mjs [--window-days 30]
 */

import { getDbEnv } from "./lib/db-env.mjs";

const env = getDbEnv();
const args = process.argv.slice(2);
const windowIdx = args.indexOf("--window-days");
const WINDOW_DAYS = windowIdx > -1 ? parseInt(args[windowIdx + 1], 10) || 30 : 30;

const THRESHOLD_ECE = 0.15;
const THRESHOLD_F1_DROP = 0.05;
const MIN_SAMPLE = 10;

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

/**
 * Execute a SurrealDB query via the /sql endpoint. Returns the result of the first statement.
 */
async function q(body) {
  const res = await fetch(`${env.endpoint}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
      "surreal-ns": env.namespace,
      "surreal-db": env.database,
      Authorization: "Basic " + Buffer.from(`${env.username}:${env.password}`).toString("base64"),
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SurrealDB error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const result = data[0]?.result;
  return Array.isArray(result) ? result : [];
}

async function main() {
  console.log(`${CYAN}ESG Hub Pipeline Evaluation${RESET}\n`);
  console.log(`  Window        : ${WINDOW_DAYS} days`);
  console.log(`  Min samples   : ${MIN_SAMPLE} per window/slice`);
  console.log(`  ECE threshold : ${THRESHOLD_ECE}`);
  console.log(`  F1 drop max   : ${THRESHOLD_F1_DROP}\n`);

  // Query reviewed entries
  const reviewedSql = `
    SELECT
      id,
      job_id,
      authority_score,
      status,
      target_table,
      proposed_changes,
      created_at,
      reviewer
    FROM content_enhancement_log
    WHERE status IN ["approved", "rejected"]
    ORDER BY created_at DESC
    LIMIT 1000;
  `;

  let entries;
  try {
    entries = await q(reviewedSql);
  } catch (err) {
    console.error(`${RED}Query failed: ${err.message}${RESET}`);
    process.exit(1);
  }

  if (!entries || entries.length === 0) {
    console.log(`${YELLOW}No reviewed entries found in content_enhancement_log.${RESET}`);
    console.log(`\n${JSON.stringify({ pass: null, reason: "no_data", ece: 0, metrics: {}, samples: 0 })}`);
    process.exit(0);
  }

  console.log(`  Loaded ${entries.length} reviewed entries\n`);

  // Filter by window if created_at exists
  const cutoff = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString();
  const windowed = entries.filter((e) => {
    if (!e.created_at) return true;
    return String(e.created_at) >= cutoff;
  });

  if (windowed.length < entries.length) {
    console.log(`  Windowed to ${windowed.length} entries (since ${cutoff.slice(0, 10)})\n`);
  }

  // Group by job_id
  const byJob = new Map();
  for (const entry of windowed) {
    const jid = String(entry.job_id || entry.id);
    if (!byJob.has(jid)) {
      byJob.set(jid, []);
    }
    byJob.get(jid).push(entry);
  }

  console.log(`  Unique jobs: ${byJob.size}\n`);

  // --- ECE computation ---
  // For each entry: correct = (status === "approved"), confidence = authority_score
  // Bin confidence into 10 bins, compute calibration error

  const BINS = 10;
  const binCorrect = new Array(BINS).fill(0);
  const binTotal = new Array(BINS).fill(0);
  const binConfSum = new Array(BINS).fill(0);

  for (const entry of windowed) {
    const conf = typeof entry.authority_score === "number" ? entry.authority_score : null;
    if (conf === null || conf < 0 || conf > 1) continue;
    const correct = entry.status === "approved" ? 1 : 0;
    const binIdx = Math.min(Math.floor(conf * BINS), BINS - 1);
    binCorrect[binIdx] += correct;
    binTotal[binIdx] += 1;
    binConfSum[binIdx] += conf;
  }

  const totalWithConf = binTotal.reduce((a, b) => a + b, 0);
  let ece = 0;

  const binDetails = [];
  for (let b = 0; b < BINS; b++) {
    const count = binTotal[b];
    if (count === 0) continue;
    const accuracy = binCorrect[b] / count;
    const avgConf = binConfSum[b] / count;
    const binEce = Math.abs(accuracy - avgConf) * (count / totalWithConf);
    ece += binEce;
    binDetails.push({
      bin: `[${(b / BINS).toFixed(1)}, ${((b + 1) / BINS).toFixed(1)})`,
      count,
      accuracy: Math.round(accuracy * 1000) / 1000,
      avgConfidence: Math.round(avgConf * 1000) / 1000,
      contribution: Math.round(binEce * 1000) / 1000,
    });
  }

  // --- Field-level metrics ---
  // proposed_changes is an object mapping field names to { old, new } or direct values.
  // For each entry, each field in proposed_changes is treated as a prediction:
  //   approved → TP for those fields
  //   rejected → FP for those fields
  // This is coarse — without per-field human labels, we assume:
  //   * An "approved" entry means ALL proposed fields were correct → TP for all
  //   * A "rejected" entry means at least one field was incorrect, but we can't tell which.
  //     We assign all fields as FP (conservative estimate).

  const fieldCounts = {}; // field → { tp, fp, fn, tn }
  let _fieldEntriesUsed = 0;

  for (const entry of windowed) {
    const changes = entry.proposed_changes;
    if (!changes || typeof changes !== "object") continue;
    const fields = Object.keys(changes);
    if (fields.length === 0) continue;

    for (const field of fields) {
      if (!fieldCounts[field]) {
        fieldCounts[field] = { tp: 0, fp: 0, fn: 0, tn: 0 };
      }
      if (entry.status === "approved") {
        fieldCounts[field].tp += 1;
      } else {
        fieldCounts[field].fp += 1;
      }
    }
  }

  const fieldMetrics = {};
  for (const [field, counts] of Object.entries(fieldCounts)) {
    const precision = counts.tp + counts.fp > 0 ? counts.tp / (counts.tp + counts.fp) : 0;
    const recall = counts.tp + counts.fn > 0 ? counts.tp / (counts.tp + counts.fn) : 1;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const total = counts.tp + counts.fp;
    fieldMetrics[field] = {
      precision: Math.round(precision * 1000) / 1000,
      recall: Math.round(recall * 1000) / 1000,
      f1: Math.round(f1 * 1000) / 1000,
      samples: total,
    };
  }

  // --- Slice by target_table (proxy for source_type when not on join) ---
  const tableSlices = {};
  for (const entry of windowed) {
    const tbl = entry.target_table || "unknown";
    if (!tableSlices[tbl]) tableSlices[tbl] = { approved: 0, rejected: 0 };
    if (entry.status === "approved") tableSlices[tbl].approved++;
    else tableSlices[tbl].rejected++;
  }

  const sliceMetrics = {};
  for (const [slice, counts] of Object.entries(tableSlices)) {
    const total = counts.approved + counts.rejected;
    sliceMetrics[slice] = {
      total,
      approved: counts.approved,
      rejected: counts.rejected,
      approvalRate: total > 0 ? Math.round((counts.approved / total) * 10000) / 100 : 0,
      sufficient: total >= MIN_SAMPLE,
    };
  }

  // --- Compute baselines & alerts ---
  ece = Math.round(ece * 10000) / 10000;

  // Approval rate
  const totalApproved = windowed.filter((e) => e.status === "approved").length;
  const totalRejected = windowed.filter((e) => e.status === "rejected").length;
  const approvalRate =
    totalApproved + totalRejected > 0
      ? Math.round((totalApproved / (totalApproved + totalRejected)) * 10000) / 100
      : 0;

  // Check thresholds
  const alerts = [];
  const sufficientSample = totalWithConf >= MIN_SAMPLE;

  if (!sufficientSample) {
    alerts.push(`${YELLOW}Insufficient data: ${totalWithConf} entries with confidence (need ≥${MIN_SAMPLE})${RESET}`);
  }

  if (sufficientSample && ece > THRESHOLD_ECE) {
    alerts.push(`${RED}ECE ${ece} exceeds threshold ${THRESHOLD_ECE}${RESET}`);
  }

  for (const [field, metrics] of Object.entries(fieldMetrics)) {
    if (metrics.samples >= MIN_SAMPLE && metrics.f1 < 1 - THRESHOLD_F1_DROP) {
      // Baseline is treated as 1.0 (all correct); alert on significant drop
      const drop = 1 - metrics.f1;
      if (drop > THRESHOLD_F1_DROP) {
        alerts.push(
          `${RED}Field "${field}" F1=${metrics.f1.toFixed(3)} (drop=${drop.toFixed(3)} > ${THRESHOLD_F1_DROP}, ${metrics.samples} samples)${RESET}`
        );
      }
    }
  }

  for (const [slice, metrics] of Object.entries(sliceMetrics)) {
    if (!metrics.sufficient) {
      alerts.push(`${YELLOW}Slice "${slice}": insufficient data (${metrics.total} < ${MIN_SAMPLE})${RESET}`);
    }
  }

  const pass = sufficientSample && alerts.length === 0;

  // --- Output ---
  console.log(`${CYAN}── Calibration ──${RESET}`);
  console.log(`  ECE          : ${ece.toFixed(4)}  ${ece > THRESHOLD_ECE ? RED + "⚠ exceeds threshold" + RESET : GREEN + "✓" + RESET}`);
  console.log(`  Brier (ECE)  : ${ece.toFixed(4)}`);
  console.log(`  Approval rate: ${approvalRate.toFixed(1)}%  (${totalApproved} approved / ${totalRejected} rejected)`);
  console.log(`  With conf    : ${totalWithConf}\n`);

  if (binDetails.length > 0) {
    console.log(`${CYAN}── Confidence Bins ──${RESET}`);
    for (const bin of binDetails) {
      console.log(`  ${bin.bin.padEnd(10)}  count=${String(bin.count).padEnd(4)}  acc=${bin.accuracy.toFixed(3)}  avg_conf=${bin.avgConfidence.toFixed(3)}  contribution=${bin.contribution.toFixed(4)}`);
    }
    console.log();
  }

  if (Object.keys(fieldMetrics).length > 0) {
    console.log(`${CYAN}── Field-level Metrics ──${RESET}`);
    for (const [field, m] of Object.entries(fieldMetrics)) {
      const icon = m.samples >= MIN_SAMPLE ? "" : `${YELLOW}(<${MIN_SAMPLE})${RESET}`;
      console.log(`  ${field.padEnd(20)}  P=${m.precision.toFixed(3)}  R=${m.recall.toFixed(3)}  F1=${m.f1.toFixed(3)}  (${m.samples} samples) ${icon}`);
    }
    console.log();
  }

  if (Object.keys(sliceMetrics).length > 0) {
    console.log(`${CYAN}── Slices (by target_table) ──${RESET}`);
    for (const [slice, m] of Object.entries(sliceMetrics)) {
      const icon = m.sufficient ? GREEN + "✓" + RESET : YELLOW + "insufficient" + RESET;
      console.log(`  ${slice.padEnd(20)}  ${m.total} total  ${m.approved}A / ${m.rejected}R  rate=${m.approvalRate}%  ${icon}`);
    }
    console.log();
  }

  // Alerts
  if (alerts.length > 0) {
    console.log(`${YELLOW}── Alerts ──${RESET}`);
    for (const a of alerts) {
      console.log(`  ${a}`);
    }
    console.log();
  }

  console.log(`${pass ? GREEN : RED}${"─".repeat(50)}${RESET}`);
  console.log(`  Result: ${pass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`}`);
  if (!sufficientSample) {
    console.log(`  (insufficient data — need ≥${MIN_SAMPLE} entries with confidence scores)`);
  }
  console.log(`${pass ? GREEN : RED}${"─".repeat(50)}${RESET}\n`);

  const output = {
    pass,
    ece: ece,
    approvalRate,
    totalEntries: windowed.length,
    entriesWithConfidence: totalWithConf,
    uniqueJobs: byJob.size,
    binDetails,
    fieldMetrics,
    slices: sliceMetrics,
    alerts: alerts.map((a) => a.replace(/\x1b\[\d+m/g, "")),
    insufficientSample: !sufficientSample,
  };

  console.log(JSON.stringify(output));
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(`${RED}Fatal: ${err.message}${RESET}`);
  process.exit(1);
});
