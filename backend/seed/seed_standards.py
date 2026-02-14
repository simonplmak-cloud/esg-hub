#!/usr/bin/env python3
"""
Seed script for ESG Standards & Frameworks
Data sources: Official standard-setter websites
"""

import asyncio
from typing import List, Dict, Any
from surrealdb import Surreal

# ESG Standards data
STANDARDS_DATA: List[Dict[str, Any]] = [
    # === DISCLOSURE STANDARDS ===
    {
        "abbreviation": "IFRS-S1",
        "full_name": "IFRS S1 General Requirements for Disclosure of Sustainability-related Financial Information",
        "category": "disclosure",
        "description": "Core standard requiring disclosure of material sustainability-related risks and opportunities that could affect enterprise value.",
        "issuing_body": "International Sustainability Standards Board (ISSB)",
        "year_established": 2023,
        "latest_version": "2023",
        "is_mandatory": True,
        "jurisdictions": ["UK", "EU", "Hong Kong", "Singapore", "Japan", "Australia", "Canada"],
        "official_url": "https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/ifrs-s1-general-requirements/",
        "document_url": "https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2023/issued/part-a/ifrs-s1-general-requirements-for-disclosure-of-sustainability-related-financial-information.pdf"
    },
    {
        "abbreviation": "IFRS-S2",
        "full_name": "IFRS S2 Climate-related Disclosures",
        "category": "climate",
        "description": "Requires disclosure of climate-related risks and opportunities, including Scope 1, 2, and 3 GHG emissions, aligned with TCFD.",
        "issuing_body": "International Sustainability Standards Board (ISSB)",
        "year_established": 2023,
        "latest_version": "2023",
        "is_mandatory": True,
        "jurisdictions": ["UK", "EU", "Hong Kong", "Singapore", "Japan", "Australia", "Canada"],
        "official_url": "https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/ifrs-s2-climate-related-disclosures/",
        "document_url": "https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2023/issued/part-a/ifrs-s2-climate-related-disclosures.pdf"
    },
    {
        "abbreviation": "GRI",
        "full_name": "GRI Standards (Global Reporting Initiative)",
        "category": "disclosure",
        "description": "Comprehensive sustainability reporting framework covering economic, environmental, and social impacts. Most widely used globally.",
        "issuing_body": "Global Reporting Initiative (GRI)",
        "year_established": 1997,
        "latest_version": "2021 (Universal Standards)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://www.globalreporting.org/standards/",
        "document_url": "https://www.globalreporting.org/how-to-use-the-gri-standards/gri-standards-english-language/"
    },
    {
        "abbreviation": "SASB",
        "full_name": "SASB Standards (Sustainability Accounting Standards Board)",
        "category": "disclosure",
        "description": "Industry-specific standards for financially material sustainability information, now part of IFRS Foundation.",
        "issuing_body": "Value Reporting Foundation (now IFRS Foundation)",
        "year_established": 2011,
        "latest_version": "2018 (77 industry standards)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://www.sasb.org/standards/",
        "document_url": "https://www.sasb.org/standards/download/"
    },
    {
        "abbreviation": "ESRS",
        "full_name": "European Sustainability Reporting Standards",
        "category": "disclosure",
        "description": "Mandatory EU standards under CSRD, covering double materiality (financial and impact materiality).",
        "issuing_body": "European Financial Reporting Advisory Group (EFRAG)",
        "year_established": 2023,
        "latest_version": "2023 (12 standards)",
        "is_mandatory": True,
        "jurisdictions": ["EU"],
        "official_url": "https://www.efrag.org/lab6",
        "document_url": "https://www.efrag.org/Assets/Download?assetUrl=%2Fsites%2Fwebpublishing%2FSiteAssets%2FED_ESRS_E1.pdf"
    },
    
    # === CLIMATE & NATURE STANDARDS ===
    {
        "abbreviation": "TCFD",
        "full_name": "Task Force on Climate-related Financial Disclosures",
        "category": "climate",
        "description": "Framework for climate risk disclosure across governance, strategy, risk management, and metrics & targets. Now consolidated into IFRS S2.",
        "issuing_body": "Financial Stability Board (FSB)",
        "year_established": 2017,
        "latest_version": "2023 (final guidance)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://www.fsb-tcfd.org/",
        "document_url": "https://assets.bbhub.io/company/sites/60/2023/07/2023_TCFD_Status_Report.pdf"
    },
    {
        "abbreviation": "TNFD",
        "full_name": "Taskforce on Nature-related Financial Disclosures",
        "category": "nature",
        "description": "Framework for nature-related risk disclosure, mirroring TCFD structure for biodiversity and ecosystem services.",
        "issuing_body": "Taskforce on Nature-related Financial Disclosures",
        "year_established": 2023,
        "latest_version": "v1.0 (September 2023)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://tnfd.global/",
        "document_url": "https://tnfd.global/publication/recommendations-of-the-taskforce-on-nature-related-financial-disclosures/"
    },
    {
        "abbreviation": "GHG-Protocol",
        "full_name": "GHG Protocol Corporate Accounting and Reporting Standard",
        "category": "climate",
        "description": "Global standard for measuring and managing greenhouse gas emissions (Scope 1, 2, 3). Foundation for carbon accounting.",
        "issuing_body": "World Resources Institute (WRI) and World Business Council for Sustainable Development (WBCSD)",
        "year_established": 2001,
        "latest_version": "Revised 2015",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://ghgprotocol.org/corporate-standard",
        "document_url": "https://ghgprotocol.org/sites/default/files/standards/ghg-protocol-revised.pdf"
    },
    {
        "abbreviation": "SBTi",
        "full_name": "Science Based Targets initiative",
        "category": "climate",
        "description": "Framework for setting corporate emissions reduction targets aligned with climate science (1.5°C pathway).",
        "issuing_body": "CDP, UN Global Compact, WRI, WWF",
        "year_established": 2015,
        "latest_version": "Corporate Net-Zero Standard (2021)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://sciencebasedtargets.org/",
        "document_url": "https://sciencebasedtargets.org/resources/files/Net-Zero-Standard.pdf"
    },
    {
        "abbreviation": "CDP",
        "full_name": "CDP (formerly Carbon Disclosure Project)",
        "category": "climate",
        "description": "Global disclosure system for environmental impact (climate, water, forests). Runs world's largest environmental database.",
        "issuing_body": "CDP Worldwide",
        "year_established": 2000,
        "latest_version": "2024 Questionnaires",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://www.cdp.net/",
        "document_url": "https://guidance.cdp.net/en/guidance"
    },
    {
        "abbreviation": "PCAF",
        "full_name": "Partnership for Carbon Accounting Financials",
        "category": "climate",
        "description": "Global standard for measuring and disclosing financed emissions (GHG emissions of loans and investments).",
        "issuing_body": "Partnership for Carbon Accounting Financials",
        "year_established": 2015,
        "latest_version": "Global GHG Accounting & Reporting Standard Part A (2022)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://carbonaccountingfinancials.com/",
        "document_url": "https://carbonaccountingfinancials.com/files/downloads/PCAF-Global-GHG-Standard.pdf"
    },
    {
        "abbreviation": "SBTN",
        "full_name": "Science Based Targets Network",
        "category": "nature",
        "description": "Framework for setting science-based targets for nature (freshwater, land, ocean, biodiversity, climate).",
        "issuing_body": "Science Based Targets Network",
        "year_established": 2019,
        "latest_version": "Initial Guidance (2023)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://sciencebasedtargetsnetwork.org/",
        "document_url": "https://sciencebasedtargetsnetwork.org/wp-content/uploads/2023/05/Technical-Guidance-2023-Step3-Land-v1.pdf"
    },
    
    # === SOCIAL & GOVERNANCE STANDARDS ===
    {
        "abbreviation": "ISO-26000",
        "full_name": "ISO 26000 Guidance on Social Responsibility",
        "category": "social",
        "description": "International standard providing guidance on social responsibility across 7 core subjects, including human rights and labour practices.",
        "issuing_body": "International Organization for Standardization (ISO)",
        "year_established": 2010,
        "latest_version": "2010",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://www.iso.org/iso-26000-social-responsibility.html",
        "document_url": "https://www.iso.org/standard/42546.html"
    },
    {
        "abbreviation": "OECD-CG",
        "full_name": "G20/OECD Principles of Corporate Governance",
        "category": "governance",
        "description": "International standard for corporate governance, covering board responsibilities, shareholder rights, and sustainability integration.",
        "issuing_body": "Organisation for Economic Co-operation and Development (OECD)",
        "year_established": 1999,
        "latest_version": "2023 (revised)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://www.oecd.org/corporate/principles-corporate-governance/",
        "document_url": "https://www.oecd.org/corporate/G20-OECD-Principles-Corporate-Governance-2023.pdf"
    },
    {
        "abbreviation": "UNGP",
        "full_name": "UN Guiding Principles on Business and Human Rights",
        "category": "social",
        "description": "Authoritative global standard for preventing and addressing human rights impacts linked to business activity.",
        "issuing_body": "United Nations Human Rights Council",
        "year_established": 2011,
        "latest_version": "2011",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://www.ohchr.org/en/publications/reference-publications/guiding-principles-business-and-human-rights",
        "document_url": "https://www.ohchr.org/sites/default/files/documents/publications/guidingprinciplesbusinesshr_en.pdf"
    },
    {
        "abbreviation": "UNGC",
        "full_name": "UN Global Compact Ten Principles",
        "category": "social",
        "description": "Universal principles covering human rights, labour, environment, and anti-corruption. World's largest corporate sustainability initiative.",
        "issuing_body": "United Nations Global Compact",
        "year_established": 2000,
        "latest_version": "2000 (principles remain unchanged)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://unglobalcompact.org/what-is-gc/mission/principles",
        "document_url": "https://unglobalcompact.org/library/1"
    },
    {
        "abbreviation": "ILO",
        "full_name": "ILO Core Conventions on Labour Standards",
        "category": "social",
        "description": "Eight fundamental conventions covering freedom of association, forced labour, child labour, and discrimination.",
        "issuing_body": "International Labour Organization (ILO)",
        "year_established": 1998,
        "latest_version": "1998 Declaration (reaffirmed 2022)",
        "is_mandatory": False,
        "jurisdictions": ["Global"],
        "official_url": "https://www.ilo.org/global/standards/introduction-to-international-labour-standards/conventions-and-recommendations/lang--en/index.htm",
        "document_url": "https://www.ilo.org/wcmsp5/groups/public/---ed_norm/---declaration/documents/publication/wcms_467653.pdf"
    }
]


async def seed_standards(db: Surreal) -> None:
    """Seed ESG standards into SurrealDB"""
    
    print("📊 Seeding ESG Standards & Frameworks...")
    
    for standard in STANDARDS_DATA:
        # Check if standard already exists
        existing = await db.query(
            "SELECT * FROM standard WHERE abbreviation = $abbr",
            {"abbr": standard["abbreviation"]}
        )
        
        if existing[0]["result"]:
            print(f"  ⏭️  {standard['abbreviation']} already exists, skipping")
            continue
        
        # Insert standard
        result = await db.create(
            "standard",
            standard
        )
        
        mandatory_emoji = "🔒" if standard["is_mandatory"] else "🔓"
        print(f"  {mandatory_emoji} Created: {standard['abbreviation']} - {standard['full_name'][:60]}...")
    
    print("✅ ESG standards seeded successfully\n")


async def main():
    """Main entry point"""
    # Connect to SurrealDB
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    
    try:
        await seed_standards(db)
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
