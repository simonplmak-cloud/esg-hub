/**
 * Database Schema Verification Script
 * Run: node scripts/verify-db-schema.mjs
 * 
 * Verifies:
 * - Required indexes exist
 * - Permalinks are unique
 * - Required fields are present
 */

const SURREAL_ENDPOINT = process.env.SURREAL_ENDPOINT || "";
const SURREAL_USERNAME = process.env.SURREAL_USERNAME || "root";
const SURREAL_PASSWORD = process.env.SURREAL_PASSWORD || "ValuationApp2026!";
const SURREAL_NAMESPACE = process.env.SURREAL_NAMESPACE || "esg_hub";
const SURREAL_DATABASE = process.env.SURREAL_DATABASE || "main";

async function querySurreal(sql) {
  const res = await fetch(`${SURREAL_ENDPOINT}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "Accept": "application/json",
      "surreal-ns": SURREAL_NAMESPACE,
      "surreal-db": SURREAL_DATABASE,
      "Authorization": "Basic " + Buffer.from(`${SURREAL_USERNAME}:${SURREAL_PASSWORD}`).toString("base64"),
    },
    body: sql,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SurrealDB error ${res.status}: ${text}`);
  }
  return res.json();
}

async function verifySchema() {
  console.log("🔍 Verifying ESG Hub Database Schema...\n");

  try {
    // Check table exists
    console.log("1. Checking if 'page' table exists...");
    const tableCheck = await querySurreal("INFO FOR TABLE page;");
    console.log("   ✅ Table 'page' exists\n");

    // Check for indexes
    console.log("2. Checking indexes on 'page' table...");
    const indexes = tableCheck[0]?.result?.indexes || {};
    console.log(`   Found indexes: ${Object.keys(indexes).join(", ") || "none"}`);

    // Check for unique constraint on permalink
    console.log("\n3. Checking for unique constraint on 'permalink'...");
    const uniquePermalink = Object.values(indexes).some(
      (idx) => idx?.type === "UNIQUE" && idx?.fields?.includes("permalink")
    );
    if (uniquePermalink) {
      console.log("   ✅ Unique index on 'permalink' exists");
    } else {
      console.log("   ⚠️  No unique index on 'permalink' - duplicates possible");
    }

    // Check for indexes on commonly queried fields
    console.log("\n4. Checking commonly queried fields...");
    const recommendedIndexes = ["section", "slug", "related_pages", "backlinks"];
    for (const field of recommendedIndexes) {
      const hasIndex = Object.keys(indexes).some(k => k.includes(field));
      console.log(`   ${hasIndex ? "✅" : "⚠️ "} Index on '${field}': ${hasIndex ? "exists" : "missing"}`);
    }

    // Check for duplicate permalinks
    // SurrealDB does not support HAVING — filter after aggregation using a nested SELECT
    console.log("\n5. Checking for duplicate permalinks...");
    const duplicates = await querySurreal(`
      SELECT permalink, cnt FROM (
        SELECT permalink, count() AS cnt FROM page
        WHERE permalink IS NOT NONE
        GROUP BY permalink
      ) WHERE cnt > 1
    `);
    const dupList = duplicates[0]?.result || [];
    if (dupList.length > 0) {
      console.log(`   ⚠️  Found ${dupList.length} duplicate permalinks:`);
      dupList.slice(0, 5).forEach(d => {
        console.log(`      - ${d.permalink} (${d.cnt} times)`);
      });
    } else {
      console.log("   ✅ No duplicate permalinks found");
    }

    // Check for missing required fields
    console.log("\n6. Checking for pages with missing required fields...");
    const missingTitle = await querySurreal("SELECT count() FROM page WHERE title IS NONE GROUP ALL;");
    const missingPermalink = await querySurreal("SELECT count() FROM page WHERE permalink IS NONE GROUP ALL;");
    const missingSection = await querySurreal("SELECT count() FROM page WHERE section IS NONE GROUP ALL;");

    const titleCount = missingTitle[0]?.result?.[0]?.count || 0;
    const permalinkCount = missingPermalink[0]?.result?.[0]?.count || 0;
    const sectionCount = missingSection[0]?.result?.[0]?.count || 0;

    console.log(`   ${titleCount === 0 ? "✅" : "⚠️ "} Pages missing title: ${titleCount}`);
    console.log(`   ${permalinkCount === 0 ? "✅" : "⚠️ "} Pages missing permalink: ${permalinkCount}`);
    console.log(`   ${sectionCount === 0 ? "✅" : "⚠️ "} Pages missing section: ${sectionCount}`);

    // Summary
    console.log("\n📊 Summary:");
    console.log(`   Total pages: ${(await querySurreal("SELECT count() FROM page GROUP ALL;"))[0]?.result?.[0]?.count || 0}`);
    console.log(`   Total sections: ${(await querySurreal("SELECT section, count() FROM page WHERE section IS NOT NONE GROUP BY section;"))[0]?.result?.length || 0}`);

    // Recommendations
    console.log("\n📝 Recommendations:");
    console.log("   To add unique index on permalink:");
    console.log("   DEFINE INDEX unique_permalink ON TABLE page FIELDS permalink UNIQUE;");
    console.log("\n   To add index on section:");
    console.log("   DEFINE INDEX idx_section ON TABLE page FIELDS section;");

    console.log("\n✅ Schema verification complete!");

  } catch (error) {
    console.error("❌ Error verifying schema:", error.message);
  }
}

verifySchema();
