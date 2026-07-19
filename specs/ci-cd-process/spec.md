# CI/CD Pipeline — Development to Deployment

Status: Approved (Gate 1 passed)
Version: 1.1
Last updated: 2026-07-19

## Overview

Establish a fully automated development pipeline that validates code quality on every push, deploys to Vercel on merge to main, and verifies the live deployment with E2E tests. Preview deployments on PRs give stakeholders a working URL before merge.

## Current State (Baseline)

Two GitHub Actions workflows exist on disk but have gaps:

| Issue | `deploy.yml` (main push) | `deploy-preview.yml` (PR) |
|-------|--------------------------|---------------------------|
| Package manager | `npm ci` (should be `pnpm`) | `npm ci` (should be `pnpm`) |
| Unit tests (Vitest) | Not run | Not run |
| TypeScript check | `tsc --noEmit` only — no `next build` | Not run |
| Lint blocking | `continue-on-error: true` | `continue-on-error: true` |
| E2E blocking | `continue-on-error: true` | Not run at all |
| Duplicate checkout | Deploy job checks out again | N/A |

## User Stories

### Primary
As a **developer**, I want **every push to trigger automated validation (lint, typecheck, unit tests)** so that broken code never reaches production.

As a **developer**, I want **merged PRs to deploy to production automatically via Vercel** so that I don't need manual deploy steps.

As a **developer**, I want **E2E tests to run against the live production deployment and block on failure** so that regressions are caught before users see them.

### Secondary
As a **reviewer**, I want **PRs to get a Vercel preview URL automatically** so that I can visually verify changes without checking out locally.

As a **developer**, I want **a clean CI log that clearly shows which step failed** so that debugging pipeline failures is fast.

## Boundaries

**Always do:**
- Use `pnpm` for all package operations in CI — never `npm` or `yarn`
- Run lint → typecheck → unit tests → build as gated stages before deploy
- Validate live deployment with E2E after Vercel deployment completes
- Cache `node_modules` and Playwright browsers between jobs where possible

**Ask first (do not proceed unilaterally):**
- Adding new secrets to the repo
- Changing the Vercel project ID or team ID
- Modifying the deploy trigger mechanism (currently Vercel API)
- Adding new jobs or stages beyond what this spec defines

**Never do:**
- Use `npm ci` or `npm install` — always `pnpm`
- Mark lint, typecheck, or E2E tests as `continue-on-error`
- Deploy without passing the validation gate
- Hardcode secrets or tokens in workflow files
- Skip the E2E verification step after deployment

## Acceptance Criteria

### AC-1: Code Quality Gate — Lint, Typecheck, Unit Tests [MUST]
Given a push to any branch or a PR opened against main
When the CI pipeline starts
Then the pipeline runs in this exact order:
  1. `pnpm install --frozen-lockfile`
  2. `pnpm lint` (blocking — no `continue-on-error`)
  3. `npx tsc --noEmit` (blocking)
  4. `npx vitest run` (blocking)
  5. `pnpm build` (type-safe production build validation)
And if any step fails, the pipeline stops and does not proceed to deployment

### AC-2: Preview Deployment on PR [MUST]
Given a PR is opened against main
And the code quality gate (AC-1) passes
When the preview workflow runs
Then Vercel creates a preview deployment and comments the preview URL on the PR
And the comment includes the deployment URL

### AC-3: Production Deployment on Merge to Main [MUST]
Given a commit is pushed to the `main` branch
And the code quality gate (AC-1) passes
When the deploy workflow runs
Then Vercel triggers a production deployment for the git SHA
And the pipeline waits for Vercel to report `READY` state (up to 5 minutes, polling every 10s)

### AC-4: E2E Tests Against Live Deployment [MUST]
Given the production deployment is READY
When the E2E test step runs
Then Playwright tests execute against the deployed URL (set via `BASE_URL` env var)
And if any E2E test fails, the pipeline reports failure (blocking — no `continue-on-error`)
And the Playwright report is uploaded as a CI artifact

### AC-5: E2E Tests Against Preview Deployment [SHOULD]
Given a preview deployment is READY
When the E2E test step runs
Then Playwright tests execute against the preview URL
And if any E2E test fails, the pipeline reports failure (blocking — no `continue-on-error`)
And the Playwright report is uploaded as a CI artifact

### AC-6: CI Uses pnpm Throughout [MUST]
Given any CI workflow
When dependencies are installed
Then `pnpm install --frozen-lockfile` is used (not `npm ci`)
And `pnpm` is available and configured as the package manager for the Node.js setup step

### AC-7: DB Schema Verification Runs but Is Non-Blocking [MUST]
Given any push to main
When the validation stage runs
Then `pnpm verify:db` runs against SurrealDB
And if it fails, the pipeline continues (non-blocking — SurrealDB may be temporarily unreachable)
And the failure is clearly logged but does not prevent deployment

### AC-8: Secret Hygiene [MUST]
Given any workflow file
When inspecting the file
Then all secrets are referenced as `${{ secrets.VERCEL_TOKEN }}` or similar
And no API keys, tokens, or passwords appear as plain text
And no `.env` files are created or read

### AC-9: PR Check Runs [COULD]
Given a push to a non-main branch
When the code quality gate (AC-1) runs
Then the check status is reported back to GitHub as a commit status
And the PR shows green/red checkmark based on results
(Note: this relies on GitHub's built-in workflow status reporting — no extra config needed)

### AC-E1: Deployment Timeout [MUST]
Given the production deployment is triggered
When Vercel does not reach READY within 5 minutes (30 polls at 10s intervals)
Then the pipeline fails with a "Timed out waiting for deployment" message

### AC-E2: Vercel Deployment Error [MUST]
Given the production deployment is triggered
When Vercel returns `ERROR` or `CANCELED` state during polling
Then the pipeline fails immediately with the deployment state and does not wait for timeout

### AC-E3: Build Fails on Type Errors [MUST]
Given TypeScript errors exist in the codebase
When `tsc --noEmit` or `next build` runs in CI
Then the pipeline fails and does not proceed to deployment
(Note: `next build` implicitly type-checks; `tsc --noEmit` is a fast gate before the full build)

### AC-E4: Lint Violations Block Deployment [MUST]
Given ESLint reports errors
When `pnpm lint` runs in CI
Then the pipeline fails and does not proceed to deployment
(Note: warnings should not block)

## Non-Functional Requirements

- **Performance:** Code quality gate (lint + typecheck + unit tests + build) completes within 5 minutes
- **Performance:** E2E test suite completes within 3 minutes
- **Reliability:** Pipeline must not fail due to DB connectivity (SurrealDB verification is non-blocking)
- **Reliability:** Missing GitHub secrets cause clear failures at workflow start (inherent platform behavior — no implementation needed)
- **Observability:** Every step outputs a clear status line; failures include the command and exit code

## Out of Scope

- Infrastructure-as-code for Vercel project settings (already configured)
- Load testing or performance regression testing in CI
- Automated rollback on E2E failure (manual triage first)
- Notifications (Slack, email) for deploy status — handle via n8n separately
- Preview deployment cleanup (stale preview URLs)
- Code coverage thresholds (can add later)

## Open Questions

- [RESOLVED] Package manager in CI? → Decision: `pnpm` everywhere, confirmed by user
- [RESOLVED] E2E tests blocking? → Decision: Block on failure, confirmed by user
- [RESOLVED] Keep preview deploys? → Decision: Keep, confirmed by user
