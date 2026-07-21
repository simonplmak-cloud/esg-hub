# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities **privately** — do not open a public issue.

- **Preferred:** use GitHub's [private vulnerability reporting](https://github.com/simonplmak-cloud/esg-hub/security/advisories/new) on this repository
- **Alternative:** email **simon@ascent.partners** with the subject line `[ESG Hub Security]`

## Scope

In scope:

- The ESG Hub application code in this repository (Next.js app, API routes, scripts)
- The `@esg-hub/mcp-server` package in `mcp-server/`
- The public REST API at `https://esg-hub.ascent.partners/api/v1`

Out of scope:

- Content inaccuracies in the encyclopedia (use a [content error issue](https://github.com/simonplmak-cloud/esg-hub/issues/new/choose) instead)
- Vulnerabilities in third-party dependencies — report them upstream; feel free to also open a dependency issue here

## What to include

- Description of the vulnerability and its potential impact
- Steps to reproduce (requests, URLs, inputs)
- Affected component/route and, if known, a suggested fix

## Response expectations

- **Acknowledgement:** within 72 hours
- **Assessment and initial triage:** within 7 days
- **Fix or mitigation plan:** within 30 days for accepted vulnerabilities, depending on severity

We will keep you informed of progress and credit reporters in the fix notes (unless you prefer to remain anonymous).

## Secrets policy

This repository must never contain live credentials. If you find a committed secret, token, or password, treat it as a security report and notify us immediately via the channels above.
