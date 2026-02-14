#!/usr/bin/env python3
"""
Seed script for creating RELATE edges between entities
Builds the knowledge graph structure
"""

import asyncio
from surrealdb import Surreal


async def seed_relationships(db: Surreal) -> None:
    """Create graph relationships between entities"""
    
    print("🔗 Creating Knowledge Graph Relationships...")
    
    # 1. Link Planetary Boundaries to Standards
    print("\n  📊 Linking Planetary Boundaries → Standards...")
    await db.query("""
        LET $climate = (SELECT id FROM planetary_boundary WHERE code = 'climate' LIMIT 1)[0].id;
        LET $ifrs_s2 = (SELECT id FROM standard WHERE abbreviation = 'IFRS-S2' LIMIT 1)[0].id;
        LET $tcfd = (SELECT id FROM standard WHERE abbreviation = 'TCFD' LIMIT 1)[0].id;
        LET $ghg = (SELECT id FROM standard WHERE abbreviation = 'GHG-Protocol' LIMIT 1)[0].id;
        
        RELATE $climate->addresses<-$ifrs_s2 SET relationship_type = 'disclosure_framework';
        RELATE $climate->addresses<-$tcfd SET relationship_type = 'disclosure_framework';
        RELATE $climate->addresses<-$ghg SET relationship_type = 'measurement_standard';
    """)
    
    await db.query("""
        LET $biosphere = (SELECT id FROM planetary_boundary WHERE code = 'biosphere' LIMIT 1)[0].id;
        LET $tnfd = (SELECT id FROM standard WHERE abbreviation = 'TNFD' LIMIT 1)[0].id;
        
        RELATE $biosphere->addresses<-$tnfd SET relationship_type = 'disclosure_framework';
    """)
    
    # 2. Link Standards to SDGs
    print("  🎯 Linking Standards → SDGs...")
    await db.query("""
        LET $ifrs_s2 = (SELECT id FROM standard WHERE abbreviation = 'IFRS-S2' LIMIT 1)[0].id;
        LET $sdg13 = (SELECT id FROM sdg WHERE number = 13 LIMIT 1)[0].id;
        
        RELATE $ifrs_s2->supports->$sdg13 SET contribution_level = 'high';
    """)
    
    await db.query("""
        LET $iso26000 = (SELECT id FROM standard WHERE abbreviation = 'ISO-26000' LIMIT 1)[0].id;
        LET $sdg8 = (SELECT id FROM sdg WHERE number = 8 LIMIT 1)[0].id;
        LET $sdg10 = (SELECT id FROM sdg WHERE number = 10 LIMIT 1)[0].id;
        
        RELATE $iso26000->supports->$sdg8 SET contribution_level = 'high';
        RELATE $iso26000->supports->$sdg10 SET contribution_level = 'high';
    """)
    
    # 3. Link Social Issues to Standards
    print("  👥 Linking Social Issues → Standards...")
    await db.query("""
        LET $due_diligence = (SELECT id FROM social_issue WHERE code = 'S2.1' LIMIT 1)[0].id;
        LET $ungp = (SELECT id FROM standard WHERE abbreviation = 'UNGP' LIMIT 1)[0].id;
        
        RELATE $due_diligence->implements<-$ungp SET relationship_type = 'guidance';
    """)
    
    # 4. Link Governance Topics to Standards
    print("  ⚖️  Linking Governance Topics → Standards...")
    await db.query("""
        LET $board_oversight = (SELECT id FROM governance_topic WHERE code = 'G5.1' LIMIT 1)[0].id;
        LET $oecd_cg = (SELECT id FROM standard WHERE abbreviation = 'OECD-CG' LIMIT 1)[0].id;
        
        RELATE $board_oversight->implements<-$oecd_cg SET relationship_type = 'principle';
    """)
    
    # 5. Link Books to Topics
    print("  📚 Linking Books → Topics...")
    await db.query("""
        LET $climate_book = (SELECT id FROM book WHERE isbn = '978-988-79489-1-0' LIMIT 1)[0].id;
        LET $climate_boundary = (SELECT id FROM planetary_boundary WHERE code = 'climate' LIMIT 1)[0].id;
        
        RELATE $climate_book->covers->$climate_boundary SET depth = 'comprehensive';
    """)
    
    await db.query("""
        LET $hr_book = (SELECT id FROM book WHERE isbn = '978-988-79489-3-4' LIMIT 1)[0].id;
        LET $hr_issues = (SELECT id FROM social_issue WHERE core_subject = 'human_rights');
        
        FOR $issue IN $hr_issues {
            RELATE $hr_book->covers->$issue.id SET depth = 'comprehensive';
        };
    """)
    
    # 6. Link Regulations to Standards
    print("  📜 Linking Regulations → Standards...")
    await db.query("""
        LET $hkex_esg = (SELECT id FROM regulation WHERE code = 'HK-HKEX-ESG' LIMIT 1)[0].id;
        LET $ifrs_s1 = (SELECT id FROM standard WHERE abbreviation = 'IFRS-S1' LIMIT 1)[0].id;
        
        RELATE $hkex_esg->references->$ifrs_s1 SET alignment_level = 'high';
    """)
    
    await db.query("""
        LET $eu_csrd = (SELECT id FROM regulation WHERE code = 'EU-CSRD' LIMIT 1)[0].id;
        LET $esrs = (SELECT id FROM standard WHERE abbreviation = 'ESRS' LIMIT 1)[0].id;
        
        RELATE $eu_csrd->requires->$esrs SET relationship_type = 'mandatory';
    """)
    
    print("✅ Relationships created successfully\n")


async def main():
    """Main entry point"""
    # Connect to SurrealDB
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    
    try:
        await seed_relationships(db)
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
