#!/usr/bin/env python3
"""
Seed script for ISO 26000 Social Issues
Data source: ISO 26000:2010 Guidance on Social Responsibility
"""

import asyncio
from typing import List, Dict, Any
from surrealdb import Surreal

# ISO 26000 Social Issues (representative sample - expand as needed)
SOCIAL_ISSUES_DATA: List[Dict[str, Any]] = [
    # Organizational Governance (S1)
    {
        "code": "S1.1",
        "name": "Ethical Leadership and Decision-Making",
        "core_subject": "organizational_governance",
        "description": "Processes and structures for ethical decision-making, transparency, and accountability at the highest levels of the organization.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.2"
    },
    {
        "code": "S1.2",
        "name": "Stakeholder Engagement and Inclusiveness",
        "core_subject": "organizational_governance",
        "description": "Systematic identification and engagement with stakeholders whose interests are affected by organizational decisions.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.2"
    },
    
    # Human Rights (S2)
    {
        "code": "S2.1",
        "name": "Due Diligence",
        "core_subject": "human_rights",
        "description": "Ongoing process to identify, prevent, mitigate and account for human rights impacts in operations and value chains.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.3.3"
    },
    {
        "code": "S2.2",
        "name": "Human Rights Risk Situations",
        "core_subject": "human_rights",
        "description": "Heightened risk contexts including conflict-affected areas, weak governance, and vulnerable populations.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.3.4"
    },
    {
        "code": "S2.3",
        "name": "Avoidance of Complicity",
        "core_subject": "human_rights",
        "description": "Ensuring the organization does not benefit from or contribute to human rights abuses by others.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.3.5"
    },
    {
        "code": "S2.4",
        "name": "Resolving Grievances",
        "core_subject": "human_rights",
        "description": "Establishment of effective operational-level grievance mechanisms accessible to affected stakeholders.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.3.6"
    },
    {
        "code": "S2.5",
        "name": "Discrimination and Vulnerable Groups",
        "core_subject": "human_rights",
        "description": "Prevention of discrimination and protection of rights of women, children, indigenous peoples, persons with disabilities, and other vulnerable groups.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.3.7"
    },
    {
        "code": "S2.6",
        "name": "Civil and Political Rights",
        "core_subject": "human_rights",
        "description": "Respect for freedom of expression, assembly, association, and participation in public affairs.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.3.8"
    },
    {
        "code": "S2.7",
        "name": "Economic, Social and Cultural Rights",
        "core_subject": "human_rights",
        "description": "Respect for rights to work, adequate standard of living, education, health, and cultural participation.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.3.9"
    },
    {
        "code": "S2.8",
        "name": "Fundamental Principles and Rights at Work",
        "core_subject": "human_rights",
        "description": "Adherence to ILO core conventions: freedom of association, elimination of forced labour, abolition of child labour, elimination of discrimination.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.3.10"
    },
    
    # Labour Practices (S3)
    {
        "code": "S3.1",
        "name": "Employment and Employment Relationships",
        "core_subject": "labour_practices",
        "description": "Fair employment contracts, avoidance of false apprenticeships, and recognition of employment relationships.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.4.3"
    },
    {
        "code": "S3.2",
        "name": "Conditions of Work and Social Protection",
        "core_subject": "labour_practices",
        "description": "Fair wages, working hours, rest periods, maternity protection, and access to social security.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.4.4"
    },
    {
        "code": "S3.3",
        "name": "Social Dialogue",
        "core_subject": "labour_practices",
        "description": "Negotiation, consultation and exchange of information between workers, employers and government.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.4.5"
    },
    {
        "code": "S3.4",
        "name": "Health and Safety at Work",
        "core_subject": "labour_practices",
        "description": "Prevention of occupational injuries, diseases and fatalities through risk assessment and control measures.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.4.6"
    },
    {
        "code": "S3.5",
        "name": "Human Development and Training",
        "core_subject": "labour_practices",
        "description": "Access to skills development, training, career advancement and lifelong learning opportunities.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.4.7"
    },
    
    # Fair Operating Practices (S4)
    {
        "code": "S4.1",
        "name": "Anti-Corruption",
        "core_subject": "fair_operating_practices",
        "description": "Prevention of bribery, extortion, embezzlement, and other forms of corruption.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.6.3"
    },
    {
        "code": "S4.2",
        "name": "Responsible Political Involvement",
        "core_subject": "fair_operating_practices",
        "description": "Transparency in lobbying, political contributions, and public policy engagement.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.6.4"
    },
    {
        "code": "S4.3",
        "name": "Fair Competition",
        "core_subject": "fair_operating_practices",
        "description": "Compliance with antitrust and competition laws, avoidance of anti-competitive agreements.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.6.5"
    },
    {
        "code": "S4.4",
        "name": "Promoting Social Responsibility in the Value Chain",
        "core_subject": "fair_operating_practices",
        "description": "Integration of social and environmental criteria in procurement and supplier relationships.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.6.6"
    },
    {
        "code": "S4.5",
        "name": "Respect for Property Rights",
        "core_subject": "fair_operating_practices",
        "description": "Protection of intellectual property, physical property, and traditional knowledge.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.6.7"
    },
    
    # Consumer Issues (S5)
    {
        "code": "S5.1",
        "name": "Fair Marketing and Information",
        "core_subject": "consumer_issues",
        "description": "Truthful, accurate and non-deceptive marketing, advertising and product information.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.7.3"
    },
    {
        "code": "S5.2",
        "name": "Protecting Consumers' Health and Safety",
        "core_subject": "consumer_issues",
        "description": "Product safety, risk assessment, and prevention of harm to consumers.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.7.4"
    },
    {
        "code": "S5.3",
        "name": "Sustainable Consumption",
        "core_subject": "consumer_issues",
        "description": "Promotion of efficient resource use, circular economy, and sustainable consumption patterns.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.7.5"
    },
    {
        "code": "S5.4",
        "name": "Consumer Service, Support and Complaint Resolution",
        "core_subject": "consumer_issues",
        "description": "Accessible customer service, warranty fulfillment, and effective complaint handling.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.7.6"
    },
    {
        "code": "S5.5",
        "name": "Consumer Data Protection and Privacy",
        "core_subject": "consumer_issues",
        "description": "Protection of personal data, privacy rights, and cybersecurity.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.7.7"
    },
    {
        "code": "S5.6",
        "name": "Access to Essential Services",
        "core_subject": "consumer_issues",
        "description": "Ensuring availability and affordability of essential goods and services.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.7.8"
    },
    {
        "code": "S5.7",
        "name": "Education and Awareness",
        "core_subject": "consumer_issues",
        "description": "Consumer education on product use, rights, and sustainable consumption.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.7.9"
    },
    
    # Community Involvement (S6)
    {
        "code": "S6.1",
        "name": "Community Engagement",
        "core_subject": "community_involvement",
        "description": "Active participation in community development and consultation with local stakeholders.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.8.3"
    },
    {
        "code": "S6.2",
        "name": "Education and Culture",
        "core_subject": "community_involvement",
        "description": "Support for education, cultural preservation, and knowledge transfer.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.8.4"
    },
    {
        "code": "S6.3",
        "name": "Employment Creation and Skills Development",
        "core_subject": "community_involvement",
        "description": "Local job creation, vocational training, and economic empowerment.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.8.5"
    },
    {
        "code": "S6.4",
        "name": "Technology Development and Access",
        "core_subject": "community_involvement",
        "description": "Technology transfer, digital inclusion, and innovation for social benefit.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.8.6"
    },
    {
        "code": "S6.5",
        "name": "Wealth and Income Creation",
        "core_subject": "community_involvement",
        "description": "Local procurement, support for SMEs, and inclusive economic development.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.8.7"
    },
    {
        "code": "S6.6",
        "name": "Health",
        "core_subject": "community_involvement",
        "description": "Access to healthcare, disease prevention, and health promotion initiatives.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.8.8"
    },
    {
        "code": "S6.7",
        "name": "Social Investment",
        "core_subject": "community_involvement",
        "description": "Philanthropic contributions, volunteering, and community partnerships.",
        "iso26000_reference": "ISO 26000:2010, Clause 6.8.9"
    }
]


async def seed_social(db: Surreal) -> None:
    """Seed ISO 26000 social issues into SurrealDB"""
    
    print("👥 Seeding ISO 26000 Social Issues...")
    
    for issue in SOCIAL_ISSUES_DATA:
        existing = await db.query(
            "SELECT * FROM social_issue WHERE code = $code",
            {"code": issue["code"]}
        )
        
        if existing[0]["result"]:
            print(f"  ⏭️  {issue['code']} already exists, skipping")
            continue
        
        result = await db.create(
            "social_issue",
            issue
        )
        
        print(f"  ✓ Created: {issue['code']} - {issue['name'][:50]}...")
    
    print("✅ Social issues seeded successfully\n")


async def main():
    db = Surreal("ws://localhost:8000/rpc")
    await db.connect()
    await db.use("esg_hub", "production")
    await db.signin({"user": "root", "pass": "root"})
    
    try:
        await seed_social(db)
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(main())
