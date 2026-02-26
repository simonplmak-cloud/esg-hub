import { getTranslations } from "next-intl/server";

interface Heading {
  level: number;
  text: string;
  id: string;
}

export default async function TableOfContents({ headings }: { headings: Heading[] }) {
  const t = await getTranslations("TableOfContents");
  
  if (headings.length === 0) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <div className="toc-title">{t("contents")}</div>
      <ol>
        {headings.map((heading, i) => (
          <li
            key={i}
            style={{
              marginLeft: heading.level === 3 ? "1.2em" : 0,
            }}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
