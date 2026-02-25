import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const SECTION_LABELS: Record<string, string> = {
  environmental: "Environmental",
  social: "Social",
  governance: "Governance",
  standards: "Standards",
  "hk-apac": "HK & APAC",
  learning: "Learning Hub",
  sdg: "SDGs",
  ratings: "Ratings",
  finance: "Finance",
  investment: "Investment",
  frameworks: "Frameworks",
  fundamentals: "Fundamentals",
  "emerging-topics": "Emerging Topics",
  regulations: "Regulations",
  practice: "Practice",
  books: "Books",
  glossary: "Glossary",
  videos: "Videos",
  about: "About",
  search: "Search",
};

export default function Breadcrumbs({
  permalink,
  title,
  locale = "en",
}: {
  permalink: string;
  title: string;
  locale?: string;
}) {
  const parts = permalink.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const crumbs: BreadcrumbItem[] = [{ label: "Home", href: `/${locale}/` }];

  // Build intermediate crumbs
  let path = "";
  for (let i = 0; i < parts.length - 1; i++) {
    path += "/" + parts[i];
    crumbs.push({
      label: SECTION_LABELS[parts[i]] || parts[i].replace(/-/g, " "),
      href: `/${locale}${path}`,
    });
  }

  // Current page (no link)
  crumbs.push({ label: title });

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((crumb, idx) => (
        <span key={idx}>
          {idx > 0 && <span className="separator"> / </span>}
          {crumb.href ? (
            <Link href={crumb.href}>{crumb.label}</Link>
          ) : (
            <span aria-current="page">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
