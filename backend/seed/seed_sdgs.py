#!/usr/bin/env python3
"""
Seed script for 17 UN Sustainable Development Goals
Data source: United Nations SDG Knowledge Platform
"""

import asyncio
from typing import List, Dict, Any
from surrealdb import Surreal

# 17 SDGs data
SDGS_DATA: List[Dict[str, Any]] = [
    {
        "number": 1,
        "name": "No Poverty",
        "description": "End poverty in all its forms everywhere",
        "pillar": "social",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-01.jpg",
        "un_url": "https://sdgs.un.org/goals/goal1"
    },
    {
        "number": 2,
        "name": "Zero Hunger",
        "description": "End hunger, achieve food security and improved nutrition and promote sustainable agriculture",
        "pillar": "social",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-02.jpg",
        "un_url": "https://sdgs.un.org/goals/goal2"
    },
    {
        "number": 3,
        "name": "Good Health and Well-being",
        "description": "Ensure healthy lives and promote well-being for all at all ages",
        "pillar": "social",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-03.jpg",
        "un_url": "https://sdgs.un.org/goals/goal3"
    },
    {
        "number": 4,
        "name": "Quality Education",
        "description": "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all",
        "pillar": "social",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-04.jpg",
        "un_url": "https://sdgs.un.org/goals/goal4"
    },
    {
        "number": 5,
        "name": "Gender Equality",
        "description": "Achieve gender equality and empower all women and girls",
        "pillar": "social",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-05.jpg",
        "un_url": "https://sdgs.un.org/goals/goal5"
    },
    {
        "number": 6,
        "name": "Clean Water and Sanitation",
        "description": "Ensure availability and sustainable management of water and sanitation for all",
        "pillar": "environmental",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-06.jpg",
        "un_url": "https://sdgs.un.org/goals/goal6"
    },
    {
        "number": 7,
        "name": "Affordable and Clean Energy",
        "description": "Ensure access to affordable, reliable, sustainable and modern energy for all",
        "pillar": "environmental",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-07.jpg",
        "un_url": "https://sdgs.un.org/goals/goal7"
    },
    {
        "number": 8,
        "name": "Decent Work and Economic Growth",
        "description": "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all",
        "pillar": "social",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-08.jpg",
        "un_url": "https://sdgs.un.org/goals/goal8"
    },
    {
        "number": 9,
        "name": "Industry, Innovation and Infrastructure",
        "description": "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation",
        "pillar": "cross-cutting",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-09.jpg",
        "un_url": "https://sdgs.un.org/goals/goal9"
    },
    {
        "number": 10,
        "name": "Reduced Inequalities",
        "description": "Reduce inequality within and among countries",
        "pillar": "social",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-10.jpg",
        "un_url": "https://sdgs.un.org/goals/goal10"
    },
    {
        "number": 11,
        "name": "Sustainable Cities and Communities",
        "description": "Make cities and human settlements inclusive, safe, resilient and sustainable",
        "pillar": "cross-cutting",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-11.jpg",
        "un_url": "https://sdgs.un.org/goals/goal11"
    },
    {
        "number": 12,
        "name": "Responsible Consumption and Production",
        "description": "Ensure sustainable consumption and production patterns",
        "pillar": "environmental",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-12.jpg",
        "un_url": "https://sdgs.un.org/goals/goal12"
    },
    {
        "number": 13,
        "name": "Climate Action",
        "description": "Take urgent action to combat climate change and its impacts",
        "pillar": "environmental",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-13.jpg",
        "un_url": "https://sdgs.un.org/goals/goal13"
    },
    {
        "number": 14,
        "name": "Life Below Water",
        "description": "Conserve and sustainably use the oceans, seas and marine resources for sustainable development",
        "pillar": "environmental",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-14.jpg",
        "un_url": "https://sdgs.un.org/goals/goal14"
    },
    {
        "number": 15,
        "name": "Life on Land",
        "description": "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss",
        "pillar": "environmental",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-15.jpg",
        "un_url": "https://sdgs.un.org/goals/goal15"
    },
    {
        "number": 16,
        "name": "Peace, Justice and Strong Institutions",
        "description": "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels",
        "pillar": "governance",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-16.jpg",
        "un_url": "https://sdgs.un.org/goals/goal16"
    },
    {
        "number": 17,
        "name": "Partnerships for the Goals",
        "description": "Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development",
        "pillar": "cross-cutting",
        "icon_url": "https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-17.jpg",
        "un_url": "https://sdgs.un.org/goals/goal17"
    }
]


async def seed_sdgs(db: Surreal) -> None:
    """Seed UN SDGs into SurrealDB"""
    
    print("🎯 Seeding 17 UN Sustainable Development Goals...")
    
    for sdg in SDGS_DATA:
        # Check if SDG already exists
        existing = await db.query(
            "SELECT * FROM sdg WHERE number = $num",
            {"num": sdg["number"]}
        )
        
        if existing[0]["result"]:
            print(f"  ⏭️  SDG {sdg['number']} already exists, skipping")
            continue
        
        # Insert SDG
        result = await db.create(
            "sdg",
            sdg
        )
        
        pillar_emoji = {
            "environmental": "🌍",
            "social": "👥",
            "governance": "⚖️",
            "cross-cutting": "🔗"
        }
        
        print(f"  {pillar_emoji[sdg['pillar']]} Created: SDG {sdg['number']} - {sdg['name']}")
    
    print("✅ SDGs seeded successfully\n")


async def main():
    """Main entry point"""
    # Connect to SurrealDB
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    
    try:
        await seed_sdgs(db)
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
