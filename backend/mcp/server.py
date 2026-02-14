#!/usr/bin/env python3
"""
ESG Hub MCP Server
Model Context Protocol server exposing ESG knowledge graph tools
"""

import asyncio
import logging
from typing import Any
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from surrealdb import Surreal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("esg-hub-mcp")

# Global database connection
db: Surreal | None = None

# MCP Server instance
app = Server("esg-hub")


async def init_database():
    """Initialize SurrealDB connection"""
    global db
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    logger.info("✅ Connected to SurrealDB")


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available MCP tools"""
    return [
        Tool(
            name="search_esg_knowledge",
            description="Search ESG knowledge graph using semantic similarity. Returns relevant boundaries, standards, social issues, governance topics, SDGs, books, and regulations.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query (e.g., 'climate change disclosure', 'human rights due diligence')"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results (default: 10)",
                        "default": 10
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="get_planetary_boundary",
            description="Get detailed information about a specific planetary boundary by code (e.g., 'climate', 'biosphere', 'nitrogen').",
            inputSchema={
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Planetary boundary code"
                    }
                },
                "required": ["code"]
            }
        ),
        Tool(
            name="get_standard",
            description="Get detailed information about an ESG standard/framework by abbreviation (e.g., 'IFRS-S1', 'GRI', 'TCFD').",
            inputSchema={
                "type": "object",
                "properties": {
                    "abbreviation": {
                        "type": "string",
                        "description": "Standard abbreviation"
                    }
                },
                "required": ["abbreviation"]
            }
        ),
        Tool(
            name="list_standards_by_category",
            description="List all ESG standards filtered by category (disclosure, climate, nature, social, governance).",
            inputSchema={
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "enum": ["disclosure", "climate", "nature", "social", "governance"],
                        "description": "Standard category"
                    }
                },
                "required": ["category"]
            }
        ),
        Tool(
            name="get_social_issue",
            description="Get detailed information about an ISO 26000 social issue by code (e.g., 'S2.1', 'S3.2').",
            inputSchema={
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Social issue code"
                    }
                },
                "required": ["code"]
            }
        ),
        Tool(
            name="get_governance_topic",
            description="Get detailed information about a G20/OECD governance topic by code (e.g., 'G1.1', 'G5.3').",
            inputSchema={
                "type": "object",
                "properties": {
                    "code": {
                        "type": "string",
                        "description": "Governance topic code"
                    }
                },
                "required": ["code"]
            }
        ),
        Tool(
            name="get_sdg",
            description="Get detailed information about a UN Sustainable Development Goal by number (1-17).",
            inputSchema={
                "type": "object",
                "properties": {
                    "number": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 17,
                        "description": "SDG number"
                    }
                },
                "required": ["number"]
            }
        ),
        Tool(
            name="get_book",
            description="Get detailed information about one of Simon Mak's ESG books by ISBN.",
            inputSchema={
                "type": "object",
                "properties": {
                    "isbn": {
                        "type": "string",
                        "description": "Book ISBN (e.g., '978-988-79489-1-0')"
                    }
                },
                "required": ["isbn"]
            }
        ),
        Tool(
            name="list_regulations_by_jurisdiction",
            description="List ESG regulations for a specific jurisdiction (e.g., 'Hong Kong', 'EU', 'Singapore').",
            inputSchema={
                "type": "object",
                "properties": {
                    "jurisdiction": {
                        "type": "string",
                        "description": "Jurisdiction name"
                    }
                },
                "required": ["jurisdiction"]
            }
        ),
        Tool(
            name="explore_relationships",
            description="Explore relationships between ESG entities. Find what standards address a boundary, what books cover a topic, etc.",
            inputSchema={
                "type": "object",
                "properties": {
                    "entity_id": {
                        "type": "string",
                        "description": "Starting entity ID (e.g., 'planetary_boundary:climate')"
                    },
                    "relationship_type": {
                        "type": "string",
                        "description": "Optional: filter by relationship type (e.g., 'addresses', 'covers', 'implements')"
                    }
                },
                "required": ["entity_id"]
            }
        ),
        Tool(
            name="get_statistics",
            description="Get database statistics showing total counts of all entity types and relationships.",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> list[TextContent]:
    """Handle tool calls"""
    
    if not db:
        return [TextContent(type="text", text="Error: Database not connected")]
    
    try:
        if name == "search_esg_knowledge":
            query = arguments["query"]
            limit = arguments.get("limit", 10)
            
            # Use hybrid search function
            result = await db.query(
                "SELECT * FROM fn::hybrid_search($query, $limit, 0.7)",
                {"query": query, "limit": limit}
            )
            
            return [TextContent(
                type="text",
                text=f"Found {len(result[0]['result'])} results:\n\n" + 
                     "\n\n".join([
                         f"**{item['title']}** ({item['type']})\n{item['description']}\nScore: {item['score']:.2f}"
                         for item in result[0]['result']
                     ])
            )]
        
        elif name == "get_planetary_boundary":
            code = arguments["code"]
            result = await db.query(
                "SELECT * FROM planetary_boundary WHERE code = $code LIMIT 1",
                {"code": code}
            )
            
            if not result[0]["result"]:
                return [TextContent(type="text", text=f"Planetary boundary '{code}' not found")]
            
            boundary = result[0]["result"][0]
            return [TextContent(
                type="text",
                text=f"**{boundary['name']}**\n\n{boundary['description']}\n\n" +
                     f"Control Variable: {boundary['control_variable']}\n" +
                     f"Threshold: {boundary['threshold_value']}\n" +
                     f"Current: {boundary['current_value']}\n" +
                     f"Status: {boundary['status']}\n" +
                     f"Source: {boundary['source_url']}"
            )]
        
        elif name == "get_standard":
            abbr = arguments["abbreviation"]
            result = await db.query(
                "SELECT * FROM standard WHERE abbreviation = $abbr LIMIT 1",
                {"abbr": abbr}
            )
            
            if not result[0]["result"]:
                return [TextContent(type="text", text=f"Standard '{abbr}' not found")]
            
            std = result[0]["result"][0]
            return [TextContent(
                type="text",
                text=f"**{std['full_name']} ({std['abbreviation']})**\n\n{std['description']}\n\n" +
                     f"Category: {std['category']}\n" +
                     f"Issuing Body: {std['issuing_body']}\n" +
                     f"Year: {std['year_established']}\n" +
                     f"Version: {std['latest_version']}\n" +
                     f"Mandatory: {std['is_mandatory']}\n" +
                     f"URL: {std['official_url']}"
            )]
        
        elif name == "list_standards_by_category":
            category = arguments["category"]
            result = await db.query(
                "SELECT * FROM standard WHERE category = $cat ORDER BY abbreviation",
                {"cat": category}
            )
            
            standards = result[0]["result"]
            return [TextContent(
                type="text",
                text=f"Found {len(standards)} {category} standards:\n\n" +
                     "\n".join([f"- {s['abbreviation']}: {s['full_name']}" for s in standards])
            )]
        
        elif name == "get_social_issue":
            code = arguments["code"]
            result = await db.query(
                "SELECT * FROM social_issue WHERE code = $code LIMIT 1",
                {"code": code}
            )
            
            if not result[0]["result"]:
                return [TextContent(type="text", text=f"Social issue '{code}' not found")]
            
            issue = result[0]["result"][0]
            return [TextContent(
                type="text",
                text=f"**{issue['name']} ({issue['code']})**\n\n{issue['description']}\n\n" +
                     f"Core Subject: {issue['core_subject']}\n" +
                     f"ISO 26000: {issue['iso26000_reference']}"
            )]
        
        elif name == "get_governance_topic":
            code = arguments["code"]
            result = await db.query(
                "SELECT * FROM governance_topic WHERE code = $code LIMIT 1",
                {"code": code}
            )
            
            if not result[0]["result"]:
                return [TextContent(type="text", text=f"Governance topic '{code}' not found")]
            
            topic = result[0]["result"][0]
            return [TextContent(
                type="text",
                text=f"**{topic['name']} ({topic['code']})**\n\n{topic['description']}\n\n" +
                     f"Chapter: {topic['chapter']}\n" +
                     f"OECD Reference: {topic['oecd_reference']}"
            )]
        
        elif name == "get_sdg":
            number = arguments["number"]
            result = await db.query(
                "SELECT * FROM sdg WHERE number = $num LIMIT 1",
                {"num": number}
            )
            
            if not result[0]["result"]:
                return [TextContent(type="text", text=f"SDG {number} not found")]
            
            sdg = result[0]["result"][0]
            return [TextContent(
                type="text",
                text=f"**SDG {sdg['number']}: {sdg['name']}**\n\n{sdg['description']}\n\n" +
                     f"Pillar: {sdg['pillar']}\n" +
                     f"URL: {sdg['un_url']}"
            )]
        
        elif name == "get_book":
            isbn = arguments["isbn"]
            result = await db.query(
                "SELECT * FROM book WHERE isbn = $isbn LIMIT 1",
                {"isbn": isbn}
            )
            
            if not result[0]["result"]:
                return [TextContent(type="text", text=f"Book with ISBN '{isbn}' not found")]
            
            book = result[0]["result"][0]
            return [TextContent(
                type="text",
                text=f"**{book['title']}: {book['subtitle']}**\n\nBy {book['author']}\n\n{book['description']}\n\n" +
                     f"Series: {book['series']}\n" +
                     f"Pillar: {book['pillar']}\n" +
                     f"Year: {book['publication_year']}\n" +
                     f"Pages: {book['pages']}\n" +
                     f"Topics: {', '.join(book['topics'])}\n" +
                     f"PDF: {book.get('pdf_url', 'N/A')}"
            )]
        
        elif name == "list_regulations_by_jurisdiction":
            jurisdiction = arguments["jurisdiction"]
            result = await db.query(
                "SELECT * FROM regulation WHERE jurisdiction = $jur ORDER BY code",
                {"jur": jurisdiction}
            )
            
            regulations = result[0]["result"]
            return [TextContent(
                type="text",
                text=f"Found {len(regulations)} regulations for {jurisdiction}:\n\n" +
                     "\n".join([f"- {r['code']}: {r['name']} ({r['type']})" for r in regulations])
            )]
        
        elif name == "explore_relationships":
            entity_id = arguments["entity_id"]
            rel_type = arguments.get("relationship_type")
            
            if rel_type:
                query = f"SELECT * FROM {entity_id}->{rel_type}"
            else:
                query = f"SELECT * FROM {entity_id}->*"
            
            result = await db.query(query)
            
            relationships = result[0]["result"]
            return [TextContent(
                type="text",
                text=f"Found {len(relationships)} relationships:\n\n" +
                     "\n".join([f"- {r.get('type', 'related')}: {r}" for r in relationships[:10]])
            )]
        
        elif name == "get_statistics":
            stats = {}
            
            for table in ["planetary_boundary", "standard", "social_issue", "governance_topic", "sdg", "book", "regulation"]:
                result = await db.query(f"SELECT count() FROM {table} GROUP ALL")
                stats[table] = result[0]["result"][0]["count"] if result[0]["result"] else 0
            
            return [TextContent(
                type="text",
                text="**ESG Hub Statistics**\n\n" +
                     "\n".join([f"- {k.replace('_', ' ').title()}: {v}" for k, v in stats.items()])
            )]
        
        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]
    
    except Exception as e:
        logger.error(f"Error in tool {name}: {e}")
        return [TextContent(type="text", text=f"Error: {str(e)}")]


async def main():
    """Main entry point"""
    logger.info("🚀 Starting ESG Hub MCP Server...")
    
    # Initialize database
    await init_database()
    
    # Run MCP server
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
