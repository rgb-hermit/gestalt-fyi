/** Capture queued changes before build; acknowledge only after Pages deployment. */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { resolve } from "node:path";

const base = "https://api.notion.com/v1";
const databaseId = "052459fcf9df4a0985d0a0e68375c93b";
const recordPath = ".release/queued.json";

async function request(path, options = {}) {
  const token = process.env.NOTION_API_TOKEN;
  if (!token) throw new Error("NOTION_API_TOKEN is required");
  const response = await fetch(base + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error(`Notion ${path}: HTTP ${response.status} ${await response.text()}`);
  return response.json();
}

function details(page) {
  return {
    id: page.id,
    status: page.properties["Publication status"]?.select?.name,
    editorial: page.properties["Editorial status"]?.select?.name,
    slug: (page.properties.Slug?.rich_text ?? []).map((item) => item.plain_text).join(""),
    firstPublished: page.properties["First published"]?.date?.start ?? null,
    lastEdited: page.last_edited_time,
  };
}

export function releaseChange(entry, current) {
  if (!current || entry.status !== current.status ||
      entry.slug !== current.slug || entry.lastEdited !== current.lastEdited) {
    return "Article or publication status changed during release";
  }
  if (entry.status === "Queued Publish" && current.editorial !== "Ready") {
    return "Article is no longer editorially Ready";
  }
  return null;
}

async function queued() {
  const entries = [];
  let cursor;
  do {
    const data = await request(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    for (const page of data.results) {
      const entry = details(page);
      if (!["Queued Publish", "Queued Unpublish"].includes(entry.status)) continue;
      if (entry.status === "Queued Publish" && entry.editorial !== "Ready") {
        throw new Error(`Queued article is not Ready: ${entry.id}`);
      }
      entries.push(entry);
    }
    cursor = data.next_cursor;
  } while (cursor);
  return entries;
}

async function capture() {
  const entries = await queued();
  await mkdir(".release", { recursive: true });
  await writeFile(recordPath, JSON.stringify(entries, null, 2));
  console.log(`Captured ${entries.length} queued operation(s)`);
}

async function verifyBuilt() {
  const entries = JSON.parse(await readFile(recordPath, "utf8"));
  for (const entry of entries) {
    const current = details(await request(`/pages/${entry.id}`));
    const issue = releaseChange(entry, current);
    if (issue) throw new Error(`${entry.id}: ${issue}`);
    const output = resolve("dist/field-guide", entry.slug, "index.html");
    let exists = true;
    try { await access(output); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      exists = false;
    }
    if (entry.status === "Queued Publish" && !exists) {
      throw new Error(`Missing built article: ${entry.slug}`);
    }
    if (entry.status === "Queued Unpublish" && exists) {
      throw new Error(`Article still present in build: ${entry.slug}`);
    }
  }
  console.log(`Verified ${entries.length} queued operation(s) in built site`);
}

async function acknowledge() {
  const entries = JSON.parse(await readFile(recordPath, "utf8"));
  let skipped = 0;
  for (const entry of entries) {
    const current = details(await request(`/pages/${entry.id}`));
    const issue = releaseChange(entry, current);
    if (issue) {
      console.warn(`Skipped ${entry.id}: ${issue}; manual review needed`);
      skipped++;
      continue;
    }
    const deployed = entry.status === "Queued Publish";
    const properties = {
      "Publication status": { select: { name: deployed ? "Deployed" : "Unpublished" } },
    };
    if (deployed) {
      const now = new Date().toISOString();
      properties["Last deployed"] = { date: { start: now } };
      if (!current.firstPublished) properties["First published"] = { date: { start: now } };
    }
    await request(`/pages/${entry.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
    console.log(`Acknowledged ${entry.id}: ${properties["Publication status"].select.name}`);
  }
  if (skipped) throw new Error(`${skipped} queued operation(s) need manual review`);
}

const action = process.argv[2];
if (action === "capture") await capture();
else if (action === "verify-built") await verifyBuilt();
else if (action === "acknowledge") await acknowledge();
else if (action) throw new Error("Usage: editorial-release.mjs capture|verify-built|acknowledge");
