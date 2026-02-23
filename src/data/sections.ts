/**
 * ESG Hub Section Data
 * Centralized data for homepage and navigation sections
 */

export interface SectionCard {
  title: string;
  href: string;
  description: string;
  color: string;
}

/**
 * Homepage section cards - 6 primary categories
 */
export const HOMEPAGE_SECTIONS: SectionCard[] = [
  {
    title: "Environmental (E)",
    href: "/environmental",
    description:
      "Climate change, emissions, energy, water, biodiversity, materials, waste, pollution, and compliance. 9 aspects aligned with GRI 300 series.",
    color: "var(--color-section-env)",
  },
  {
    title: "Social (S)",
    href: "/social",
    description:
      "Employment, health & safety, training, diversity, human rights, communities, and customer responsibility. 10 topics aligned with GRI 400 series.",
    color: "var(--color-section-social)",
  },
  {
    title: "Governance (G)",
    href: "/governance",
    description:
      "Board governance, executive compensation, shareholder rights, transparency, risk management, ethics, and audit. 9 areas aligned with OECD Principles.",
    color: "var(--color-section-gov)",
  },
  {
    title: "Standards, Frameworks & Regulations",
    href: "/standards",
    description:
      "GRI, IFRS S1/S2, TCFD, TNFD, SASB, regional regulations, ESG ratings, and compliance requirements.",
    color: "var(--color-section-standards)",
  },
  {
    title: "Finance & Investment",
    href: "/finance",
    description:
      "ESG finance, investment strategies, climate finance, green bonds, carbon markets, and impact investing.",
    color: "var(--color-section-climate)",
  },
  {
    title: "Sustainability Topics",
    href: "/emerging-topics",
    description:
      "Biodiversity & nature, emerging trends, circular economy, just transition, UN SDGs, and future-focused ESG topics.",
    color: "var(--color-section-biodiversity)",
  },
];

/**
 * Contents menu structure for header navigation
 */
export interface ContentsCategory {
  title: string;
  links: {
    label: string;
    href: string;
    description?: string;
  }[];
}

export const CONTENTS_MENU: Record<string, ContentsCategory> = {
  pillars: {
    title: "ESG Pillars",
    links: [
      { label: "Environmental (E)", href: "/environmental", description: "9 aspects" },
      { label: "Social (S)", href: "/social", description: "10 topics" },
      { label: "Governance (G)", href: "/governance", description: "9 areas" },
    ],
  },
  standards: {
    title: "Standards & Regulations",
    links: [
      { label: "Standards & Frameworks", href: "/standards", description: "GRI, IFRS, TCFD, TNFD" },
      { label: "Regional Regulations", href: "/hk-apac", description: "EU, APAC, North America" },
      { label: "ESG Ratings & Data", href: "/ratings", description: "Rating agencies & methodologies" },
    ],
  },
  finance: {
    title: "Finance & Investment",
    links: [
      { label: "Finance & Investment", href: "/finance", description: "ESG Finance & Investment" },
      { label: "Climate Finance", href: "/climate-finance", description: "Carbon markets, green bonds" },
      { label: "Biodiversity & Nature", href: "/biodiversity", description: "TNFD, ecosystem services" },
    ],
  },
  topics: {
    title: "Sustainability Topics",
    links: [
      { label: "Sustainability Topics", href: "/emerging-topics", description: "Emerging trends" },
      { label: "UN SDGs", href: "/sdg", description: "17 Sustainable Development Goals" },
    ],
  },
  professional: {
    title: "Professional Development",
    links: [
      { label: "Learning Hub", href: "/learning", description: "Courses & certifications" },
      { label: "Practice & Implementation", href: "/practice", description: "Implementation guides" },
      { label: "ESG Fundamentals", href: "/learning/esg-fundamentals", description: "Foundation knowledge" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Glossary", href: "/glossary", description: "ESG terminology" },
      { label: "Books", href: "/books", description: "Publications" },
      { label: "Videos", href: "/videos", description: "Webinars & tutorials" },
      { label: "Developers", href: "/developers", description: "API & Tools" },
    ],
  },
};

/**
 * Quick access links
 */
export const QUICK_LINKS = [
  { label: "Random Article", href: "/random" },
  { label: "Contents", href: "/contents" },
];

/**
 * Secondary resources for homepage
 */
export const SECONDARY_RESOURCES = [
  { label: "Learning Hub", href: "/learning" },
  { label: "Practice & Implementation", href: "/practice" },
  { label: "Books", href: "/books" },
  { label: "Videos", href: "/videos" },
  { label: "Glossary", href: "/glossary" },
  { label: "Developers", href: "/developers" },
];
