#!/usr/bin/env python3
"""
Seed script for 9 Planetary Boundaries
Data source: Stockholm Resilience Centre 2025
"""

import asyncio
from datetime import datetime
from typing import List, Dict, Any
from surrealdb import Surreal

# 9 Planetary Boundaries data (2025 update)
BOUNDARIES_DATA: List[Dict[str, Any]] = [
    {
        "code": "climate",
        "name": "Climate Change",
        "description": "Atmospheric CO₂ concentration and radiative forcing as control variables for Earth's energy balance.",
        "control_variable": "Atmospheric CO₂ concentration (ppm) and Energy imbalance at top-of-atmosphere (W/m²)",
        "threshold_value": "350 ppm CO₂; +1.0 W/m² radiative forcing",
        "current_value": "422 ppm CO₂ (2024); +2.91 W/m² (2023)",
        "status": "transgressed",
        "last_updated": datetime(2025, 1, 1),
        "source_url": "https://www.stockholmresilience.org/research/planetary-boundaries.html"
    },
    {
        "code": "biosphere",
        "name": "Biosphere Integrity",
        "description": "Genetic diversity (extinction rate) and functional diversity (Biodiversity Intactness Index) of ecosystems.",
        "control_variable": "Extinction rate (E/MSY) and Biodiversity Intactness Index (BII, %)",
        "threshold_value": "<10 E/MSY; BII >90%",
        "current_value": "100-1000 E/MSY; BII ~84%",
        "status": "transgressed",
        "last_updated": datetime(2024, 12, 1),
        "source_url": "https://www.stockholmresilience.org/research/planetary-boundaries.html"
    },
    {
        "code": "land",
        "name": "Land-System Change",
        "description": "Percentage of global land cover remaining as forests, as forests regulate climate and water cycles.",
        "control_variable": "% of global forest cover remaining",
        "threshold_value": "75% of original forest cover",
        "current_value": "~62% (2023)",
        "status": "transgressed",
        "last_updated": datetime(2024, 6, 1),
        "source_url": "https://www.stockholmresilience.org/research/planetary-boundaries.html"
    },
    {
        "code": "freshwater",
        "name": "Freshwater Use",
        "description": "Blue water (surface and groundwater) consumption relative to environmental flow requirements.",
        "control_variable": "Global blue water use (km³/year)",
        "threshold_value": "<4000 km³/year",
        "current_value": "~2600 km³/year (global average safe, but regional transgression)",
        "status": "approaching",
        "last_updated": datetime(2024, 3, 1),
        "source_url": "https://www.stockholmresilience.org/research/planetary-boundaries.html"
    },
    {
        "code": "biogeochemical-n",
        "name": "Biogeochemical Flows (Nitrogen)",
        "description": "Industrial and intentional biological fixation of nitrogen (N) from the atmosphere.",
        "control_variable": "N removed from atmosphere for human use (Tg N/year)",
        "threshold_value": "<62 Tg N/year",
        "current_value": "~190 Tg N/year (2023)",
        "status": "transgressed",
        "last_updated": datetime(2024, 1, 1),
        "source_url": "https://www.stockholmresilience.org/research/planetary-boundaries.html"
    },
    {
        "code": "biogeochemical-p",
        "name": "Biogeochemical Flows (Phosphorus)",
        "description": "Flow of phosphorus (P) from freshwater systems into the ocean.",
        "control_variable": "P flow to oceans (Tg P/year)",
        "threshold_value": "<11 Tg P/year",
        "current_value": "~22 Tg P/year (2023)",
        "status": "transgressed",
        "last_updated": datetime(2024, 1, 1),
        "source_url": "https://www.stockholmresilience.org/research/planetary-boundaries.html"
    },
    {
        "code": "ocean-acidification",
        "name": "Ocean Acidification",
        "description": "Aragonite saturation state (Ωarag) of surface seawater, critical for marine calcifying organisms.",
        "control_variable": "Aragonite saturation state (Ωarag)",
        "threshold_value": "≥80% of pre-industrial Ωarag (≥3.44)",
        "current_value": "~84% (2023, declining)",
        "status": "safe",
        "last_updated": datetime(2024, 6, 1),
        "source_url": "https://www.stockholmresilience.org/research/planetary-boundaries.html"
    },
    {
        "code": "aerosols",
        "name": "Atmospheric Aerosol Loading",
        "description": "Aerosol Optical Depth (AOD) as a proxy for particulate concentration in the atmosphere.",
        "control_variable": "Aerosol Optical Depth (AOD)",
        "threshold_value": "Regional AOD <0.25 (South Asian monsoon region)",
        "current_value": "Regional transgression in South Asia (AOD >0.4); global average safe",
        "status": "approaching",
        "last_updated": datetime(2024, 1, 1),
        "source_url": "https://www.stockholmresilience.org/research/planetary-boundaries.html"
    },
    {
        "code": "novel-entities",
        "name": "Introduction of Novel Entities",
        "description": "Release of synthetic chemicals, plastics, radioactive materials, nanomaterials, and microorganisms.",
        "control_variable": "Not yet quantified (qualitative assessment)",
        "threshold_value": "Not yet defined",
        "current_value": "Increasing rapidly (plastics, PFAS, microplastics ubiquitous)",
        "status": "transgressed",
        "last_updated": datetime(2024, 12, 1),
        "source_url": "https://www.stockholmresilience.org/research/planetary-boundaries.html"
    }
]


async def seed_boundaries(db: Surreal) -> None:
    """Seed planetary boundaries into SurrealDB"""
    
    print("🌍 Seeding 9 Planetary Boundaries...")
    
    for boundary in BOUNDARIES_DATA:
        # Check if boundary already exists
        existing = await db.query(
            "SELECT * FROM planetary_boundary WHERE code = $code",
            {"code": boundary["code"]}
        )
        
        if existing[0]["result"]:
            print(f"  ⏭️  {boundary['name']} already exists, skipping")
            continue
        
        # Insert boundary
        result = await db.create(
            "planetary_boundary",
            boundary
        )
        
        status_emoji = {
            "safe": "🟢",
            "approaching": "🟡",
            "transgressed": "🔴",
            "unknown": "⚪"
        }
        
        print(f"  {status_emoji[boundary['status']]} Created: {boundary['name']} ({boundary['code']})")
    
    print("✅ Planetary boundaries seeded successfully\n")


async def main():
    """Main entry point"""
    # Connect to SurrealDB
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    
    try:
        await seed_boundaries(db)
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
