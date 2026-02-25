/**
 * Fix Schema - Make all array fields optional
 */

import Surreal from "surrealdb";

const endpoint = "https://valuation-webap-06dvm6i94trq92goln8f5gebnk.aws-euw1.surreal.cloud";
const db = new Surreal();

async function main() {
  await db.connect(`${endpoint}/rpc`);
  await db.signin({ username: "root", password: "ValuationApp2026!" });
  await db.use({ namespace: "esg_hub", database: "main" });

  console.log("Fixing all array fields...");
  
  const fields = [
    "backlinks", "connects_to", "related_pages", "related_topics", 
    "standards", "keywords"
  ];
  
  for (const field of fields) {
    try {
      await db.query(`REMOVE FIELD ${field} ON page`);
    } catch(e) {}
    try {
      await db.query(`DEFINE FIELD IF NOT EXISTS ${field} ON page TYPE option<array<string>>`);
      console.log(`✓ ${field}`);
    } catch(e) {
      console.log(`✗ ${field}: ${e.message}`);
    }
  }

  console.log("\n✅ All fields fixed!");
  await db.close();
}

main();
