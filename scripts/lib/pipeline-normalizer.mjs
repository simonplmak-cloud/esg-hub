/**
 * Pipeline Normalizer — HTML/JSON/text canonicalization for KM ingestion.
 *
 * Dependencies: cheerio (`pnpm add cheerio`)
 */

import * as cheerioLib from "cheerio";

const cheerio = cheerioLib.default || cheerioLib;

// Patterns to strip: cookie banners, ads, social widgets
const REMOVE_SELECTORS = [
  // Ads & social
  '[class*="ad-"]', '[id*="ad-"]', '[class*="advertisement"]',
  '[class*="social-share"]', '[class*="social-links"]',
  '[class*="share-buttons"]', '[class*="addthis"]',
  // Cookie / consent banners
  '[id*="cookie"]', '[class*="cookie"]',
  '[id*="consent"]', '[class*="consent"]',
  '[id*="gdpr"]', '[class*="gdpr"]',
  '[class*="banner"]', '[class*="notice-banner"]',
  // Popups & overlays
  '[class*="popup"]', '[class*="modal"]', '[class*="overlay"]',
  // Nav & sidebars
  "nav", '[class*="sidebar"]', '[class*="side-bar"]',
  '[class*="toc"]', '[class*="table-of-contents"]',
  // Misc noise
  '[class*="promo"]', '[class*="newsletter"]', '[class*="subscribe"]',
  '[role="banner"]', '[role="complementary"]',
];

// Structural elements to remove (their text content is not useful)
const STRUCTURAL_TO_REMOVE = [
  "script", "style", "noscript", "iframe", "svg",
  "footer", "header", "aside",
];

// Content containers to try (in priority order)
const CONTENT_SELECTORS = [
  "article",
  "main",
  '[role="main"]',
  "#content",
  "#main-content",
  ".content",
  ".main-content",
  ".post-content",
  ".article-content",
  ".entry-content",
  "#article-body",
  ".document-body",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collapseWhitespace(text) {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

function innerText($, el) {
  // Walk the element tree, preserving block-level line breaks
  const parts = [];
  function walk(node) {
    if (node.type === "text") {
      const txt = collapseWhitespace($(node).text());
      if (txt) parts.push(txt);
      return;
    }
    if (node.type === "tag") {
      if (["script", "style", "noscript", "iframe", "svg"].includes(node.name)) return;
      const blockTags = [
        "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
        "li", "td", "th", "blockquote", "pre", "section",
        "article", "header", "footer", "nav", "main", "aside",
        "form", "table", "tr", "dl", "dt", "dd", "ol", "ul",
        "hr", "figure", "figcaption", "br",
      ];
      const isBlock = blockTags.includes(node.name);
      if (isBlock && parts.length > 0 && parts[parts.length - 1] !== "\n") {
        parts.push("\n");
      }
      if (node.name === "br") return;
      for (const child of node.children) {
        walk(child);
      }
      if (isBlock && parts.length > 0 && parts[parts.length - 1] !== "\n") {
        parts.push("\n");
      }
    }
  }
  for (const child of el.children || []) {
    walk(child);
  }
  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Normalize HTML content — strip noise, extract main text and links.
 *
 * @param {string} html - Raw HTML
 * @param {string} [url] - Source URL (for logging)
 * @returns {{ text: string, links: string[], title: string }}
 */
export function normalizeHTML(html, url) {
  try {
    const $ = cheerio.load(html);

    // Title
    const title = $("title").first().text().trim() || "";

    // Remove structural elements
    for (const sel of STRUCTURAL_TO_REMOVE) {
      $(sel).remove();
    }

    // Remove noise patterns
    for (const sel of REMOVE_SELECTORS) {
      $(sel).remove();
    }

    // Extract main content
    let $content = null;
    for (const sel of CONTENT_SELECTORS) {
      const $el = $(sel).first();
      if ($el.length > 0 && $el.text().trim().length > 100) {
        $content = $el;
        break;
      }
    }

    if (!$content) {
      $content = $("body");
    }

    // Extract links from the content container
    const links = [];
    $content.find("a[href]").each((_i, el) => {
      const href = $(el).attr("href");
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        links.push(href);
      }
    });

    // Extract text
    const text = innerText($, $content[0]);

    return { text, links, title };
  } catch (err) {
    console.error(`[normalizeHTML] error processing ${url || "unknown"}: ${err.message}`);
    return { text: "", links: [], title: "" };
  }
}

/**
 * Normalize JSON — flatten nested objects/arrays to a concatenated text blob.
 *
 * @param {any} json - Parsed JSON object or string
 * @returns {{ text: string }}
 */
export function normalizeJSON(json) {
  try {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    const parts = [];

    function flatten(val, depth) {
      if (depth > 20) return; // guard against recursion bombs
      if (val === null || val === undefined) return;
      if (typeof val === "string") {
        parts.push(val);
      } else if (typeof val === "number" || typeof val === "boolean") {
        parts.push(String(val));
      } else if (Array.isArray(val)) {
        for (const item of val) {
          flatten(item, depth + 1);
        }
      } else if (typeof val === "object") {
        for (const v of Object.values(val)) {
          flatten(v, depth + 1);
        }
      }
    }

    flatten(data, 0);
    return { text: parts.join("\n") };
  } catch (err) {
    console.error(`[normalizeJSON] error: ${err.message}`);
    return { text: "" };
  }
}

/**
 * Canonicalize plain text — NFC normalization, whitespace collapse, zero-width
 * removal. Returns an offset map so extracted spans can be verified against
 * the exact stream they were computed from.
 *
 * Computes offsets on the canonical normalized text stream and retains a
 * canonical→raw offset map so extracted spans are always verifiable against
 * the exact stream they were computed from.
 *
 * @param {string} text - Raw text
 * @returns {{ text: string, offsetMap: Map<number,number> }}
 */
export function canonicalizeText(text) {
  // Step 1: remove zero-width characters
  const noZw = text.replace(/[\u200B-\u200F\uFEFF\u00AD\u2060]/g, "");

  // Step 2: NFC normalize
  const nfc = noZw.normalize("NFC");

  // Step 3: collapse whitespace and build offset map
  // We process the NFC string and build a mapping from canonical position → raw (NFC) position
  const out = [];
  /** @type {Map<number, number>} */
  const offsetMap = new Map();
  let rawPos = 0;

  for (let i = 0; i < nfc.length; i++) {
    const ch = nfc[i];
    // Record mapping before we potentially skip a character
    offsetMap.set(out.length, rawPos);

    if (ch === "\r") {
      out.push("\n");
      rawPos++;
      // Skip following \n if this was \r\n
      if (nfc[i + 1] === "\n") {
        i++;
        rawPos++;
      }
      continue;
    }

    if (ch === " " || ch === "\t" || ch === "\n") {
      // Collapse multiple whitespace to single space (or newline)
      if (ch === "\n") {
        // Trim trailing whitespace before newline
        while (out.length > 0 && out[out.length - 1] === " ") {
          out.pop();
        }
        // Collapse multiple newlines to max 2
        const last = out.length > 0 ? out[out.length - 1] : null;
        if (last !== "\n") {
          out.push("\n");
        } else {
          // Already have a newline, skip this one
          rawPos++;
          continue;
        }
      } else {
        // Space/tab: collapse to single space, skip leading
        const last = out.length > 0 ? out[out.length - 1] : null;
        if (last !== " " && last !== "\n" && out.length > 0) {
          out.push(" ");
        } else if (out.length === 0) {
          // Skip leading whitespace
        }
      }
      rawPos++;
      continue;
    }

    out.push(ch);
    rawPos++;
  }

  // Trim trailing whitespace
  while (out.length > 0 && (out[out.length - 1] === " " || out[out.length - 1] === "\n")) {
    out.pop();
  }

  // Final mapping entry for end-of-string
  offsetMap.set(out.length, rawPos);

  return { text: out.join(""), offsetMap };
}
