// Debug script to test page conditions for PageImage/OpenAlex rendering
const SURREAL_ENDPOINT = "https://valuation-webap-06dvm6i94trq92goln8f5gebnk.aws-euw1.surreal.cloud";
const SURREAL_NS = "esg_hub";
const SURREAL_DB = "main";
const SURREAL_USER = "root";
const SURREAL_PASS = process.env.SURREAL_PASSWORD || "";

async function queryHttp(sql) {
  const url = `${SURREAL_ENDPOINT}/sql`;
  const auth = Buffer.from(`${SURREAL_USER}:${SURREAL_PASS}`).toString("base64");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Basic ${auth}`,
      "surreal-ns": SURREAL_NS,
      "surreal-db": SURREAL_DB,
    },
    body: JSON.stringify(sql),
  });
  const data = await res.json();
  return data;
}

async function main() {
  const permalink = "/environmental/climate-change/";
  const results = await queryHttp(`SELECT * FROM page WHERE permalink = '${permalink}' LIMIT 1`);
  
  if (!results || !results[0] || !results[0].result || !results[0].result[0]) {
    console.log("Page not found");
    return;
  }
  
  const page = results[0].result[0];
  console.log("Page found:", page.title);
  console.log("Layout:", page.layout);
  console.log("Slug:", page.slug);
  console.log("Content length:", page.content?.trim().length);
  console.log("Section:", page.section);
  console.log("Keywords:", page.keywords?.substring(0, 100));
  
  const isHubPage = page.layout === "apf-design" || page.slug === "index" || page.content?.trim().length < 200;
  console.log("\nisHubPage:", isHubPage);
  console.log("  layout === 'apf-design':", page.layout === "apf-design");
  console.log("  slug === 'index':", page.slug === "index");
  console.log("  content.length < 200:", page.content?.trim().length < 200);
  
  const showImage = !isHubPage && page.content?.trim().length > 500;
  console.log("\nshowImage:", showImage);
  
  const showOpenAlex = !isHubPage && page.content?.trim().length > 300;
  console.log("showOpenAlex:", showOpenAlex);
}

main().catch(console.error);
