#!/usr/bin/env python3
"""
Seed script for Regional ESG Regulations
Data sources: Official regulatory bodies
"""

import asyncio
from typing import List, Dict, Any
from surrealdb import Surreal

REGULATIONS_DATA: List[Dict[str, Any]] = [
    # Hong Kong
    {"code": "HK-HKEX-ESG", "name": "HKEX ESG Reporting Guide", "jurisdiction": "Hong Kong", "type": "disclosure", "issuer": "Hong Kong Exchanges and Clearing Limited", "year": 2024, "is_mandatory": True, "url": "https://www.hkex.com.hk/Listing/Rules-and-Guidance/Environmental-Social-and-Governance/Overview"},
    {"code": "HK-TCFD", "name": "TCFD-aligned Climate Disclosures", "jurisdiction": "Hong Kong", "type": "climate", "issuer": "HKEX", "year": 2025, "is_mandatory": True, "url": "https://www.hkex.com.hk/News/Market-Consultations/2023/Conclusions-Climate-related-Disclosures"},
    {"code": "HK-GBA-ISSB", "name": "GBA ISSB Standards Adoption", "jurisdiction": "Hong Kong", "type": "disclosure", "issuer": "HKEX", "year": 2024, "is_mandatory": False, "url": "https://www.hkex.com.hk/"},
    
    # China
    {"code": "CN-CSRC-ESG", "name": "CSRC ESG Disclosure Guidelines", "jurisdiction": "China", "type": "disclosure", "issuer": "China Securities Regulatory Commission", "year": 2024, "is_mandatory": True, "url": "http://www.csrc.gov.cn/"},
    {"code": "CN-CBIRC", "name": "Green Finance Guidelines for Banking Sector", "jurisdiction": "China", "type": "finance", "issuer": "China Banking and Insurance Regulatory Commission", "year": 2022, "is_mandatory": True, "url": "http://www.cbirc.gov.cn/"},
    
    # Singapore
    {"code": "SG-SGX-SR", "name": "SGX Sustainability Reporting Rules", "jurisdiction": "Singapore", "type": "disclosure", "issuer": "Singapore Exchange", "year": 2023, "is_mandatory": True, "url": "https://www.sgx.com/regulation/sustainability-reporting"},
    {"code": "SG-MAS-Green", "name": "MAS Green Finance Action Plan", "jurisdiction": "Singapore", "type": "finance", "issuer": "Monetary Authority of Singapore", "year": 2023, "is_mandatory": False, "url": "https://www.mas.gov.sg/development/sustainable-finance"},
    
    # EU
    {"code": "EU-CSRD", "name": "Corporate Sustainability Reporting Directive", "jurisdiction": "European Union", "type": "disclosure", "issuer": "European Commission", "year": 2023, "is_mandatory": True, "url": "https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en"},
    {"code": "EU-SFDR", "name": "Sustainable Finance Disclosure Regulation", "jurisdiction": "European Union", "type": "finance", "issuer": "European Commission", "year": 2021, "is_mandatory": True, "url": "https://finance.ec.europa.eu/sustainable-finance/disclosures/sustainability-related-disclosure-financial-services-sector_en"},
    {"code": "EU-Taxonomy", "name": "EU Taxonomy for Sustainable Activities", "jurisdiction": "European Union", "type": "classification", "issuer": "European Commission", "year": 2020, "is_mandatory": True, "url": "https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en"},
    
    # Japan
    {"code": "JP-TSE-CG", "name": "TSE Corporate Governance Code", "jurisdiction": "Japan", "type": "governance", "issuer": "Tokyo Stock Exchange", "year": 2021, "is_mandatory": True, "url": "https://www.jpx.co.jp/english/news/1020/b5b4pj000000jvxr-att/20210611en.pdf"},
    {"code": "JP-FSA-TCFD", "name": "FSA TCFD Guidance", "jurisdiction": "Japan", "type": "climate", "issuer": "Financial Services Agency", "year": 2022, "is_mandatory": False, "url": "https://www.fsa.go.jp/"},
    
    # Australia
    {"code": "AU-ASX-CG", "name": "ASX Corporate Governance Principles", "jurisdiction": "Australia", "type": "governance", "issuer": "ASX Corporate Governance Council", "year": 2024, "is_mandatory": False, "url": "https://www.asx.com.au/regulation/governance.htm"},
    {"code": "AU-APRA-CPG229", "name": "APRA Climate Risk Guidance (CPG 229)", "jurisdiction": "Australia", "type": "climate", "issuer": "Australian Prudential Regulation Authority", "year": 2021, "is_mandatory": True, "url": "https://www.apra.gov.au/climate-change-financial-risks"},
    
    # ASEAN
    {"code": "ASEAN-Taxonomy", "name": "ASEAN Taxonomy for Sustainable Finance", "jurisdiction": "ASEAN", "type": "classification", "issuer": "ASEAN Capital Markets Forum", "year": 2023, "is_mandatory": False, "url": "https://asean.org/"},
]


async def seed_regulations(db: Surreal) -> None:
    """Seed regional regulations into SurrealDB"""
    
    print("📜 Seeding Regional ESG Regulations...")
    
    for reg in REGULATIONS_DATA:
        existing = await db.query(
            "SELECT * FROM regulation WHERE code = $code",
            {"code": reg["code"]}
        )
        
        if existing[0]["result"]:
            print(f"  ⏭️  {reg['code']} already exists, skipping")
            continue
        
        result = await db.create("regulation", reg)
        mandatory = "🔒" if reg["is_mandatory"] else "🔓"
        print(f"  {mandatory} Created: {reg['code']} - {reg['name'][:45]}...")
    
    print("✅ Regulations seeded successfully\n")


async def main():
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    
    try:
        await seed_regulations(db)
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
