# Contributing to ESG Hub

Thank you for your interest in improving the ESG Hub, an open-access ESG encyclopedia by Ascent Partners Foundation.

## Ways to contribute

### 1. Report a content error (no code required)

Found an outdated, wrong, or broken piece of content? Open a **Content error** issue from the [issue chooser](https://github.com/simonplmak-cloud/esg-hub/issues/new/choose) with the page URL and the correction. Content lives in our database — maintainers apply verified corrections directly.

### 2. Report a bug

Open a **Bug report** issue with reproduction steps, expected vs actual behavior, and environment details.

### 3. Submit a code change (PR)

1. **Fork** the repository and create a branch from `main`
2. Make your change. Keep it focused; small PRs merge fastest
3. **PR title must follow conventional commits**: `feat:`, `fix:`, `ci:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:` (optionally scoped) — enforced by CI
4. Every PR runs: lint → typecheck → unit tests → production build, then a Vercel preview deployment with Playwright E2E. All must be green before merge
5. Copilot reviews every PR automatically; a maintainer merges after review

Local setup:

```bash
pnpm install          # requires the sibling repo ../tool_package (see README)
cp .env.example .env  # fill in your own values
pnpm dev
```

Notes for contributors:

- This project uses **spec-driven development** for non-trivial changes — see `specs/` and `constitution.md`. For anything beyond a small fix, open an issue first to discuss the spec
- Never commit secrets or `.env` files; CI includes secret scanning with push protection
- SurrealQL inputs must go through the sanitizers in `src/lib/surrealdb.ts`

## Ground rules

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md) — report vulnerabilities privately, never in public issues/PRs

## License

- Code contributions are licensed under the [MIT License](LICENSE)
- Content contributions are licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) by Ascent Partners Foundation
