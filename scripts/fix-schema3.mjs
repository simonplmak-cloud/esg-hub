/**
 * Fix Schema - Make all array fields optional
 */

import Surreal from "surrealdb";

const endpoint = (process.env.SURREAL_ENDPOINT || "");
const db = new Surreal();

async function main() {
  await db.connect(`${endpoint}/rpc`);
  await db.signin({ username: "root", password: process.env.SURREAL_PASSWORD || "" });
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
