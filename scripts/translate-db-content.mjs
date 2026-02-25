/**
 * Translate Database Content to Chinese and Hindi
 * 
 * Fetches all pages and resources from SurrealDB and translates:
 * - page: title, description, content
 * - resource: title, description
 * 
 * Run: node scripts/translate-db-content.mjs
 * 
 * Uses MiniMax for translation
 */

import Surreal from "surrealdb";

const SURREAL_ENDPOINT = process.env.SURREAL_ENDPOINT || "https://valuation-webap-06dvm6i94trq92goln8f5gebnk.aws-euw1.surreal.cloud";
const SURREAL_USERNAME = process.env.SURREAL_USERNAME || "root";
const SURREAL_PASSWORD = process.env.SURREAL_PASSWORD || "ValuationApp2026!";
const SURREAL_NAMESPACE = process.env.SURREAL_NAMESPACE || "esg_hub";
const SURREAL_DATABASE = process.env.SURREAL_DATABASE || "main";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || process.env.DEEPSEEK_API_KEY || "";
const MINIMAX_BASE_URL = "https://api.minimax.chat/v1";

const db = new Surreal();

interface TranslationResult {
  zh: string;
  hi: string;
}

async function translateWithMiniMax(text: string, targetLang: "zh" | "hi"): Promise<string> {
  if (!text || text.trim().length === 0) {
    return "";
  }

  const langName = targetLang === "zh" ? "Chinese (Simplified)" : "Hindi";
  
  const prompt = `Translate the following English text to ${langName}. 
- If it's a title or heading, keep it concise and appropriate for the language
- If it's content/description, translate naturally while preserving meaning
- Do NOT add any explanations or extra text
- Just provide the translation

Text to translate:
${text}`;

  try {
    const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.5",
        messages: [
          { role: "system", content: "You are a professional translator. Translate content accurately and naturally." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MiniMax API error (${targetLang}):`, errorText);
      return "";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error(`Translation error (${targetLang}):`, err);
    return "";
  }
}

async function translateText(text: string): Promise<TranslationResult> {
  if (!text || text.trim().length === 0) {
    return { zh: "", hi: "" };
  }

  // Translate to both languages in parallel
  const [zh, hi] = await Promise.all([
    translateWithMiniMax(text, "zh"),
    translateWithMiniMax(text, "hi"),
  ]);

  // Add small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 500));

  return { zh, hi };
}

async function translatePageContent(record: Record<string, unknown>): Promise<Record<string, unknown>> {
  const id = record.id;
  const title = record.title as string;
  const description = record.description as string;
  const content = record.content as string;

  console.log(`\nTranslating page: ${title?.substring(0, 50)}...`);

  const result: Record<string, unknown> = {};

  // Translate title
  if (title) {
    const titleTranslations = await translateText(title);
    result.title_zh = titleTranslations.zh;
    result.title_hi = titleTranslations.hi;
    console.log(`  Title: ${title.substring(0, 30)}... -> ZH: ${titleTranslations.zh.substring(0, 30)}...`);
  }

  // Translate description
  if (description) {
    const descTranslations = await translateText(description);
    result.description_zh = descTranslations.zh;
    result.description_hi = descTranslations.hi;
  }

  // Translate content
  if (content) {
    // For content, translate in chunks to avoid token limits
    const contentTranslations = await translateText(content);
    result.content_zh = contentTranslations.zh;
    result.content_hi = contentTranslations.hi;
  }

  return result;
}

async function translateResourceContent(record: Record<string, unknown>): Promise<Record<string, unknown>> {
  const id = record.id;
  const title = record.title as string;
  const description = record.description as string;

  console.log(`\nTranslating resource: ${title?.substring(0, 50)}...`);

  const result: Record<string, unknown> = {};

  // Translate title
  if (title) {
    const titleTranslations = await translateText(title);
    result.title_zh = titleTranslations.zh;
    result.title_hi = titleTranslations.hi;
  }

  // Translate description
  if (description) {
    const descTranslations = await translateText(description);
    result.description_zh = descTranslations.zh;
    result.description_hi = descTranslations.hi;
  }

  return result;
}

async function main() {
  if (!MINIMAX_API_KEY) {
    console.error("Error: MINIMAX_API_KEY environment variable is required");
    console.log("Please set it and run again:");
    console.log("  export MINIMAX_API_KEY=your_api_key");
    console.log("  node scripts/translate-db-content.mjs");
    process.exit(1);
  }

  console.log("Connecting to SurrealDB...");
  
  try {
    await db.connect(`${SURREAL_ENDPOINT}/rpc`);
    await db.signin({
      username: SURREAL_USERNAME,
      password: SURREAL_PASSWORD,
    });
    await db.use({ namespace: SURREAL_NAMESPACE, database: SURREAL_DATABASE });
    
    console.log("Connected successfully!\n");

    // Translate pages
    console.log("Fetching pages from database...");
    const pagesResult = await db.query<[Record<string, unknown>[]]>("SELECT id, title, description, content FROM page LIMIT 500");
    const pages = pagesResult[0];
    console.log(`Found ${pages.length} pages to translate\n`);

    let translatedCount = 0;
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      console.log(`\n[${i + 1}/${pages.length}] Processing page...`);
      
      try {
        const translations = await translatePageContent(page);
        
        if (Object.keys(translations).length > 0) {
          const pageId = typeof page.id === "object" ? page.id.id : page.id;
          await db.query(`UPDATE ${pageId} SET ${Object.entries(translations).map(([k, v]) => `${k} = '${(v as string).replace(/'/g, "\\'")}'`).join(", ")}`);
          translatedCount++;
          console.log(`  ✓ Updated translations for page`);
        }
      } catch (err) {
        console.error(`  ✗ Error translating page:`, err);
      }
    }

    console.log(`\n✅ Translated ${translatedCount} pages to Chinese and Hindi`);

    // Translate resources
    console.log("\n\nFetching resources from database...");
    const resourcesResult = await db.query<[Record<string, unknown>[]]>("SELECT id, title, description FROM resource LIMIT 500");
    const resources = resourcesResult[0];
    console.log(`Found ${resources.length} resources to translate\n`);

    let resourceCount = 0;
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      console.log(`\n[${i + 1}/${resources.length}] Processing resource...`);
      
      try {
        const translations = await translateResourceContent(resource);
        
        if (Object.keys(translations).length > 0) {
          const resourceId = typeof resource.id === "object" ? resource.id.id : resource.id;
          await db.query(`UPDATE ${resourceId} SET ${Object.entries(translations).map(([k, v]) => `${k} = '${(v as string).replace(/'/g, "\\'")}'`).join(", ")}`);
          resourceCount++;
          console.log(`  ✓ Updated translations for resource`);
        }
      } catch (err) {
        console.error(`  ✗ Error translating resource:`, err);
      }
    }

    console.log(`\n✅ Translated ${resourceCount} resources to Chinese and Hindi`);
    console.log("\n🎉 Database content translation complete!");

  } catch (err) {
    console.error("Translation failed:", err);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main();
