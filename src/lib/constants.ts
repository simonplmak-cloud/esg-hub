/**
 * ESG Hub Constants
 * Centralized configuration and constants for the application
 */

// Site Configuration
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://esg-hub-six.vercel.app";

// Content Thresholds
export const HUB_PAGE_MAX_CONTENT_LENGTH = 200;
export const ARTICLE_MIN_CONTENT_LENGTH = 500;
export const TOC_MIN_CONTENT_LENGTH = 800;

// Cross-reference Settings
export const MAX_RELATED_PAGES = 15;

// Pillar Configuration
export const PILLAR_STYLES = {
  E: {
    bg: "#c6f6d5",
    color: "#22543d",
    label: "Environmental",
    href: "/environmental",
  },
  S: {
    bg: "#bee3f8",
    color: "#2a4365",
    label: "Social",
    href: "/social",
  },
  G: {
    bg: "#e9d8fd",
    color: "#553c9a",
    label: "Governance",
    href: "/governance",
  },
} as const;

export type Pillar = keyof typeof PILLAR_STYLES;

// Standards Patterns for Detection
export const STANDARDS_PATTERNS = {
  // GRI Environmental Standards (300 series)
  "GRI 301: Materials 2016": /\bGRI\s+301\b|\bmaterials\s+(use|consumption|input)\b|\bsustainable\s+sourcing\b/i,
  "GRI 302: Energy 2016": /\bGRI\s+302\b|\benergy\s+(consumption|intensity|efficiency)\b|\brenewable\s+energy\b/i,
  "GRI 303: Water and Effluents 2018": /\bGRI\s+303\b|\bwater\s+(withdrawal|consumption|discharge)\b|\bwater\s+stress\b|\baquatic\s+ecosystems?\b/i,
  "GRI 304: Biodiversity 2016": /\bGRI\s+304\b|\bbiodiversity\b|\bprotected\s+areas?\b|\bspecies\s+at\s+risk\b|\becosystem\s+services?\b/i,
  "GRI 305: Emissions 2016": /\bGRI\s+305\b|\bGHG\s+emissions?\b|\bgreenhouse\s+gas\b|\bcarbon\s+(footprint|accounting)\b|\bscope\s+[123]\b/i,
  "GRI 306: Waste 2020": /\bGRI\s+306\b|\bwaste\s+(generation|management|diversion)\b|\bhazardous\s+waste\b|\bcircular\s+economy\b/i,
  "GRI 307: Environmental Compliance 2016": /\bGRI\s+307\b|\benvironmental\s+compliance\b|\bISO\s+14001\b|\benvironmental\s+(permits?|violations?)\b/i,
  "GRI 308: Supplier Environmental Assessment 2016": /\bGRI\s+308\b|\bsupplier\s+environmental\b|\bsupply\s+chain\s+environmental\b/i,
  
  // GRI Social Standards (400 series)
  "GRI 401: Employment 2016": /\bGRI\s+401\b|\bemployment\s+(practices|turnover)\b|\bnew\s+employee\s+hires\b/i,
  "GRI 403: Occupational Health and Safety 2018": /\bGRI\s+403\b|\boccupational\s+(health|safety)\b|\bworker\s+safety\b|\bISO\s+45001\b|\bincident\s+reporting\b/i,
  "GRI 404: Training and Education 2016": /\bGRI\s+404\b|\btraining\s+and\s+education\b|\bskills\s+development\b|\btraining\s+hours?\b/i,
  "GRI 405: Diversity and Equal Opportunity 2016": /\bGRI\s+405\b|\bdiversity\s+and\s+equal\s+opportunity\b|\bgovernance\s+bodies?\b|\bemployee\s+diversity\b/i,
  "GRI 406: Non-discrimination 2016": /\bGRI\s+406\b|\bnon-discrimination\b|\banti-discrimination\b|\bdiscrimination\s+incidents?\b/i,
  "GRI 407: Freedom of Association 2016": /\bGRI\s+407\b|\bfreedom\s+of\s+association\b|\bcollective\s+bargaining\b|\bunion\s+relations?\b/i,
  "GRI 408: Child Labor 2016": /\bGRI\s+408\b|\bchild\s+labor\b/i,
  "GRI 409: Forced or Compulsory Labor 2016": /\bGRI\s+409\b|\bforced\s+labor\b|\bcompulsory\s+labor\b|\bhuman\s+trafficking\b/i,
  
  // IFRS/ISSB Standards
  "IFRS S1: General Requirements for Sustainability-related Disclosures": /\bIFRS\s+S1\b|\bgeneral\s+sustainability\s+disclosures?\b/i,
  "IFRS S2: Climate-related Disclosures": /\bIFRS\s+S2\b|\bclimate-related\s+disclosures?\b/i,
  
  // Task Forces
  "TCFD: Task Force on Climate-related Financial Disclosures": /\bTCFD\b|\bTask\s+Force\s+on\s+Climate\b|\bclimate[-\s]?related\s+financial\s+disclosures?\b/i,
  "TNFD: Task Force on Nature-related Financial Disclosures": /\bTNFD\b|\bTask\s+Force\s+on\s+Nature\b|\bnature[-\s]?related\s+financial\s+disclosures?\b/i,
  
  // Other Frameworks
  "SASB: Sustainability Accounting Standards Board": /\bSASB\b|\bSustainability\s+Accounting\s+Standards?\b/i,
  "CDP: Carbon Disclosure Project": /\bCDP\b|\bCarbon\s+Disclosure\s+Project\b/i,
  "SBTi: Science Based Targets initiative": /\bSBTi\b|\bScience\s+Based\s+Targets?\b/i,
} as const;

// Section to Pillar Mapping
export const SECTION_TO_PILLAR: Record<string, Pillar[]> = {
  environmental: ["E"],
  social: ["S"],
  governance: ["G"],
  "climate-finance": ["E"],
  biodiversity: ["E"],
  finance: ["E", "G"],
  investment: ["G"],
  standards: ["E", "S", "G"],
  frameworks: ["E", "S", "G"],
  regulations: ["E", "S", "G"],
  "hk-apac": ["E", "S", "G"],
  regional: ["E", "S", "G"],
  "emerging-topics": ["E", "S", "G"],
  ratings: ["G"],
  sdg: ["E", "S", "G"],
  learning: ["E", "S", "G"],
  practice: ["E", "S", "G"],
  fundamentals: ["E", "S", "G"],
};
