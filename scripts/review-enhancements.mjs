#!/usr/bin/env node
/**
 * Human review CLI for content enhancement proposals
 * (specs/esg-hub-km-transformation, tasks.md E-3).
 *
 *   node scripts/review-enhancements.mjs --list [--status pending|approved|rejected]
 *   node scripts/review-enhancements.mjs --show <proposal_id>
 *   node scripts/review-enhancements.mjs --approve <proposal_id> [--force]
 *   node scripts/review-enhancements.mjs --reject <proposal_id> --note "reason"
 */

import { getDbEnv } from "./lib/db-env.mjs";
import readline from "node:readline";

const env = getDbEnv();
const USER = process.env.USER || process.env.USERNAME || "unknown";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

/**
 * Execute a SurrealDB query via the /sql endpoint.
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

// === Helpers ===

function esc(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/[\x00-\x1f]/g, "");
}

function formatSurrealValue(val) {
  if (val === null || val === undefined) return "NONE";
  if (typeof val === "number") {
    return Number.isFinite(val) ? String(val) : "0";
  }
  if (typeof val === "boolean") return val ? "true" : "false";
  if (Array.isArray(val)) {
    const items = val.map((v) => formatSurrealValue(v)).join(", ");
    return `[${items}]`;
  }
  if (typeof val === "object") {
    // SurrealDB objects: { key: value, ... }
    const pairs = Object.entries(val)
      .map(([k, v]) => `${k}: ${formatSurrealValue(v)}`)
      .join(", ");
    return `{ ${pairs} }`;
  }
  return `'${esc(String(val))}'`;
}

function truncate(str, maxLen) {
  const s = String(str);
  return s.length > maxLen ? s.slice(0, maxLen - 3) + "..." : s;
}

function statusColor(status) {
  if (status === "approved") return GREEN + status + RESET;
  if (status === "rejected") return RED + status + RESET;
  return YELLOW + status + RESET;
}

/**
 * Extract a human-readable diff summary from proposed_changes.
 */
function diffSummary(proposed) {
  if (!proposed || typeof proposed !== "object") return "(no changes)";
  const keys = Object.keys(proposed);
  if (keys.length === 0) return "(no changes)";
  const fields = keys.slice(0, 3).join(", ");
  const suffix = keys.length > 3 ? ` +${keys.length - 3} more` : "";
  return truncate(`[${fields}${suffix}] ${JSON.stringify(proposed[keys[0]])}`, 80);
}

/**
 * Display a unified diff for a proposed_changes object.
 */
function showDiff(proposed, indent = "  ") {
  if (!proposed || typeof proposed !== "object" || Object.keys(proposed).length === 0) {
    console.log(`${indent}${DIM}(no changes)${RESET}`);
    return;
  }
  for (const [field, change] of Object.entries(proposed)) {
    if (change && typeof change === "object" && "old" in change) {
      console.log(`${indent}${BOLD}${field}${RESET}:`);
      console.log(`${RED}${indent}  - ${truncate(String(change.old), 80)}${RESET}`);
      console.log(`${GREEN}${indent}  + ${truncate(String(change.new), 80)}${RESET}`);
    } else {
      console.log(`${indent}${BOLD}${field}${RESET}:`);
      console.log(`${GREEN}${indent}  + ${truncate(String(change), 100)}${RESET}`);
    }
  }
}

/**
 * Build an UPDATE SET clause from proposed_changes.
 * Handles both flat values and { old, new } entries.
 */
function _buildUpdateSet(proposed) {
  const setClauses = [];
  for (const [field, change] of Object.entries(proposed)) {
    const newVal = change && typeof change === "object" && "new" in change ? change.new : change;
    setClauses.push(`${field} = ${formatSurrealValue(newVal)}`);
  }
  return setClauses.join(", ");
}

/**
 * Interactive confirmation prompt.
 */
function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

// === Parsing ===

function parseArgs(argv) {
  const parsed = {
    command: null,
    proposalId: null,
    status: null,
    force: false,
    note: null,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    switch (arg) {
      case "--list":
        parsed.command = "list";
        break;
      case "--show":
        parsed.command = "show";
        parsed.proposalId = argv[++i];
        break;
      case "--approve":
        parsed.command = "approve";
        parsed.proposalId = argv[++i];
        break;
      case "--reject":
        parsed.command = "reject";
        parsed.proposalId = argv[++i];
        break;
      case "--status":
        parsed.status = argv[++i];
        break;
      case "--force":
        parsed.force = true;
        break;
      case "--note":
        parsed.note = argv[++i];
        break;
      default:
        break;
    }
    i++;
  }

  return parsed;
}

function usage() {
  console.log(`${BOLD}Usage:${RESET}`);
  console.log(`  node scripts/review-enhancements.mjs --list [--status pending|approved|rejected]`);
  console.log(`  node scripts/review-enhancements.mjs --show <proposal_id>`);
  console.log(`  node scripts/review-enhancements.mjs --approve <proposal_id> [--force]`);
  console.log(`  node scripts/review-enhancements.mjs --reject <proposal_id> --note "reason"`);
}

// === Commands ===

async function cmdList(status) {
  let filterSql = "";
  if (status) {
    const valid = new Set(["pending", "approved", "rejected"]);
    if (!valid.has(status)) {
      console.error(`${RED}Invalid status: "${status}". Must be pending, approved, or rejected.${RESET}`);
      process.exit(1);
    }
    filterSql = ` WHERE status = '${esc(status)}'`;
  }

  const entries = await q(
    `SELECT id, job_id, target_table, target_id, proposed_changes, status, created_at
     FROM content_enhancement_log${filterSql}
     ORDER BY created_at DESC
     LIMIT 100;`
  );

  if (entries.length === 0) {
    console.log(`${DIM}No proposals found.${RESET}`);
    return;
  }

  // Table header
  const header = `${BOLD}${"ID".padEnd(28)} ${"STATUS".padEnd(11)} ${"TABLE".padEnd(12)} ${"TARGET".padEnd(32)} ${"SUMMARY"}${RESET}`;
  console.log(header);
  console.log("─".repeat(120));

  for (const e of entries) {
    const id = String(e.id).padEnd(28);
    const _st = statusColor(e.status).padEnd(19 + (e.status === "pending" ? 5 : 2)); // account for ANSI codes
    const tbl = (e.target_table || "-").padEnd(12);
    const tgt = truncate(String(e.target_id || "-"), 30).padEnd(32);
    const summary = diffSummary(e.proposed_changes);

    const actualStatusPad = e.status.length + (e.status === "pending" ? 5 : 2);
    const _statusCol = `${e.status}${RESET}`.padEnd(actualStatusPad);
    console.log(
      `${id} ${statusColor(e.status)} ${tbl} ${tgt} ${summary}`
    );
  }

  console.log(`\n${DIM}${entries.length} proposal(s)${RESET}`);
}

async function cmdShow(proposalId) {
  const entries = await q(
    `SELECT * FROM content_enhancement_log WHERE id = ${formatSurrealValue(proposalId)};`
  );

  if (entries.length === 0) {
    console.error(`${RED}Proposal not found: ${proposalId}${RESET}`);
    process.exit(1);
  }

  const e = entries[0];

  console.log(`${BOLD}Proposal: ${e.id}${RESET}\n`);

  console.log(`  Status         : ${statusColor(e.status)}`);
  console.log(`  Job ID         : ${e.job_id || "-"}`);
  console.log(`  Target table   : ${e.target_table || "-"}`);
  console.log(`  Target ID      : ${e.target_id || "-"}`);
  console.log(`  Authority      : ${typeof e.authority_score === "number" ? e.authority_score.toFixed(4) : "-"}`);
  console.log(`  Created        : ${e.created_at || "-"}`);

  if (e.reviewer) {
    console.log(`  Reviewer       : ${e.reviewer}`);
    console.log(`  Reviewed       : ${e.reviewed_at || "-"}`);
    console.log(`  Review notes   : ${e.review_notes || "-"}`);
  }

  if (e.source_urls && Array.isArray(e.source_urls) && e.source_urls.length > 0) {
    console.log(`  Source URLs    :`);
    for (const url of e.source_urls) {
      console.log(`    ${CYAN}${url}${RESET}`);
    }
  }

  console.log(`\n${BOLD}Proposed Changes:${RESET}`);
  showDiff(e.proposed_changes, "  ");
  console.log();
}

async function cmdApprove(proposalId, force) {
  const entries = await q(
    `SELECT * FROM content_enhancement_log WHERE id = ${formatSurrealValue(proposalId)};`
  );

  if (entries.length === 0) {
    console.error(`${RED}Proposal not found: ${proposalId}${RESET}`);
    process.exit(1);
  }

  const e = entries[0];

  if (e.status !== "pending") {
    console.error(`${YELLOW}Proposal is already ${e.status}. Cannot approve.${RESET}`);
    process.exit(1);
  }

  if (!e.target_table || !e.target_id) {
    console.error(`${RED}Proposal is missing target_table or target_id. Cannot apply changes.${RESET}`);
    process.exit(1);
  }

  if (!e.proposed_changes || typeof e.proposed_changes !== "object") {
    console.error(`${RED}Proposal has no proposed_changes. Cannot apply.${RESET}`);
    process.exit(1);
  }

  // Show dry-run
  console.log(`${BOLD}Dry-run: applying changes to ${e.target_table}:${e.target_id}${RESET}\n`);

  console.log(`${CYAN}Proposal:${RESET}`);
  console.log(`  ID      : ${e.id}`);
  console.log(`  Table   : ${e.target_table}`);
  console.log(`  Target  : ${e.target_id}`);
  console.log(`  Author  : ${e.authority_score ? e.authority_score.toFixed(4) : "-"}\n`);

  showDiff(e.proposed_changes);

  const targetId = e.target_id;

  // Build UPDATE
  const setClauses = [];
  for (const [field, change] of Object.entries(e.proposed_changes)) {
    const newVal = change && typeof change === "object" && "new" in change ? change.new : change;
    setClauses.push(`${field} = ${formatSurrealValue(newVal)}`);
  }

  if (setClauses.length === 0) {
    console.error(`${RED}No valid field changes to apply.${RESET}`);
    process.exit(1);
  }

  const updateSql = `UPDATE ${targetId} SET ${setClauses.join(", ")};`;
  console.log(`\n${DIM}SQL: ${updateSql}${RESET}\n`);

  // Confirm
  if (!force) {
    const answer = await confirm(`${YELLOW}Apply these changes? [y/N] ${RESET}`);
    if (answer !== "y" && answer !== "yes") {
      console.log(`${DIM}Aborted.${RESET}`);
      process.exit(0);
    }
  } else {
    console.log(`${DIM}--force: skipping confirmation${RESET}`);
  }

  // Apply
  try {
    await q(updateSql);
    console.log(`${GREEN}✓ Applied changes to ${targetId}${RESET}`);
  } catch (err) {
    console.error(`${RED}Failed to apply changes: ${err.message}${RESET}`);
    process.exit(1);
  }

  // Update log
  const logUpdateSql = [
    `UPDATE ${formatSurrealValue(e.id)} SET`,
    `  status = 'approved',`,
    `  reviewer = '${esc(USER)}',`,
    `  reviewed_at = time::now();`,
  ].join("\n");

  try {
    await q(logUpdateSql);
    console.log(`${GREEN}✓ Log updated: status=approved, reviewer=${USER}${RESET}`);
  } catch (err) {
    console.error(`${YELLOW}Warning: changes applied but log update failed: ${err.message}${RESET}`);
  }

  // Revalidation hint for term/framework
  if (e.target_table === "term" || e.target_table === "framework") {
    console.log(
      `\n${CYAN}Tip: revalidate the API cache by hitting the endpoint or restarting the dev server.${RESET}`
    );
    console.log(`  ${DIM}curl -X GET ${process.env.API_BASE || "http://localhost:3000"}/api/v1/terms${RESET}`);
  }
}

async function cmdReject(proposalId, note) {
  if (!note) {
    console.error(`${RED}--note is required for rejection.${RESET}`);
    process.exit(1);
  }

  const entries = await q(
    `SELECT * FROM content_enhancement_log WHERE id = ${formatSurrealValue(proposalId)};`
  );

  if (entries.length === 0) {
    console.error(`${RED}Proposal not found: ${proposalId}${RESET}`);
    process.exit(1);
  }

  const e = entries[0];

  if (e.status !== "pending") {
    console.error(`${YELLOW}Proposal is already ${e.status}. Cannot reject.${RESET}`);
    process.exit(1);
  }

  const logUpdateSql = [
    `UPDATE ${formatSurrealValue(e.id)} SET`,
    `  status = 'rejected',`,
    `  reviewer = '${esc(USER)}',`,
    `  reviewed_at = time::now(),`,
    `  review_notes = '${esc(note)}';`,
  ].join("\n");

  try {
    await q(logUpdateSql);
    console.log(`${GREEN}✓ Proposal ${e.id} rejected.${RESET}`);
    console.log(`  Status  : ${RED}rejected${RESET}`);
    console.log(`  Note    : ${note}`);
    console.log(`  Reviewer: ${USER}`);
  } catch (err) {
    console.error(`${RED}Failed to reject proposal: ${err.message}${RESET}`);
    process.exit(1);
  }
}

// === Main ===

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    usage();
    process.exit(0);
  }

  const parsed = parseArgs(args);

  if (!parsed.command) {
    console.error(`${RED}No command specified. Use --list, --show, --approve, or --reject.${RESET}\n`);
    usage();
    process.exit(1);
  }

  switch (parsed.command) {
    case "list":
      await cmdList(parsed.status);
      break;
    case "show":
      if (!parsed.proposalId) {
        console.error(`${RED}--show requires a proposal ID.${RESET}`);
        process.exit(1);
      }
      await cmdShow(parsed.proposalId);
      break;
    case "approve":
      if (!parsed.proposalId) {
        console.error(`${RED}--approve requires a proposal ID.${RESET}`);
        process.exit(1);
      }
      await cmdApprove(parsed.proposalId, parsed.force);
      break;
    case "reject":
      if (!parsed.proposalId) {
        console.error(`${RED}--reject requires a proposal ID.${RESET}`);
        process.exit(1);
      }
      await cmdReject(parsed.proposalId, parsed.note);
      break;
    default:
      console.error(`${RED}Unknown command: ${parsed.command}${RESET}`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`${RED}Fatal: ${err.message}${RESET}`);
  process.exit(1);
});
