#!/usr/bin/env python3
"""
Seed script for G20/OECD Corporate Governance Topics
Data source: G20/OECD Principles of Corporate Governance (2023)
"""

import asyncio
from typing import List, Dict, Any
from surrealdb import Surreal

# G20/OECD 2023 Governance Topics (33 topics across 6 chapters)
GOVERNANCE_DATA: List[Dict[str, Any]] = [
    # Chapter 1: Effective CG Framework
    {"code": "G1.1", "name": "Legal and Regulatory Framework", "chapter": "effective_framework", "description": "Comprehensive legal and regulatory framework supporting effective corporate governance.", "oecd_reference": "Chapter I.A"},
    {"code": "G1.2", "name": "Division of Responsibilities", "chapter": "effective_framework", "description": "Clear division of responsibilities among supervisory, regulatory and enforcement authorities.", "oecd_reference": "Chapter I.B"},
    {"code": "G1.3", "name": "Enforcement and Compliance", "chapter": "effective_framework", "description": "Effective enforcement mechanisms and compliance procedures.", "oecd_reference": "Chapter I.C"},
    {"code": "G1.4", "name": "Market Integrity", "chapter": "effective_framework", "description": "Framework to promote transparent and fair markets.", "oecd_reference": "Chapter I.D"},
    
    # Chapter 2: Shareholder Rights
    {"code": "G2.1", "name": "Basic Shareholder Rights", "chapter": "shareholder_rights", "description": "Secure methods of ownership registration, transfer, and voting rights.", "oecd_reference": "Chapter II.A"},
    {"code": "G2.2", "name": "Information Rights", "chapter": "shareholder_rights", "description": "Right to obtain relevant and material company information on a timely basis.", "oecd_reference": "Chapter II.B"},
    {"code": "G2.3", "name": "Participation in General Meetings", "chapter": "shareholder_rights", "description": "Right to participate in and be informed about general shareholder meetings.", "oecd_reference": "Chapter II.C"},
    {"code": "G2.4", "name": "Capital Structure Transparency", "chapter": "shareholder_rights", "description": "Disclosure of capital structures and arrangements enabling disproportionate control.", "oecd_reference": "Chapter II.D"},
    {"code": "G2.5", "name": "Markets for Corporate Control", "chapter": "shareholder_rights", "description": "Functioning of markets for corporate control with transparent and equitable rules.", "oecd_reference": "Chapter II.E"},
    
    # Chapter 3: Institutional Investors
    {"code": "G3.1", "name": "Stewardship Responsibilities", "chapter": "institutional_investors", "description": "Exercise of ownership rights and stewardship responsibilities by institutional investors.", "oecd_reference": "Chapter III.A"},
    {"code": "G3.2", "name": "Conflicts of Interest", "chapter": "institutional_investors", "description": "Management of conflicts of interest in institutional investor activities.", "oecd_reference": "Chapter III.B"},
    {"code": "G3.3", "name": "Voting Policies", "chapter": "institutional_investors", "description": "Development and disclosure of voting policies and voting records.", "oecd_reference": "Chapter III.C"},
    {"code": "G3.4", "name": "Asset Manager Accountability", "chapter": "institutional_investors", "description": "Accountability of asset managers to beneficial owners.", "oecd_reference": "Chapter III.D"},
    {"code": "G3.5", "name": "Collective Engagement", "chapter": "institutional_investors", "description": "Facilitation of collective engagement by institutional investors.", "oecd_reference": "Chapter III.E"},
    
    # Chapter 4: Disclosure & Transparency
    {"code": "G4.1", "name": "Financial and Operating Results", "chapter": "disclosure_transparency", "description": "Timely and accurate disclosure of financial and operating results.", "oecd_reference": "Chapter IV.A"},
    {"code": "G4.2", "name": "Company Objectives and Strategy", "chapter": "disclosure_transparency", "description": "Disclosure of company objectives, strategy, and implementation plans.", "oecd_reference": "Chapter IV.B"},
    {"code": "G4.3", "name": "Major Share Ownership", "chapter": "disclosure_transparency", "description": "Disclosure of major share ownership and voting rights.", "oecd_reference": "Chapter IV.C"},
    {"code": "G4.4", "name": "Board and Key Executives", "chapter": "disclosure_transparency", "description": "Information on board members, key executives, and their remuneration.", "oecd_reference": "Chapter IV.D"},
    {"code": "G4.5", "name": "Material Risk Factors", "chapter": "disclosure_transparency", "description": "Disclosure of material foreseeable risk factors including sustainability risks.", "oecd_reference": "Chapter IV.E"},
    
    # Chapter 5: Board Responsibilities  
    {"code": "G5.1", "name": "Board Strategic Guidance", "chapter": "board_responsibilities", "description": "Board oversight of corporate strategy, business plans, and performance objectives.", "oecd_reference": "Chapter V.A"},
    {"code": "G5.2", "name": "Board Monitoring", "chapter": "board_responsibilities", "description": "Monitoring of managerial performance and return to shareholders.", "oecd_reference": "Chapter V.B"},
    {"code": "G5.3", "name": "Board Independence", "chapter": "board_responsibilities", "description": "Independent judgment on corporate affairs including conflicts of interest.", "oecd_reference": "Chapter V.C"},
    {"code": "G5.4", "name": "Board Composition", "chapter": "board_responsibilities", "description": "Appropriate skills, diversity, and independence in board composition.", "oecd_reference": "Chapter V.D"},
    {"code": "G5.5", "name": "Board Committees", "chapter": "board_responsibilities", "description": "Establishment of specialized board committees (audit, nomination, remuneration).", "oecd_reference": "Chapter V.E"},
    {"code": "G5.6", "name": "Board Information Access", "chapter": "board_responsibilities", "description": "Board access to accurate, relevant and timely information.", "oecd_reference": "Chapter V.F"},
    {"code": "G5.7", "name": "Board Evaluation", "chapter": "board_responsibilities", "description": "Regular board performance evaluation and continuous improvement.", "oecd_reference": "Chapter V.G"},
    
    # Chapter 6: Sustainability & Resilience
    {"code": "G6.1", "name": "Sustainability Strategy Integration", "chapter": "sustainability_resilience", "description": "Integration of sustainability considerations into corporate strategy and risk management.", "oecd_reference": "Chapter VI.A"},
    {"code": "G6.2", "name": "Stakeholder Engagement", "chapter": "sustainability_resilience", "description": "Engagement with stakeholders on sustainability matters.", "oecd_reference": "Chapter VI.B"},
    {"code": "G6.3", "name": "Sustainability Disclosure", "chapter": "sustainability_resilience", "description": "Disclosure of material sustainability information and impacts.", "oecd_reference": "Chapter VI.C"},
    {"code": "G6.4", "name": "Climate-Related Risks", "chapter": "sustainability_resilience", "description": "Identification, assessment and management of climate-related risks and opportunities.", "oecd_reference": "Chapter VI.D"},
    {"code": "G6.5", "name": "Board Sustainability Oversight", "chapter": "sustainability_resilience", "description": "Board oversight of sustainability strategy and performance.", "oecd_reference": "Chapter VI.E"},
    {"code": "G6.6", "name": "Long-term Value Creation", "chapter": "sustainability_resilience", "description": "Focus on long-term value creation and corporate resilience.", "oecd_reference": "Chapter VI.F"}
]


async def seed_governance(db: Surreal) -> None:
    """Seed G20/OECD governance topics into SurrealDB"""
    
    print("⚖️  Seeding G20/OECD Corporate Governance Topics...")
    
    for topic in GOVERNANCE_DATA:
        existing = await db.query(
            "SELECT * FROM governance_topic WHERE code = $code",
            {"code": topic["code"]}
        )
        
        if existing[0]["result"]:
            print(f"  ⏭️  {topic['code']} already exists, skipping")
            continue
        
        result = await db.create("governance_topic", topic)
        print(f"  ✓ Created: {topic['code']} - {topic['name'][:50]}...")
    
    print("✅ Governance topics seeded successfully\n")


async def main():
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    
    try:
        await seed_governance(db)
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
