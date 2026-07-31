/**
 * Shared term-quality helpers for seed-km-terms.mjs and audit-term-quality.mjs.
 *
 * Junk keyword tokens come from content-derived page keywords (parenthetical
 * fragments like "(Carbon", bare numbers like "14001"). The filter keeps only
 * letter-led tokens so future seeding cannot create glossary entries that are
 * not real terms. Valid digit-led terms (e.g. "1.5°C") are intentionally
 * excluded — editors add those manually.
 */

export function isJunkKeyword(term) {
  const t = String(term ?? "").trim();
  if (t.length < 3 || t.length >= 80) return true;
  if (!/^[a-zA-Z]/.test(t)) return true; // must start with a letter
  if (/^[a-z]+$/i.test(t) && t.length < 3) return true;
  if (/[()\[\]{}<>]/.test(t)) return true; // parenthetical fragments
  if (/^[_.\-]+$/.test(t)) return true; // only symbols
  return false;
}

export function isSuspiciousTerm(name, definition) {
  const n = String(name ?? "").trim();
  const d = String(definition ?? "").trim();
  if (!n) return true;
  if (!/^[a-zA-Z]/.test(n)) return true; // digit/symbol-led name
  if (!d) return true;
  if (d.includes("— ESG Hub glossary term")) return true; // placeholder definition
  if (d === `${n} — ESG Hub glossary term`) return true;
  return false;
}
