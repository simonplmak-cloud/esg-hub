/**
 * Shared DB environment for scripts/*.mjs (specs/dev-env-automation, D5).
 *
 * The namespace is hardcoded to "esg_hub" — SURREAL_NAMESPACE from the shell
 * is intentionally ignored because other projects export their own value
 * (e.g. "valuation"), which previously made scripts target the wrong database.
 * Override only with ESG_HUB_NS_OVERRIDE=<namespace> (prints a loud warning).
 */

export function getNamespace() {
  const override = process.env.ESG_HUB_NS_OVERRIDE;
  if (override) {
    console.warn(`\n⚠️  ESG_HUB_NS_OVERRIDE active: targeting namespace "${override}" instead of "esg_hub"\n`);
    return override;
  }
  return "esg_hub";
}

export function getDbEnv() {
  return {
    endpoint: (process.env.SURREAL_ENDPOINT || "").trim(),
    username: (process.env.SURREAL_USERNAME || "").trim(),
    password: (process.env.SURREAL_PASSWORD || "").trim(),
    database: (process.env.SURREAL_DATABASE || "").trim(),
    namespace: getNamespace(),
  };
}
