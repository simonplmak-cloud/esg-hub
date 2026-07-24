/**
 * Pipeline LLM — entity extraction and verification via DeepSeek API.
 *
 * Dependencies: none (Node.js built-ins only).
 * Requires: DEEPSEEK_API_KEY in process.env.
 */

const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/v1/chat/completions";
const CHAT_MODEL = "deepseek-chat";
const REASONER_MODEL = "deepseek-reasoner";
const DEFAULT_TEMPERATURE = 0.1;
const INITIAL_MAX_TOKENS = 4096;
const MAX_RETRIES = 1;
const RATE_LIMIT_BACKOFF_MS = 30_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey() {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key || !key.trim()) {
    throw new Error("DEEPSEEK_API_KEY is not set in environment");
  }
  return key.trim();
}

/**
 * @param {object} obj
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateExtractionSchema(obj) {
  const missing = [];
  if (!Array.isArray(obj.entities)) missing.push("entities[]");
  if (!Array.isArray(obj.claims)) missing.push("claims[]");
  if (!obj.taxonomyTags || typeof obj.taxonomyTags !== "object") {
    missing.push("taxonomyTags{}");
  }
  return { valid: missing.length === 0, missing };
}

// ---------------------------------------------------------------------------
// Core API call
// ---------------------------------------------------------------------------

/**
 * Call DeepSeek chat completions API.
 *
 * @param {object} params
 * @param {string} params.model
 * @param {object[]} params.messages
 * @param {number} [params.temperature]
 * @param {number} [params.max_tokens]
 * @param {object} [params.response_format]
 * @returns {Promise<{ data?: any, error?: string, finishReason?: string }>}
 */
async function callDeepSeek({ model, messages, temperature, max_tokens, response_format }) {
  const apiKey = getApiKey();
  const body = {
    model,
    messages,
    stream: false,
  };
  if (temperature !== undefined) body.temperature = temperature;
  if (max_tokens !== undefined) body.max_tokens = max_tokens;
  if (response_format !== undefined) body.response_format = response_format;

  const res = await fetch(DEEPSEEK_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  if (res.status === 429) {
    return { error: "rate_limited", finishReason: null };
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    return {
      error: `DeepSeek API error ${res.status}: ${errBody.slice(0, 500)}`,
      finishReason: null,
    };
  }

  const json = await res.json();
  const choice = json.choices?.[0];
  const finishReason = choice?.finish_reason ?? null;
  const content = choice?.message?.content ?? "";

  if (finishReason === "length") {
    return { error: "output_truncated", finishReason: "length", rawContent: content };
  }

  return { data: content, finishReason };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT_EXTRACT =
  "You are an ESG knowledge extraction system. Extract structured information from the provided text. Return valid JSON matching the expected schema.";

const USER_PROMPT_EXTRACT_TEMPLATE = (text) =>
  `${text}\n\nExtract: entity types, taxonomy tags (topic/industry/framework/jurisdiction), key claims with source span pointers (character offsets from the provided text), and confidence scores (0-1).`;

/**
 * Extract entities, claims, and taxonomy tags from text using DeepSeek-chat.
 *
 * @param {string} text - Source text to extract from
 * @param {{ maxTokens?: number, sourceUrl?: string }} [options]
 * @returns {Promise<object>} Parsed JSON extraction or { error } object
 */
export async function extractEntities(text, options = {}) {
  const maxTokens = options.maxTokens ?? INITIAL_MAX_TOKENS;
  const sourceUrl = options.sourceUrl ?? "unknown";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT_EXTRACT },
    { role: "user", content: USER_PROMPT_EXTRACT_TEMPLATE(text) },
  ];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await callDeepSeek({
        model: CHAT_MODEL,
        messages,
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      // Handle rate limiting
      if (result.error === "rate_limited" && attempt < MAX_RETRIES) {
        console.warn(
          `[extractEntities] 429 on ${sourceUrl}, backing off ${RATE_LIMIT_BACKOFF_MS / 1000}s (attempt ${attempt + 1})`
        );
        await delay(RATE_LIMIT_BACKOFF_MS);
        continue;
      }
      if (result.error === "rate_limited") {
        return { error: "Rate limited after retries" };
      }

      // Handle output truncation — retry with doubled tokens
      if (result.error === "output_truncated" && attempt < MAX_RETRIES) {
        const newMax = maxTokens * 2;
        console.warn(
          `[extractEntities] output truncated on ${sourceUrl}, retrying with max_tokens=${newMax}`
        );
        return extractEntities(text, { ...options, maxTokens: newMax });
      }

      if (result.error) {
        return { error: result.error };
      }

      // Parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(result.data);
      } catch (jsonErr) {
        if (attempt < MAX_RETRIES) {
          console.warn(
            `[extractEntities] malformed JSON on ${sourceUrl}, retrying (attempt ${attempt + 1})`
          );
          await delay(1000);
          continue;
        }
        return { error: `Failed to parse JSON response: ${jsonErr.message}` };
      }

      // Schema validation
      const { valid, missing } = validateExtractionSchema(parsed);
      if (!valid && attempt < MAX_RETRIES) {
        console.warn(
          `[extractEntities] schema incomplete on ${sourceUrl} (missing: ${missing.join(", ")}), retrying`
        );
        await delay(1000);
        continue;
      }
      if (!valid) {
        return {
          error: `Schema validation failed: missing ${missing.join(", ")}`,
          partial: parsed,
        };
      }

      return parsed;
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.warn(
          `[extractEntities] error on ${sourceUrl}: ${err.message}, retrying (attempt ${attempt + 1})`
        );
        await delay(RATE_LIMIT_BACKOFF_MS);
        continue;
      }
      console.error(`[extractEntities] failed on ${sourceUrl}: ${err.message}`);
      return { error: err.message };
    }
  }

  return { error: "Unknown error" };
}

const SYSTEM_PROMPT_VERIFY =
  "Verify ESG knowledge extraction against source text. Check: factual accuracy, contradiction with provided source, entity typing correctness.";

/**
 * Verify an extraction against the source text using DeepSeek-reasoner.
 *
 * @param {object} extraction - The extraction object to verify
 * @param {string} rawText - The original source text
 * @param {{ sourceUrl?: string }} [options]
 * @returns {Promise<{ confidence?: number, issues?: any[], corrections?: any[], error?: string }>}
 */
export async function verifyExtraction(extraction, rawText, options = {}) {
  const sourceUrl = options.sourceUrl ?? "unknown";

  const userPrompt = [
    "Source text:",
    rawText.slice(0, 32000), // limit context to avoid overflow
    "",
    "Extraction to verify:",
    JSON.stringify(extraction, null, 2),
    "",
    "Verify: factual accuracy, contradiction with provided source, entity typing correctness.",
    'Return JSON: { "confidence": 0-1, "issues": [...], "corrections": [...] }',
  ].join("\n");

  const messages = [
    { role: "system", content: SYSTEM_PROMPT_VERIFY },
    { role: "user", content: userPrompt },
  ];

  try {
    const result = await callDeepSeek({
      model: REASONER_MODEL,
      messages,
      temperature: DEFAULT_TEMPERATURE,
    });

    if (result.error) {
      return { error: result.error, confidence: 0 };
    }

    try {
      const parsed = JSON.parse(result.data);
      return {
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
      };
    } catch (jsonErr) {
      console.error(`[verifyExtraction] failed to parse verification JSON on ${sourceUrl}`);
      return { error: `JSON parse error: ${jsonErr.message}`, confidence: 0 };
    }
  } catch (err) {
    console.error(`[verifyExtraction] error on ${sourceUrl}: ${err.message}`);
    return { error: err.message, confidence: 0 };
  }
}
