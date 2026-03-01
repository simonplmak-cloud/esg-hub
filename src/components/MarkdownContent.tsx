import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";

function stripFullPageHtml(html: string): string {
  let result = html;
  result = result.replace(/<html[^>]*>/gi, "");
  result = result.replace(/<\/html>/gi, "");
  result = result.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");
  result = result.replace(/<\/head>/gi, "");
  result = result.replace(/<body[^>]*>/gi, "");
  result = result.replace(/<\/body>/gi, "");
  result = result.replace(/<!DOCTYPE[^>]*>/gi, "");
  return result;
}

export default function MarkdownContent({ content }: { content: string }) {
  const sanitizedContent = stripFullPageHtml(content);

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeRaw]}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
}
