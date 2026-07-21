# Public Repo Readiness — Config & Content Review

Status: Approved (Gate 1 passed)
Version: 1.0
Last updated: 2026-07-21

## Overview

The repository went public on 2026-07-20. This spec covers everything needed to make its config and content appropriate for a public-facing open-source project: licensing, community files, metadata, and a public-grade README. A full secret scan of `specs/` and the repo found no live credentials (verified 2026-07-21).

## Findings (2026-07-21)

| # | Finding | Evidence |
|---|---------|----------|
| F1 | **No LICENSE file** — repo API reports `license: null`. README claims content is CC BY-SA 4.0 but no code license exists anywhere (mcp-server declares MIT in its own package) | `ls LICENSE*` → none; `gh api` license null |
| F2 | **No SECURITY.md** — no vulnerability-reporting policy; GitHub private vulnerability reporting not configured | file absent |
| F3 | **No CONTRIBUTING.md / CODE_OF_CONDUCT.md** — no community guidelines for a public repo | files absent |
| F4 | **No issue templates** — public visitors get a blank issue form; a public encyclopedia needs at minimum "content error" + bug report | `.github/` has only PR template, dependabot, workflows |
| F5 | **Repo metadata empty** — `description: null`, `topics: []` → invisible in GitHub search/discovery; homepage already set ✓ | `gh api` output |
| F6 | **README references `.env.example` which doesn't exist** (broken reference); README is minimal: no feature overview, no badges, no API/MCP links, stale "custom CSS" line (it's Tailwind v4), no community links | README.md lines 17, 9 |
| F7 | **No `.env.example`** — public contributors need a placeholder template (names only, no values) | file absent |
| F8 | Unused GitHub surfaces enabled: **wiki** (empty) and **projects** (unused) | `gh api`: has_wiki/has_projects true |
| F9 | specs/ and workflows scanned for sensitive content — **clean** (no keys/tokens/passwords; infra IDs only, which are non-secret) | grep patterns |

## User Stories

- As a **visitor**, I want to understand what ESG Hub is, see the live link, and know the license, within 10 seconds of landing on the repo.
- As a **potential contributor**, I want clear contribution paths (report a content error, submit a fix) and the ground rules (CoC, security reporting).
- As the **Foundation**, we want correct dual licensing (code MIT, content CC BY-SA 4.0) and no unused/misleading repo surfaces.

## Boundaries

**Always do:**
- Env templates contain variable NAMES only — never real values
- Dual-license correctly: code = MIT (matches mcp-server), encyclopedia content = CC BY-SA 4.0 (per README/Foundation)
- Keep all changes text/config-level; no app code changes
- Verify metadata changes via API read-back

**Ask first:**
- Changing the code license choice (default: MIT per mcp-server precedent)
- Enabling GitHub Discussions (default: stay off; issues only)

**Never do:**
- Add real endpoint URLs with embedded credentials or internal infra details beyond what's already public
- Change CI/deploy behavior

## Acceptance Criteria

- **AC-1 [MUST]** A `LICENSE` file exists: MIT text for code, with an explicit note that encyclopedia content is CC BY-SA 4.0 by Ascent Partners Foundation; GitHub's license API detects it (`gh api .../license` returns a license).
- **AC-2 [MUST]** `SECURITY.md` exists with a vulnerability-reporting policy (contact + scope + response expectations); GitHub private vulnerability reporting is enabled via repo settings (API-verified) or documented as enabled in the UI.
- **AC-3 [MUST]** `CONTRIBUTING.md` exists: how to report content errors, how to submit PRs (fork → branch → PR, CI gates, conventional-commit titles, SDD specs reference), and links to CoC/SECURITY.
- **AC-4 [MUST]** `CODE_OF_CONDUCT.md` exists (Contributor Covenant v2.1) with a foundation contact email filled in.
- **AC-5 [MUST]** Issue templates exist: `bug_report.yml` and `content_error.yml` (fields for page URL, what's wrong, suggested correction); blank issues disabled.
- **AC-6 [MUST]** Repo metadata set: description (one line), topics (esg, sustainability, climate, governance, knowledge-base, nextjs, surrealdb, education, open-data, hong-kong), verified via `gh api`.
- **AC-7 [MUST]** README rewritten for public consumption: what it is + live link + features, tech stack (accurate), quick start pointing at `.env.example`, API + MCP server sections with links, badges (deploy workflow, license), contributing/security/license sections. The stale "custom CSS" claim and broken `.env.example` reference are fixed.
- **AC-8 [MUST]** `.env.example` created with all env var names used by the app/scripts (SURREAL_*, DEEPSEEK_API_KEY, BRAVE_API_KEY, NEXT_PUBLIC_*) and placeholder values only.
- **AC-9 [SHOULD]** Wiki and Projects disabled (unused surfaces), verified via API; reopening documented as trivial.
- **AC-10 [COULD]** `CITATION.cff` for the encyclopedia (Ascent Partners Foundation, CC BY-SA 4.0).
- **AC-11 [MUST]** CI stays green through the change PR (these are text files — expectations: check job passes trivially).

## Non-Functional Requirements

- Every new file reviewed for sensitive content before commit (no internal IDs beyond public URLs)
- All metadata changes reversible via the same API
- README remains accurate as of 2026-07-21 (Tailwind v4, pnpm, SurrealDB, next-intl, Brave-powered AI search)

## Out of Scope

- GitHub Discussions, social-preview image, repo translation/i18n of community files
- GitHub Projects/wikis content (disabled instead)
- Branch protection / ruleset changes (already correct)
- npm publishing of the MCP server package

## Open Questions

- [RESOLVED] Contact email → `simon@ascent.partners` (user decision 2026-07-21)
- [RESOLVED] Code license → MIT (user decision 2026-07-21; content remains CC BY-SA 4.0)
