#!/usr/bin/env node
/**
 * Read-only term-quality audit (REQ-003, T-008).
 *
 * Lists suspicious `term` records for human review: placeholder definitions,
 * digit/symbol-led names, missing definitions. Runs SELECT only — never
 * writes. Data cleanup itself is a human action (I3: no data ops in the
 * improve loop).
 *
 *   node scripts/audit-term-quality.mjs [--limit 100] [--json]
 */
import { getDbEnv } from "./lib/db-env.mjs";
import { isSuspiciousTerm } from "./lib/term-quality.mjs";

const env = getDbEnv();
const BASE = `${env.endpoint}/sql`;
const LIMIT = Number(process.argv.find(a => a.startsWith("--limit="))?.split("=")[1] || 100);
const JSON_OUT = process.argv.includes("--json");

async function q(body) {
  const res = await fetch(BASE, {
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
  if (!res.ok) throw new Error(`DB error ${res.status}`);
  return (await res.json())[0]?.result;
}

async function main() {
  const terms = await q(`SELECT id, name, definition FROM term LIMIT ${LIMIT};`);
  const list = Array.isArray(terms) ? terms : [];
  const suspicious = list.filter(t => isSuspiciousTerm(t.name, t.definition));

  console.log(`[audit-term-quality] ${list.length} terms scanned, ${suspicious.length} suspicious\n`);
  for (const t of suspicious) {
    const reason = !/^[a-zA-Z]/.test(t.name || "") ? "non-letter-led" : "placeholder-definition";
    console.log(`  ${reason.padEnd(20)} ${t.id}  "${t.name}"`);
  }

  if (JSON_OUT) {
    console.log(JSON.stringify({ scanned: list.length, suspicious: suspicious.length, items: suspicious }, null, 2));
  }

  console.log(`\nCleanup requires a human DB write (out of scope for the improve loop).`);
  process.exit(0);
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
