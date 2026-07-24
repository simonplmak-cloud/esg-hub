#!/usr/bin/env node

/**
 * Manual KM lock release.
 *
 *   node scripts/release-km-lock.mjs [--lease km_ingestion|km_rd_loop] [--force]
 *
 * Checks if lease exists. If expired OR owner matches current run → DELETE.
 * If live + owned by another → refuse (require --force).
 * Audit-logs every release to stdout (JSON lines).
 */

import { getDbEnv } from "./lib/db-env.mjs";

const env = getDbEnv();
const SQL_BASE = `${env.endpoint}/sql`;

const args = process.argv.slice(2);
const leaseIdx = args.indexOf("--lease");
const LEASE_KEY = leaseIdx > -1 ? args[leaseIdx + 1] : "km_ingestion";
const FORCE = args.includes("--force");
const OWNER = `release-${process.pid}-${Date.now()}`;

const nowIso = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function q(body) {
  const res = await fetch(SQL_BASE, {
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
  return (await res.json())[0]?.result;
}

const esc = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

function auditLog(event) {
  process.stdout.write(
    JSON.stringify({
      timestamp: nowIso(),
      script: "release-km-lock",
      owner: OWNER,
      pid: process.pid,
      ...event,
    }) + "\n"
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const leaseId = `lease:${LEASE_KEY}`;
  console.log(`[release-km-lock] Target: ${leaseId}`);

  // Check if lease exists
  const existing = await q(`SELECT id, owner, expires_at FROM ${leaseId} LIMIT 1;`);
  const record = Array.isArray(existing) ? existing[0] : existing;

  if (!record) {
    console.log(`[release-km-lock] Lease ${leaseId} does not exist. Nothing to do.`);
    auditLog({ event: "no_lease", leaseId });
    return;
  }

  const expiresAt = new Date(record.expires_at).getTime();
  const isExpired = Date.now() > expiresAt;

  console.log(`[release-km-lock] Lease found:`);
  console.log(`  Owner:    ${record.owner}`);
  console.log(`  Expires:  ${record.expires_at}`);
  console.log(`  Expired:  ${isExpired ? "YES" : `NO (${Math.round((expiresAt - Date.now()) / 1000)}s remaining)`}`);

  if (isExpired) {
    console.log(`[release-km-lock] Lease is expired — deleting.`);
    await q(`DELETE ${leaseId};`);
    auditLog({
      event: "lease_deleted",
      leaseId,
      reason: "expired",
      previousOwner: record.owner,
      previousExpiresAt: record.expires_at,
    });
    console.log(`[release-km-lock] Done.`);
    return;
  }

  // Not expired — check if we own it (via caller PID matching — but this is a new process, so only --force helps)

  if (FORCE) {
    console.warn(`[release-km-lock] --force: Overriding live lease owned by "${record.owner}"`);
    await q(`DELETE ${leaseId};`);
    auditLog({
      event: "lease_deleted",
      leaseId,
      reason: "force",
      previousOwner: record.owner,
      previousExpiresAt: record.expires_at,
    });
    console.log(`[release-km-lock] Force-deleted.`);
    return;
  }

  // Live + owned by another → refuse
  console.error(`\n[release-km-lock] REFUSED: Lease is live and owned by "${record.owner}".`);
  console.error(`[release-km-lock] To override, re-run with --force.`);
  console.error(`[release-km-lock] To wait, allow ${Math.round((expiresAt - Date.now()) / 60000)} minutes for natural expiry.`);

  auditLog({
    event: "lease_release_refused",
    leaseId,
    reason: "live_and_foreign_owner",
    currentOwner: record.owner,
    expiresAt: record.expires_at,
  });

  process.exit(1);
}

main().catch((err) => {
  console.error(`[release-km-lock] Fatal: ${err.message}`);
  auditLog({ event: "error", error: err.message });
  process.exit(1);
});
