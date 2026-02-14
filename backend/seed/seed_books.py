#!/usr/bin/env python3
"""
Seed script for Simon Mak's ESG Book Collection
Data source: Ascent Partners Foundation book catalog
"""

import asyncio
from typing import List, Dict, Any
from surrealdb import Surreal

# Simon Mak's 10 ESG Books
BOOKS_DATA: List[Dict[str, Any]] = [
    {
        "isbn": "978-988-79489-0-3",
        "title": "ESG Investing Made Simple",
        "subtitle": "A Beginner's Guide to Sustainable Finance",
        "author": "Simon Mak",
        "series": "made_simple",
        "pillar": "cross-cutting",
        "publication_year": 2021,
        "pages": 156,
        "description": "An accessible introduction to ESG investing principles, covering environmental, social, and governance factors in investment decisions. Explains key concepts, frameworks, and practical implementation strategies for individual and institutional investors.",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/esg-investing-made-simple.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948903",
        "topics": ["ESG integration", "sustainable finance", "impact investing", "portfolio management", "risk assessment"]
    },
    {
        "isbn": "978-988-79489-1-0",
        "title": "Climate Change Made Simple",
        "subtitle": "Understanding the Science and Solutions",
        "author": "Simon Mak",
        "series": "made_simple",
        "pillar": "environmental",
        "publication_year": 2021,
        "pages": 168,
        "description": "Comprehensive guide to climate science, covering greenhouse gas emissions, planetary boundaries, climate models, and mitigation strategies. Bridges scientific concepts with business implications and policy frameworks.",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/climate-change-made-simple.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948911",
        "topics": ["climate science", "GHG emissions", "carbon accounting", "TCFD", "net-zero", "climate risk"]
    },
    {
        "isbn": "978-988-79489-2-7",
        "title": "Biodiversity Made Simple",
        "subtitle": "Nature-Related Risks and Opportunities",
        "author": "Simon Mak",
        "series": "made_simple",
        "pillar": "environmental",
        "publication_year": 2022,
        "pages": 144,
        "description": "Explores biodiversity loss, ecosystem services, and nature-related financial risks. Covers TNFD framework, natural capital accounting, and business dependencies on nature.",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/biodiversity-made-simple.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948927",
        "topics": ["biodiversity", "ecosystem services", "TNFD", "natural capital", "nature-based solutions"]
    },
    {
        "isbn": "978-988-79489-3-4",
        "title": "Human Rights Made Simple",
        "subtitle": "Business Responsibilities and Due Diligence",
        "author": "Simon Mak",
        "series": "made_simple",
        "pillar": "social",
        "publication_year": 2022,
        "pages": 152,
        "description": "Practical guide to UN Guiding Principles on Business and Human Rights (UNGPs), covering human rights due diligence, salient issues identification, and remedy mechanisms.",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/human-rights-made-simple.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948934",
        "topics": ["human rights", "UNGP", "due diligence", "modern slavery", "supply chain", "remedy"]
    },
    {
        "isbn": "978-988-79489-4-1",
        "title": "Corporate Governance Made Simple",
        "subtitle": "Board Effectiveness and Stakeholder Value",
        "author": "Simon Mak",
        "series": "made_simple",
        "pillar": "governance",
        "publication_year": 2022,
        "pages": 160,
        "description": "Covers G20/OECD Principles of Corporate Governance (2023), board composition, executive compensation, shareholder rights, and sustainability integration in governance.",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/corporate-governance-made-simple.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948941",
        "topics": ["corporate governance", "board effectiveness", "shareholder rights", "executive compensation", "OECD principles"]
    },
    {
        "isbn": "978-988-79489-5-8",
        "title": "ESG Reporting in Practice",
        "subtitle": "IFRS S1 and S2 Implementation Guide",
        "author": "Simon Mak",
        "series": "in_practice",
        "pillar": "cross-cutting",
        "publication_year": 2023,
        "pages": 224,
        "description": "Detailed implementation guide for IFRS S1 and S2, covering materiality assessment, stakeholder engagement, disclosure requirements, and assurance. Includes case studies and templates.",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/esg-reporting-in-practice.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948958",
        "topics": ["IFRS S1", "IFRS S2", "sustainability reporting", "materiality", "assurance", "TCFD"]
    },
    {
        "isbn": "978-988-79489-6-5",
        "title": "Carbon Accounting in Practice",
        "subtitle": "GHG Protocol and Net-Zero Strategies",
        "author": "Simon Mak",
        "series": "in_practice",
        "pillar": "environmental",
        "publication_year": 2023,
        "pages": 196,
        "description": "Comprehensive guide to GHG Protocol Corporate Standard, Scope 3 calculation methodologies, SBTi target-setting, and net-zero transition planning. Includes industry-specific examples.",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/carbon-accounting-in-practice.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948965",
        "topics": ["GHG Protocol", "Scope 3", "carbon footprint", "SBTi", "net-zero", "decarbonization"]
    },
    {
        "isbn": "978-988-79489-7-2",
        "title": "Supply Chain Due Diligence in Practice",
        "subtitle": "Human Rights and Environmental Compliance",
        "author": "Simon Mak",
        "series": "in_practice",
        "pillar": "social",
        "publication_year": 2023,
        "pages": 208,
        "description": "Practical framework for supply chain due diligence, covering risk assessment, supplier audits, corrective action plans, and regulatory compliance (EU CSDDD, German Supply Chain Act).",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/supply-chain-due-diligence-in-practice.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948972",
        "topics": ["supply chain", "due diligence", "human rights", "forced labour", "audit", "compliance"]
    },
    {
        "isbn": "978-988-79489-8-9",
        "title": "Board ESG Oversight in Practice",
        "subtitle": "Director Responsibilities and Risk Governance",
        "author": "Simon Mak",
        "series": "in_practice",
        "pillar": "governance",
        "publication_year": 2024,
        "pages": 184,
        "description": "Guide for board directors on ESG oversight, covering committee structures, risk governance, executive incentives, and sustainability-linked compensation.",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/board-esg-oversight-in-practice.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948989",
        "topics": ["board oversight", "ESG governance", "risk management", "director duties", "executive compensation"]
    },
    {
        "isbn": "978-988-79489-9-6",
        "title": "Nature-Related Disclosure in Practice",
        "subtitle": "TNFD Implementation and Natural Capital Assessment",
        "author": "Simon Mak",
        "series": "in_practice",
        "pillar": "environmental",
        "publication_year": 2024,
        "pages": 192,
        "description": "Implementation guide for TNFD framework, covering LEAP approach (Locate, Evaluate, Assess, Prepare), nature-related dependencies and impacts, and scenario analysis.",
        "cover_url": "https://esg-hub.ascent.partners/assets/images/covers/nature-related-disclosure-in-practice.jpg",
        "pdf_url": None,
        "purchase_url": "https://www.amazon.com/dp/9887948996",
        "topics": ["TNFD", "LEAP", "natural capital", "biodiversity", "ecosystem services", "nature risk"]
    }
]


async def seed_books(db: Surreal) -> None:
    """Seed Simon Mak's ESG books into SurrealDB"""
    
    print("📚 Seeding Simon Mak's ESG Book Collection...")
    
    for book in BOOKS_DATA:
        # Check if book already exists
        existing = await db.query(
            "SELECT * FROM book WHERE isbn = $isbn",
            {"isbn": book["isbn"]}
        )
        
        if existing[0]["result"]:
            print(f"  ⏭️  {book['title']} already exists, skipping")
            continue
        
        # Insert book
        result = await db.create(
            "book",
            book
        )
        
        series_emoji = "📖" if book["series"] == "made_simple" else "📘"
        print(f"  {series_emoji} Created: {book['title']} ({book['publication_year']})")
    
    print("✅ Books seeded successfully\n")


async def main():
    """Main entry point"""
    # Connect to SurrealDB
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    
    try:
        await seed_books(db)
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
