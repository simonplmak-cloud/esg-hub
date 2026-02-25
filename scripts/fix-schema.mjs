/**
 * Fix Schema - Make optional fields optional
 */

import Surreal from "surrealdb";

const endpoint = "https://valuation-webap-06dvm6i94trq92goln8f5gebnk.aws-euw1.surreal.cloud";
const db = new Surreal();

async function main() {
  await db.connect(`${endpoint}/rpc`);
  await db.signin({ username: "root", password: "ValuationApp2026!" });
  await db.use({ namespace: "esg_hub", database: "main" });

  console.log("Fixing schema...");
  
  try {
    await db.query("DEFINE FIELD IF NOT EXISTS backlinks ON page TYPE option<array<record<page>>>");
    console.log("✓ backlinks");
  } catch(e) { console.log("✗ backlinks:", e.message); }
  
  try {
    await db.query("DEFINE FIELD IF NOT EXISTS connects_to ON page TYPE option<array<string>>");
    console.log("✓ connects_to");
  } catch(e) { console.log("✗ connects_to:", e.message); }

  console.log("\n✅ Schema fixed!");
  await db.close();
}

main();
