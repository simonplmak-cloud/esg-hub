#!/usr/bin/env python3
"""
Generate embeddings for all ESG Hub content using DeepSeek API
Embeds: page content, entity descriptions, relationships
"""

import asyncio
import os
from typing import List, Dict, Any
import httpx
from surrealdb import Surreal


# DeepSeek API configuration
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_EMBED_URL = "https://api.deepseek.com/v1/embeddings"
EMBED_MODEL = "deepseek-embed"  # 1536-dimensional embeddings


async def generate_embedding(text: str) -> List[float]:
    """Generate embedding for a single text using DeepSeek API"""
    
    if not DEEPSEEK_API_KEY:
        raise ValueError("DEEPSEEK_API_KEY environment variable not set")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            DEEPSEEK_EMBED_URL,
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": EMBED_MODEL,
                "input": text
            },
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise Exception(f"DeepSeek API error: {response.status_code} - {response.text}")
        
        data = response.json()
        return data["data"][0]["embedding"]


async def embed_planetary_boundaries(db: Surreal) -> None:
    """Generate embeddings for planetary boundaries"""
    
    print("🌍 Embedding Planetary Boundaries...")
    
    boundaries = await db.query("SELECT * FROM planetary_boundary")
    
    for boundary in boundaries[0]["result"]:
        # Create embedding text from name + description + control variables
        embed_text = f"{boundary['name']}. {boundary['description']} Control variable: {boundary['control_variable']}. Current status: {boundary['status']}."
        
        embedding = await generate_embedding(embed_text)
        
        # Update boundary with embedding
        await db.query(
            "UPDATE $id SET embedding = $emb",
            {"id": boundary["id"], "emb": embedding}
        )
        
        print(f"  ✓ Embedded: {boundary['name']}")
    
    print("✅ Planetary boundaries embedded\n")


async def embed_standards(db: Surreal) -> None:
    """Generate embeddings for ESG standards"""
    
    print("📊 Embedding ESG Standards...")
    
    standards = await db.query("SELECT * FROM standard")
    
    for standard in standards[0]["result"]:
        # Create embedding text
        embed_text = f"{standard['full_name']} ({standard['abbreviation']}). {standard['description']} Category: {standard['category']}. Issuing body: {standard['issuing_body']}."
        
        embedding = await generate_embedding(embed_text)
        
        await db.query(
            "UPDATE $id SET embedding = $emb",
            {"id": standard["id"], "emb": embedding}
        )
        
        print(f"  ✓ Embedded: {standard['abbreviation']}")
    
    print("✅ Standards embedded\n")


async def embed_social_issues(db: Surreal) -> None:
    """Generate embeddings for social issues"""
    
    print("👥 Embedding Social Issues...")
    
    issues = await db.query("SELECT * FROM social_issue")
    
    for issue in issues[0]["result"]:
        embed_text = f"{issue['name']}. {issue['description']} Core subject: {issue['core_subject']}. ISO 26000 reference: {issue['iso26000_reference']}."
        
        embedding = await generate_embedding(embed_text)
        
        await db.query(
            "UPDATE $id SET embedding = $emb",
            {"id": issue["id"], "emb": embedding}
        )
        
        print(f"  ✓ Embedded: {issue['code']}")
    
    print("✅ Social issues embedded\n")


async def embed_governance_topics(db: Surreal) -> None:
    """Generate embeddings for governance topics"""
    
    print("⚖️  Embedding Governance Topics...")
    
    topics = await db.query("SELECT * FROM governance_topic")
    
    for topic in topics[0]["result"]:
        embed_text = f"{topic['name']}. {topic['description']} Chapter: {topic['chapter']}. OECD reference: {topic['oecd_reference']}."
        
        embedding = await generate_embedding(embed_text)
        
        await db.query(
            "UPDATE $id SET embedding = $emb",
            {"id": topic["id"], "emb": embedding}
        )
        
        print(f"  ✓ Embedded: {topic['code']}")
    
    print("✅ Governance topics embedded\n")


async def embed_sdgs(db: Surreal) -> None:
    """Generate embeddings for SDGs"""
    
    print("🎯 Embedding SDGs...")
    
    sdgs = await db.query("SELECT * FROM sdg")
    
    for sdg in sdgs[0]["result"]:
        embed_text = f"SDG {sdg['number']}: {sdg['name']}. {sdg['description']} Pillar: {sdg['pillar']}."
        
        embedding = await generate_embedding(embed_text)
        
        await db.query(
            "UPDATE $id SET embedding = $emb",
            {"id": sdg["id"], "emb": embedding}
        )
        
        print(f"  ✓ Embedded: SDG {sdg['number']}")
    
    print("✅ SDGs embedded\n")


async def embed_books(db: Surreal) -> None:
    """Generate embeddings for books"""
    
    print("📚 Embedding Books...")
    
    books = await db.query("SELECT * FROM book")
    
    for book in books[0]["result"]:
        embed_text = f"{book['title']}: {book['subtitle']}. {book['description']} Topics: {', '.join(book['topics'])}. Pillar: {book['pillar']}."
        
        embedding = await generate_embedding(embed_text)
        
        await db.query(
            "UPDATE $id SET embedding = $emb",
            {"id": book["id"], "emb": embedding}
        )
        
        print(f"  ✓ Embedded: {book['title'][:40]}...")
    
    print("✅ Books embedded\n")


async def embed_regulations(db: Surreal) -> None:
    """Generate embeddings for regulations"""
    
    print("📜 Embedding Regulations...")
    
    regulations = await db.query("SELECT * FROM regulation")
    
    for reg in regulations[0]["result"]:
        embed_text = f"{reg['name']} ({reg['code']}). Jurisdiction: {reg['jurisdiction']}. Type: {reg['type']}. Issuer: {reg['issuer']}. Mandatory: {reg['is_mandatory']}."
        
        embedding = await generate_embedding(embed_text)
        
        await db.query(
            "UPDATE $id SET embedding = $emb",
            {"id": reg["id"], "emb": embedding}
        )
        
        print(f"  ✓ Embedded: {reg['code']}")
    
    print("✅ Regulations embedded\n")


async def main():
    """Main entry point"""
    
    if not DEEPSEEK_API_KEY:
        print("❌ Error: DEEPSEEK_API_KEY environment variable not set")
        print("   Please set it with: export DEEPSEEK_API_KEY='your-api-key'")
        return
    
    # Connect to SurrealDB
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    
    try:
        print("🚀 Starting embeddings generation...\n")
        
        await embed_planetary_boundaries(db)
        await embed_standards(db)
        await embed_social_issues(db)
        await embed_governance_topics(db)
        await embed_sdgs(db)
        await embed_books(db)
        await embed_regulations(db)
        
        print("🎉 All embeddings generated successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
