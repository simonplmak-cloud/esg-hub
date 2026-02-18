import { readFileSync } from 'fs';
const envFile = readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(envFile.split('\n').filter(l => l.includes('=')).map(l => { const [k,...v] = l.split('='); return [k.trim(), v.join('=').trim()]; }));

const SURREAL_ENDPOINT = env.SURREAL_ENDPOINT;
const SURREAL_USERNAME = env.SURREAL_USERNAME;
const SURREAL_PASSWORD = env.SURREAL_PASSWORD;
const SURREAL_NAMESPACE = env.SURREAL_NAMESPACE;
const SURREAL_DATABASE = env.SURREAL_DATABASE;

async function query(sql) {
  const res = await fetch(`${SURREAL_ENDPOINT}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
      "surreal-ns": SURREAL_NAMESPACE,
      "surreal-db": SURREAL_DATABASE,
      Authorization: "Basic " + Buffer.from(`${SURREAL_USERNAME}:${SURREAL_PASSWORD}`).toString("base64"),
    },
    body: sql,
    cache: "no-store",
  });
  const data = await res.json();
  return data[data.length - 1]?.result || [];
}

// Books
const books = await query("SELECT id, title, permalink, section, subsection FROM page WHERE section = 'books' OR permalink CONTAINS 'book' ORDER BY title LIMIT 30");
console.log("=== BOOKS ===");
books.forEach(b => console.log(`  ${b.title} | ${b.permalink} | section=${b.section}`));

// Videos
const videos = await query("SELECT id, title, permalink, section FROM page WHERE content CONTAINS 'video' OR title CONTAINS 'Video' OR content CONTAINS 'youtube' OR content CONTAINS 'youtu.be' ORDER BY title LIMIT 30");
console.log("\n=== VIDEO REFERENCES ===");
videos.forEach(v => console.log(`  ${v.title} | ${v.permalink}`));

// Resources table
const resources = await query("SELECT count() FROM resource GROUP ALL");
console.log("\n=== RESOURCE COUNT ===");
console.log(resources);

// Check resource structure
const sampleRes = await query("SELECT * FROM resource LIMIT 3");
console.log("\n=== SAMPLE RESOURCES ===");
sampleRes.forEach(r => console.log(JSON.stringify(r, null, 2)));

// Sections
const sections = await query("SELECT section, count() as cnt FROM page GROUP BY section ORDER BY cnt DESC");
console.log("\n=== SECTIONS ===");
sections.forEach(s => console.log(`  ${s.section}: ${s.cnt}`));

// Book page content
const bookPage = await query("SELECT title, content FROM page WHERE permalink = '/books/' LIMIT 1");
console.log("\n=== BOOK PAGE CONTENT (first 2000 chars) ===");
if (bookPage[0]) console.log(bookPage[0].content.substring(0, 2000));

// Video page content
const videoPage = await query("SELECT title, content FROM page WHERE permalink = '/videos/' OR permalink = '/learning/videos/' LIMIT 2");
console.log("\n=== VIDEO PAGE CONTENT (first 2000 chars) ===");
videoPage.forEach(v => { console.log(`--- ${v.title} ---`); console.log(v.content.substring(0, 2000)); });

// Check for PDF references in book content
const pdfPages = await query("SELECT title, permalink FROM page WHERE content CONTAINS '.pdf' ORDER BY title LIMIT 20");
console.log("\n=== PAGES WITH PDF REFERENCES ===");
pdfPages.forEach(p => console.log(`  ${p.title} | ${p.permalink}`));
