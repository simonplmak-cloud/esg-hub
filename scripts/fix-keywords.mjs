/**
 * Fix Schema - Make keywords optional string
 */

import Surreal from "surrealdb";

const endpoint = "https://valuation-webap-06dvm6i94trq92goln8f5gebnk.aws-euw1.surreal.cloud";
const db = new Surreal();

async function main() {
  await db.connect(`${endpoint}/rpc`);
  await db.signin({ username: "root", password: "ValuationApp2026!" });
  await db.use({ namespace: "esg_hub", database: "main" });

  console.log("Fixing keywords field...");
  
  try {
    await db.query("REMOVE FIELD keywords ON page");
  } catch(e) {}
  
  try {
    await db.query("DEFINE FIELD IF NOT EXISTS keywords ON page TYPE option<string>");
    console.log("✓ keywords fixed as string");
  } catch(e) {
    console.log("✗:", e.message);
  }

  console.log("\n✅ Done!");
  await db.close();
}

main();
