/**
 * Capture queued operations before the build, then acknowledge them only
 * after GitHub Pages deployment succeeds. No recurring jobs or snapshots.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";

const base = "https://api.notion.com/v1";
const databaseId = "052459fcf9df4a0985d0a0e68375c93b";
const token = process.env.NOTION_API_TOKEN;
const headers = {
  Authorization: `Bearer ${token}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(base + path, { ...options, headers });
  if (!response.ok) throw new Error(`Notion ${path}: HTTP ${response.status} ${await response.text()}`);
  return response.json();
}

async function capture() {
  const entries = [];
  let cursor;
  do {
    const data = await request(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    for (const page of data.results) {
      const status = page.properties["Publication status"]?.select?.name;
      if (status !== "Queued Publish" && status !== "Queued Unpublish") continue;
      const editorial = page.properties["Editorial status"]?.select?.name;
      if (status === "Queued Publish" && editorial !== "Ready") {
        throw new Error(`Queued page ${page.id} is not editorially Ready`);
      }
      entries.push({
        id: page.id,
        status,
        lastEdited: page.last_edited_time,
        slug: (page.properties.Slug?.rich_text ?? []).map((t) => t.plain_text).join(""),
      });
    }
    cursor = data.next_cursor;
  } while (cursor);
  await mkdir(".release", { recursive: true });
  await writeFile(".release/queued.json", JSON.stringify(entries, null, 2));
  console.log(`Captured ${entries.length} queued editorial operation(s)`);
}

async function acknowledge() {
  const entries = JSON.parse(await readFile(".release/queued.json", "utf8"));
  let skipped = 0;
  for (const entry of entries) {
    const current = await request(`/pages/${entry.id}`);
    const status = current.properties["Publication status"]?.select?.name;
    const slug = (current.properties.Slug?.rich_text ?? []).map((t) => t.plain_text).join("");
    if (status !== entry.status || current.last_edited_time !== entry.lastEdited || slug !== entry.slug) {
      console.warn(`Skipping changed page ${entry.id}; manual review required`);
      skipped++;
      continue;
    }
    const nextStatus = entry.status === "Queued Publish" ? "Deployed" : "Unpublished";
    const properties = { "Publication status": { select: { name: nextStatus } } };
    if (nextStatus === "Deployed") {
      properties["Last deployed"] = { date: { start: new Date().toISOString() } };
    }
    await request(`/pages/${entry.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    console.log(`Confirmed ${entry.id}: ${entry.status} -> ${nextStatus}`);
  }
  if (skipped) console.warn(`${skipped} changed page(s) were not acknowledged`);
}

if (!token) throw new Error("NOTION_API_TOKEN is required");
if (process.argv[2] === "capture") await capture();
else if (process.argv[2] === "acknowledge") await acknowledge();
else throw new Error("Usage: node scripts/editorial-release.mjs capture|acknowledge");
