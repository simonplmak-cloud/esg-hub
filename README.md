# ESG Hub — Open-Access ESG Encyclopedia

A dynamic Next.js web application serving the ESG Hub, an open-access encyclopedia by Ascent Partners Foundation. Content is stored in SurrealDB and rendered server-side for optimal SEO and performance.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) with React 19
- **Database:** SurrealDB Cloud (document storage)
- **Styling:** CSS (custom design system, WCAG AAA compliant)
- **Deployment:** Vercel
- **Content:** ~307 pages of ESG knowledge, migrated from Markdown

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `pnpm dev`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SURREAL_ENDPOINT` | SurrealDB Cloud endpoint URL |
| `SURREAL_USERNAME` | SurrealDB username |
| `SURREAL_PASSWORD` | SurrealDB password |
| `SURREAL_NAMESPACE` | SurrealDB namespace (default: `esg_hub`) |
| `SURREAL_DATABASE` | SurrealDB database name (default: `main`) |
| `NEXT_PUBLIC_BASE_URL` | Public URL for sitemap generation |

## Scripts

- `pnpm dev` — Start development server
- `pnpm build` — Build for production
- `pnpm start` — Start production server
- `node scripts/setup-schema.mjs` — Initialize SurrealDB schema
- `node scripts/migrate-content.mjs` — Migrate Markdown content to SurrealDB

## License

Content licensed under CC BY-SA 4.0 by Ascent Partners Foundation.

