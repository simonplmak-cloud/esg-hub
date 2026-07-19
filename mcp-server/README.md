# ESG Hub MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that provides AI agents with access to the **ESG Hub** knowledge base — 307 articles and 244 curated external resources covering Environmental, Social, and Governance topics.

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "esg-hub": {
      "command": "npx",
      "args": ["-y", "@esg-hub/mcp-server"]
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP settings:

```json
{
  "esg-hub": {
    "command": "npx",
    "args": ["-y", "@esg-hub/mcp-server"]
  }
}
```

### Manual (from source)

```bash
cd mcp-server
pnpm install
pnpm build
node dist/index.js
```

## Available Tools

| Tool | Description |
|------|-------------|
| `search_esg` | Full-text keyword search across all ESG content (BM25 ranking) |
| `get_esg_page` | Retrieve the full content of a specific ESG article by permalink or slug |
| `list_esg_pages` | List/filter ESG articles by section, pillar, or title |
| `list_esg_resources` | List/filter curated external ESG resources by domain or title |
| `get_esg_metadata` | Get database statistics (total pages, sections, pillars, domains) |

## Example Prompts

Once connected, you can ask your AI assistant questions like:

- "What are the key ESG reporting standards?"
- "Find information about Scope 3 emissions"
- "List all articles about corporate governance"
- "What external resources are available from the GRI?"
- "Explain the TCFD framework using the ESG Hub"

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ESG_HUB_API_URL` | `https://esg-hub.ascent.partners` | Base URL of the ESG Hub API |

## API Reference

The MCP server wraps the ESG Hub REST API v1. See the [API Documentation](https://esg-hub.ascent.partners/developers/api) for full endpoint details.

## License

MIT — Content from the ESG Hub is licensed under CC BY-SA 4.0 by Ascent Partners Foundation.
