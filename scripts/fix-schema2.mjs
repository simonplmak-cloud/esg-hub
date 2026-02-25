/**
 * Fix Schema - Make fields truly optional
 */

import Surreal from "surrealdb";

const endpoint = "https://valuation-webap-06dvm6i94trq92goln8f5gebnk.aws-euw1.surreal.cloud";
const db = new Surreal();

async function main() {
  await db.connect(`${endpoint}/rpc`);
  await db.signin({ username: "root", password: "ValuationApp2026!" });
  await db.use({ namespace: "esg_hub", database: "main" });

  console.log("Removing required constraint from fields...");
  
  try {
    await db.query("REMOVE FIELD backlinks ON page");
    console.log("✓ Removed backlinks");
  } catch(e) { console.log("✗ backlinks:", e.message); }
  
  try {
    await db.query("REMOVE FIELD connects_to ON page");
    console.log("✓ Removed connects_to");
  } catch(e) { console.log("✗ connects_to:", e.message); }

  try {
    await db.query("DEFINE FIELD backlinks ON page TYPE option<array<record<page>>>");
    console.log("✓ Added backlinks as optional");
  } catch(e) { console.log("✗ add backlinks:", e.message); }

  try {
    await db.query("DEFINE FIELD connects_to ON page TYPE option<array<string>>");
    console.log("✓ Added connects_to as optional");
  } catch(e) { console.log("✗ add connects_to:", e.message); }

  console.log("\n✅ Schema fixed!");
  await db.close();
}

main();
