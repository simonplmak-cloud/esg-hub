### 2026-07-31T03:34:22Z — run start / cycle 1 / T0
- Invocation: "run improve" → N=10 default. Run start 2026-07-31T03:34:22Z. First improve run on esg-hub.
- State: main@2d00b69 clean. No .improve-control. Prior KM Phase 1 fully shipped (spec/plan/tasks in specs/esg-hub-km-transformation/, all data seeded, deployed HEALTHY).
- Outstanding items: (1) ~72 crossref edges remaining (data op — code only), (2) eval-search 30-label validation, (3) km-ingestion pipeline not yet exercised end-to-end, (4) 7 open Dependabot PRs (github-actions bumps + mcp-server npm).
- Tooling: perplexity ✓, github ✓, esg-hub ✓, vercel ✓. To probe: context7, brave, gh_grep, playwright/browserless, surrealdb.
- Evidence: main@2d00b69; prod dpl_A4u7A7eeLRhZ8NLmHMmWNWT1Pykb READY.

### 2026-07-31T07:46:00Z — cycle 1 / STAGE 5 / G4 verification complete
- Actions: Fixed eval-search REQ-002 acceptance gap — resolver read `body.items` but pages API returns `body.data`; idcg used expanded match-key count instead of document count; scoring functions received raw labels, not expanded set. Corrected 15/34 stale eval-queries.json labels to existing page slugs. Refactored dcg/idcg/mrr into eval-resolver.mjs as pure exports (testable). Added 14 new unit tests (fetchPageIndex, scoring).
- Tooling: CI (Codespace vitest + eval-search against prod API_BASE); tsc --noEmit clean
- Evidence: eval-search against production passes (nDCG 0.7592 ≥ 0.6, MRR 0.8000 ≥ 0.5); CI "Search Evaluation" check SUCCESS (run 30613674414); 32 unit tests (4 files) pass; tsc clean
- Labels correct: 15 stale labels remapped (gri-305→gri, csrd→csrd-corporate-sustainability, esrs-e1→esrs, issb-ifrs-s2→ifrs-s1-s2, double-materiality→materiality-assessment, net-zero→net-zero-commitments, gri-1→gri, ungps→ungp+due-diligence, eu-social-taxonomy→eu-taxonomy, supply-chain→sustainable-supply-chains, climate-scenarios→climate-risk-assessment, assurance→esg-assurance, gender-pay-gap→gender-diversity, carbon-offsets→carbon-offsets-vs-removals, scope-2→ghg-protocol)
- Remaining search gaps (honest): net-zero, scope-2, gender-pay-gap, carbon-offsets score low (content coverage / search relevance — future cycle backlog)
- Growth: 160 insertions / 69 deletions across 5 files this update; cumulative ~872/115 insertions/deletions across 31 files — still under significance floor (sanity valve §7-M4 applies; mature repo, bug-fix cycle)
- Next: PR #45 ready for human review; do not merge
