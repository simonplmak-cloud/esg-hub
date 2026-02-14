# ESG Hub MCP Server

Model Context Protocol server exposing ESG knowledge graph tools for AI agents.

## Features

- **11 MCP Tools** for programmatic access to ESG knowledge
- **Semantic Search** using vector embeddings
- **Entity Lookups** for boundaries, standards, social issues, governance, SDGs, books, regulations
- **Graph Traversal** to explore relationships
- **Statistics** for database insights

## Installation

```bash
# Install dependencies
pip install mcp surrealdb

# Ensure SurrealDB is running
surreal start --bind 0.0.0.0:8000 --user root --pass root
```

## Usage

### Standalone Mode

```bash
python3 -m backend.mcp.server
```

### With Manus AI

Add to your Manus MCP configuration:

```json
{
  "mcpServers": {
    "esg-hub": {
      "command": "python3",
      "args": ["-m", "backend.mcp.server"],
      "env": {
        "SURREAL_URL": "ws://localhost:8000/rpc"
      }
    }
  }
}
```

## Available Tools

### 1. `search_esg_knowledge`
Search ESG knowledge graph using semantic similarity.

**Input:**
- `query` (string): Search query
- `limit` (integer, optional): Max results (default: 10)

**Example:**
```json
{
  "query": "climate change disclosure requirements",
  "limit": 5
}
```

### 2. `get_planetary_boundary`
Get detailed information about a planetary boundary.

**Input:**
- `code` (string): Boundary code (e.g., "climate", "biosphere")

### 3. `get_standard`
Get detailed information about an ESG standard.

**Input:**
- `abbreviation` (string): Standard abbreviation (e.g., "IFRS-S1", "GRI")

### 4. `list_standards_by_category`
List standards filtered by category.

**Input:**
- `category` (string): One of: disclosure, climate, nature, social, governance

### 5. `get_social_issue`
Get detailed information about an ISO 26000 social issue.

**Input:**
- `code` (string): Social issue code (e.g., "S2.1")

### 6. `get_governance_topic`
Get detailed information about a G20/OECD governance topic.

**Input:**
- `code` (string): Governance topic code (e.g., "G5.3")

### 7. `get_sdg`
Get detailed information about a UN SDG.

**Input:**
- `number` (integer): SDG number (1-17)

### 8. `get_book`
Get detailed information about one of Simon Mak's ESG books.

**Input:**
- `isbn` (string): Book ISBN

### 9. `list_regulations_by_jurisdiction`
List ESG regulations for a specific jurisdiction.

**Input:**
- `jurisdiction` (string): Jurisdiction name (e.g., "Hong Kong", "EU")

### 10. `explore_relationships`
Explore relationships between ESG entities.

**Input:**
- `entity_id` (string): Starting entity ID
- `relationship_type` (string, optional): Filter by relationship type

### 11. `get_statistics`
Get database statistics.

**Input:** None

## Architecture

```
┌─────────────────┐
│   AI Agent      │
│   (Manus)       │
└────────┬────────┘
         │ MCP Protocol
         │
┌────────▼────────┐
│  MCP Server     │
│  (Python)       │
└────────┬────────┘
         │ SurrealQL
         │
┌────────▼────────┐
│  SurrealDB      │
│  Knowledge Graph│
└─────────────────┘
```

## Development

```bash
# Test MCP server locally
python3 -m backend.mcp.server

# Lint code
ruff check backend/mcp/

# Format code
black backend/mcp/
```

## License

Copyright © 2025 Ascent Partners Foundation
