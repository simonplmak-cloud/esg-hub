/**
 * Preflight IAM write-access check for KM pipelines (REQ-004, T-010).
 *
 * The ingestion/RD loops write directly to SurrealDB (DEFINE TABLE/CREATE
 * lease/CREATE content_enhancement_log) using SURREAL_USERNAME/PASSWORD.
 * A Viewer-only user (the shell `root`) cannot do any of that, yet it was
 * being passed by the workflows — the pipeline would only fail mid-write.
 *
 * This check is READ-ONLY: it runs `INFO FOR DB`, which requires the DB user
 * to see schema definitions. A Viewer-only user gets a permission error or
 * an empty/redacted result, so the pipeline can fail fast with a clear
 * message instead of failing at the first CREATE.
 */

export async function preflightDbWriteAccess(q, { requiredTables = ["lease"] } = {}) {
  let info;
  try {
    info = await q("INFO FOR DB;");
  } catch (err) {
    return {
      ok: false,
      error:
        `DB user lacks schema access (${err.message}). ` +
        `km-ingestion/km-rd-loop write to SurrealDB directly and need an Editor/Owner user — ` +
        `set SURREAL_USERNAME/SURREAL_PASSWORD to an admin credential (e.g. opencode_admin), ` +
        `not the Viewer-only root.`,
    };
  }

  const body = JSON.stringify(info ?? "");
  const missing = requiredTables.filter(t => !body.includes(`"${t}"`) && !body.includes(` ${t}`));
  if (missing.length > 0) {
    return {
      ok: false,
      error:
        `DB schema does not expose required tables (${missing.join(", ")}). ` +
        `The DB user is likely Viewer-only — it cannot see schema definitions. ` +
        `Use an Editor/Owner credential for SURREAL_USERNAME/SURREAL_PASSWORD.`,
    };
  }

  return { ok: true, tables: requiredTables };
}
