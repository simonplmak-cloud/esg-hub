import Link from "next/link";
import { useTranslations } from "next-intl";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({
  permalink,
  title,
  locale = "en",
}: {
  permalink: string;
  title: string;
  locale?: string;
}) {
  const t = useTranslations("SectionLabels");
  const tCommon = useTranslations("Common");
  
  const getLabel = (key: string): string => {
    try {
      return t(key);
    } catch {
      return key.replace(/-/g, " ");
    }
  };

  const parts = permalink.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  if (parts.length === 0) return null;

  const crumbs: BreadcrumbItem[] = [{ label: tCommon("home"), href: `/${locale}/` }];

  // Build intermediate crumbs
  let path = "";
  for (let i = 0; i < parts.length - 1; i++) {
    path += "/" + parts[i];
    crumbs.push({
      label: getLabel(parts[i]),
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
