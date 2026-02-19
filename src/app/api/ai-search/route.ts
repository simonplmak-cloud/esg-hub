import { NextRequest } from "next/server";
import { queryHttp, queryHttpAll, sanitize } from "@/lib/surrealdb";

/**
 * AI-Powered Search Agent API
 *
 * Combines multiple SurrealDB search modalities (BM25, vector, book chunks)
 * with DeepSeek reasoning to produce AI-generated answers grounded in ESG Hub content.
 *
 * POST /api/ai-search
 * Body: { query: string, embedding?: number[], mode?: "quick" | "deep" }
 *
 * Returns: Server-Sent Events (SSE) stream with:
 *   - type: "sources" — retrieved context sources
 *   - type: "chunk"   — streaming AI answer text
 *   - type: "done"    — completion signal
 *   - type: "error"   — error message
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyBlxCo0Pouj7q7_SXrEt5A_R6ptBArfOSI";
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID || "91c4fb08953b44d7d";

interface RAGSource {
  id: string;
  title: string;
  permalink?: string;
  url?: string;
  snippet: string;
  source_type: "page" | "book_chunk" | "external";
  relevance?: number;
  distance?: number;
  book_title?: string;
  domain?: string;
  section?: string;
  link?: string;
}

/**
 * BM25 full-text search across pages, book_chunks, and external_resources
 */
async function bm25Search(query: string, limit: number = 8): Promise<RAGSource[]> {
  const escaped = sanitize(query.slice(0, 500));
  const results: RAGSource[] = [];

  // Run all three BM25 searches in parallel via a single multi-statement query
  const sql = `
    SELECT id, title, permalink, description, section,
      search::score(0) + search::score(1) AS relevance
    FROM page
    WHERE title @0@ '${escaped}' OR content @1@ '${escaped}'
    ORDER BY relevance DESC
    LIMIT ${limit};

    SELECT id, book_title, chunk_index, content,
      search::score(0) AS relevance
    FROM book_chunk
    WHERE content @0@ '${escaped}'
    ORDER BY relevance DESC
    LIMIT ${limit};

    SELECT id, title, url, domain, description,
      search::score(0) + search::score(1) AS relevance
    FROM external_resource
    WHERE title @0@ '${escaped}' OR content @1@ '${escaped}'
    ORDER BY relevance DESC
    LIMIT ${Math.ceil(limit / 2)};
  `;

  try {
    const allResults = await queryHttpAll<Record<string, unknown>>(sql);

    // Pages
    if (allResults[0]?.status === "OK" && Array.isArray(allResults[0].result)) {
      for (const r of allResults[0].result as Array<Record<string, unknown>>) {
        results.push({
          id: String(r.id),
          title: String(r.title || ""),
          permalink: r.permalink ? String(r.permalink) : undefined,
          snippet: String(r.description || "").slice(0, 300),
          source_type: "page",
          relevance: Number(r.relevance) || 0,
          section: r.section ? String(r.section) : undefined,
        });
      }
    }

    // Book chunks
    if (allResults[1]?.status === "OK" && Array.isArray(allResults[1].result)) {
      for (const r of allResults[1].result as Array<Record<string, unknown>>) {
        results.push({
          id: String(r.id),
          title: `${r.book_title} (Chunk ${r.chunk_index})`,
          snippet: String(r.content || "").slice(0, 500),
          source_type: "book_chunk",
          relevance: Number(r.relevance) || 0,
          book_title: r.book_title ? String(r.book_title) : undefined,
        });
      }
    }

    // External resources
    if (allResults[2]?.status === "OK" && Array.isArray(allResults[2].result)) {
      for (const r of allResults[2].result as Array<Record<string, unknown>>) {
        results.push({
          id: String(r.id),
          title: String(r.title || ""),
          url: r.url ? String(r.url) : undefined,
          snippet: String(r.description || "").slice(0, 300),
          source_type: "external",
          relevance: Number(r.relevance) || 0,
          domain: r.domain ? String(r.domain) : undefined,
        });
      }
    }
  } catch (err) {
    console.error("[AI Search] BM25 search error:", err);
  }

  return results;
}

/**
 * Vector search across pages and book_chunks using pre-computed embedding
 */
async function vectorSearch(
  embedding: number[],
  limit: number = 8
): Promise<RAGSource[]> {
  if (!Array.isArray(embedding) || embedding.length !== 384) return [];

  const embStr = "[" + embedding.map((v) => v.toFixed(8)).join(",") + "]";
  const results: RAGSource[] = [];

  const sql = `
    SELECT id, title, permalink, description, section,
      vector::distance::knn() AS distance
    FROM page
    WHERE embedding <|${limit}, 100|> ${embStr}
    ORDER BY distance
    LIMIT ${limit};

    SELECT id, book_title, chunk_index, content,
      vector::distance::knn() AS distance
    FROM book_chunk
    WHERE embedding <|${limit}, 100|> ${embStr}
    ORDER BY distance
    LIMIT ${limit};

    SELECT id, title, url, domain, description,
      vector::distance::knn() AS distance
    FROM external_resource
    WHERE embedding <|${Math.ceil(limit / 2)}, 100|> ${embStr}
    ORDER BY distance
    LIMIT ${Math.ceil(limit / 2)};
  `;

  try {
    const allResults = await queryHttpAll<Record<string, unknown>>(sql);

    // Pages
    if (allResults[0]?.status === "OK" && Array.isArray(allResults[0].result)) {
      for (const r of allResults[0].result as Array<Record<string, unknown>>) {
        results.push({
          id: String(r.id),
          title: String(r.title || ""),
          permalink: r.permalink ? String(r.permalink) : undefined,
          snippet: String(r.description || "").slice(0, 300),
          source_type: "page",
          distance: Number(r.distance) || 0,
          section: r.section ? String(r.section) : undefined,
        });
      }
    }

    // Book chunks
    if (allResults[1]?.status === "OK" && Array.isArray(allResults[1].result)) {
      for (const r of allResults[1].result as Array<Record<string, unknown>>) {
        results.push({
          id: String(r.id),
          title: `${r.book_title} (Chunk ${r.chunk_index})`,
          snippet: String(r.content || "").slice(0, 500),
          source_type: "book_chunk",
          distance: Number(r.distance) || 0,
          book_title: r.book_title ? String(r.book_title) : undefined,
        });
      }
    }

    // External resources
    if (allResults[2]?.status === "OK" && Array.isArray(allResults[2].result)) {
      for (const r of allResults[2].result as Array<Record<string, unknown>>) {
        results.push({
          id: String(r.id),
          title: String(r.title || ""),
          url: r.url ? String(r.url) : undefined,
          snippet: String(r.description || "").slice(0, 300),
          source_type: "external",
          distance: Number(r.distance) || 0,
          domain: r.domain ? String(r.domain) : undefined,
        });
      }
    }
  } catch (err) {
    console.error("[AI Search] Vector search error:", err);
  }

  return results;
}

/**
 * Deduplicate and merge results from BM25 and vector search
 */
function mergeAndRank(
  bm25Results: RAGSource[],
  vectorResults: RAGSource[]
): RAGSource[] {
  const seen = new Map<string, RAGSource>();

  // Add BM25 results first (they have relevance scores)
  for (const r of bm25Results) {
    seen.set(r.id, r);
  }

  // Add vector results, skip duplicates
  for (const r of vectorResults) {
    if (!seen.has(r.id)) {
      seen.set(r.id, r);
    }
  }

  const merged = Array.from(seen.values());

  // Sort: BM25 relevance first (desc), then vector distance (asc)
  merged.sort((a, b) => {
    // Prefer items with relevance scores (BM25)
    if (a.relevance && b.relevance) return b.relevance - a.relevance;
    if (a.relevance && !b.relevance) return -1;
    if (!a.relevance && b.relevance) return 1;
    // Then by vector distance
    if (a.distance !== undefined && b.distance !== undefined)
      return a.distance - b.distance;
    return 0;
  });

  return merged.slice(0, 20);
}

/**
 * Google Custom Search for web results from ESG-focused domains
 */
async function googleSearch(query: string, limit: number = 5): Promise<RAGSource[]> {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) return [];

  const results: RAGSource[] = [];
  try {
    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      cx: GOOGLE_CSE_ID,
      q: query,
      num: String(Math.min(limit, 10)),
    });
    const resp = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params.toString()}`,
      { next: { revalidate: 3600 } }
    );
    if (!resp.ok) {
      console.error("[AI Search] Google CSE error:", resp.status, await resp.text());
      return [];
    }
    const data = await resp.json();
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        const domain = new URL(item.link).hostname.replace(/^www\./, "");
        results.push({
          id: `google:${item.link}`,
          title: item.title || "",
          url: item.link,
          link: item.link,
          snippet: (item.snippet || "").slice(0, 300),
          source_type: "external",
          domain,
          relevance: 0.5, // lower priority than SurrealDB results
        });
      }
    }
  } catch (err) {
    console.error("[AI Search] Google CSE fetch error:", err);
  }
  return results;
}

/**
 * Build the RAG context string from sources
 */
function buildRAGContext(sources: RAGSource[]): string {
  const parts: string[] = [];

  const pages = sources.filter((s) => s.source_type === "page");
  const bookChunks = sources.filter((s) => s.source_type === "book_chunk");
  const externals = sources.filter((s) => s.source_type === "external");

  if (pages.length > 0) {
    parts.push("## ESG Hub Articles\n");
    for (const p of pages.slice(0, 8)) {
      parts.push(
        `### ${p.title}${p.section ? ` [${p.section}]` : ""}\n${p.snippet}\n`
      );
    }
  }

  if (bookChunks.length > 0) {
    parts.push("\n## Book Excerpts\n");
    for (const c of bookChunks.slice(0, 6)) {
      parts.push(`### From "${c.book_title}"\n${c.snippet}\n`);
    }
  }

  if (externals.length > 0) {
    parts.push("\n## External Resources\n");
    for (const e of externals.slice(0, 4)) {
      parts.push(
        `### ${e.title} (${e.domain || "external"})\n${e.snippet}${e.url ? `\nSource: ${e.url}` : ""}\n`
      );
    }
  }

  const webResults = sources.filter((s) => s.id.startsWith("google:"));
  if (webResults.length > 0) {
    parts.push("\n## Web Search Results (from authoritative ESG sources)\n");
    for (const w of webResults.slice(0, 5)) {
      parts.push(
        `### ${w.title} (${w.domain})\n${w.snippet}\nURL: ${w.url}\n`
      );
    }
  }

  return parts.join("\n");
}

const SYSTEM_PROMPT = `You are the ESG Hub AI Search Agent, an expert assistant for Environmental, Social, and Governance (ESG) topics. You are part of ESG Hub, an open-access ESG encyclopedia by Ascent Partners Foundation.

Your role is to provide accurate, well-structured answers to ESG questions using the retrieved context from the ESG Hub knowledge base. The context includes:
- ESG Hub articles (307 pages covering all ESG topics)
- Book excerpts from 10 ESG reference books (1,954 text chunks)
- External authoritative resources (244 curated sources from OECD, ILO, GRI, IFRS, HKEX, EPA, etc.)

Guidelines:
1. **Ground your answers in the provided context.** Cite specific sources when possible.
2. **Be comprehensive but concise.** Aim for 200-500 words.
3. **Use markdown formatting** for readability (headers, bold, lists, etc.).
4. **Reference ESG Hub pages** by suggesting the user explore relevant sections (e.g., "See the ESG Hub article on [topic]").
5. **Reference books** when book excerpts are relevant (e.g., "According to 'Carbon Credits Made Simple'...").
6. **Acknowledge uncertainty** if the context doesn't fully cover the question.
7. **Cover key frameworks** (GRI, IFRS S1/S2, TCFD, TNFD, SASB, ESRS/CSRD) when relevant.
8. **Be balanced** and acknowledge different perspectives on debated ESG topics.
9. At the end, suggest 2-3 related ESG Hub topics the user might want to explore.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, embedding, mode = "deep" } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (query.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Query too long (max 2000 characters)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine API to use
    const apiKey = OPENROUTER_API_KEY || DEEPSEEK_API_KEY;
    const apiUrl = OPENROUTER_API_KEY
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.deepseek.com/chat/completions";
    const model = OPENROUTER_API_KEY
      ? "deepseek/deepseek-chat-v3-0324"
      : "deepseek-chat";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 1: Retrieve context from SurrealDB (BM25 + vector) + Google CSE
    const bm25Promise = bm25Search(query.trim(), mode === "quick" ? 5 : 8);
    const vectorPromise =
      embedding && Array.isArray(embedding) && embedding.length === 384
        ? vectorSearch(embedding, mode === "quick" ? 5 : 8)
        : Promise.resolve([]);
    const googlePromise = mode === "deep"
      ? googleSearch(query.trim(), 5)
      : Promise.resolve([]);

    const [bm25Results, vectorResults, googleResults] = await Promise.all([
      bm25Promise,
      vectorPromise,
      googlePromise,
    ]);

    // Merge SurrealDB results first, then append Google results
    const mergedSources = mergeAndRank(bm25Results, vectorResults);
    // Add Google results that aren't already in the merged set
    const existingUrls = new Set(mergedSources.map(s => s.url).filter(Boolean));
    for (const gr of googleResults) {
      if (!existingUrls.has(gr.url) && mergedSources.length < 25) {
        mergedSources.push(gr);
        existingUrls.add(gr.url);
      }
    }
    const ragContext = buildRAGContext(mergedSources);

    // Prepare sources for the client (without full snippets for bandwidth)
    const clientSources = mergedSources.map((s) => ({
      id: s.id,
      title: s.title.replace(/ \(Chunk \d+\)$/, ""),
      permalink: s.permalink,
      url: s.url,
      source_type: s.source_type,
      book_title: s.book_title,
      domain: s.domain,
      section: s.section,
      snippet: s.snippet.slice(0, 150),
    }));

    // Deduplicate client sources by title
    const uniqueSources = Array.from(
      new Map(clientSources.map((s) => [s.title, s])).values()
    ).slice(0, 12);

    // Step 2: Stream AI response with RAG context
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send sources first
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "sources", data: uniqueSources })}\n\n`
          )
        );

        // Build the prompt
        const userPrompt = ragContext
          ? `Based on the following ESG Hub knowledge base context, answer the user's question.\n\n---\n${ragContext}\n---\n\nUser Question: ${query.trim()}`
          : `Answer the following ESG question based on your knowledge:\n\n${query.trim()}`;

        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
              max_tokens: 2048,
              temperature: 0.3,
              stream: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[AI Search] LLM API error:", response.status, errorText);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", data: "AI service temporarily unavailable" })}\n\n`
              )
            );
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", data: "No response stream" })}\n\n`
              )
            );
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":")) continue;
              if (trimmed === "data: [DONE]") continue;
              if (!trimmed.startsWith("data: ")) continue;

              try {
                const json = JSON.parse(trimmed.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "chunk", data: content })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip malformed SSE lines
              }
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done" })}\n\n`
            )
          );
        } catch (err) {
          console.error("[AI Search] Stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", data: "An error occurred while generating the answer" })}\n\n`
            )
          );
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[AI Search] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
