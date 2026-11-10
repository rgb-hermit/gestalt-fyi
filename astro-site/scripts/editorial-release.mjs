/**
 * One-off editorial release records; no article snapshots or background polling.
 * Capture before build, verify against built pages, acknowledge after Pages deploy.
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const base = "https://api.notion.com/v1";
const databaseId = "052459fcf9df4a0985d0a0e68375c93b";
const token = process.env.NOTION_API_TOKEN;
const headers = {
  Authorization: `Bearer ${token}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};
const recordPath = ".release/queued.json";

async function request(path, options = {}) {
  const response = await fetch(base + path, { ...options, headers });
  if (!response.ok) throw new Error(`Notion ${path}: HTTP ${response.status} ${await response.text()}`);
  return response.json();
}
function plainText(items = []) {
  return items.map((item) => item.plain_text).join("");
}
function propertiesOf(page) {
  return {
    status: page.properties["Publication status"]?.select?.name,
    editorial: page.properties["Editorial status"]?.select?.name,
    slug: plainText(page.properties.Slug?.rich_text),
    firstPublished: page.properties["First published"]?.date?.start ?? null,
    lastEdited: page.last_edited_time,
  };
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !["last_edited_time", "created_time", "expiry_time", "request_id"].includes(key))
      .sort(([a], [b]) => a.localeCompare(b, "en"))
      .map(([key, item]) => [key, stable(item)]));
  }
  return value;
}
async function children(id) {
  const results = [];
  let cursor;
  do {
    const data = await request(`/blocks/${id}/children?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ""}`);
    for (const block of data.results) {
      const item = { id: block.id, type: block.type, data: block[block.type] };
      if (block.has_children) item.children = await children(block.id);
      results.push(item);
    }
    cursor = data.next_cursor;
  } while (cursor);
  return results;
}
async function fingerprint(id) {
  const blocks = await children(id);
  return createHash("sha256").update(JSON.stringify(stable(blocks))).digest("hex");
}
async function queryQueued() {
  const entries = [];
  let cursor;
  do {
    const data = await request(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    for (const page of data.results) {
      const props = propertiesOf(page);
      if (!["Queued Publish", "Queued Unpublish"].includes(props.status)) continue;
      if (props.status === "Queued Publish" && props.editorial !== "Ready") {
        throw new Error(`Queued page ${page.id} is not editorially Ready`);
      }
      entries.push({ id: page.id, ...props, contentHash: await fingerprint(page.id) });
    }
    cursor = data.next_cursor;
  } while (cursor);
  return entries;
}
export function evaluateReleaseEntry(entry, current, phase) {
  if (!current || entry.status !== current.status || entry.slug !== current.slug ||
      entry.lastEdited !== current.lastEdited || entry.contentHash !== current.contentHash) {
    return "Notion content or publication metadata changed";
  }
  if (entry.status === "Queued Publish" && current.editorial !== "Ready") {
    return "Article is no longer editorially Ready";
  }
  if (phase === "built" && entry.status === "Queued Publish" && !entry.slug) {
    return "Missing article slug";
  }
  return null;
}
async function currentEntry(entry) {
  const page = await request(`/pages/${entry.id}`);
  return { id: entry.id, ...propertiesOf(page), contentHash: await fingerprint(entry.id) };
}
async function capture() {
  const entries = await queryQueued();
  await mkdir(".release", { recursive: true });
  await writeFile(recordPath, JSON.stringify(entries, null, 2));
  console.log(`Captured ${entries.length} queued editorial operation(s)`);
}
async function verifyBuilt() {
  const entries = JSON.parse(await readFile(recordPath, "utf8"));
  for (const entry of entries) {
    const current = await currentEntry(entry);
    const issue = evaluateReleaseEntry(entry, current, "built");
    if (issue) throw new Error(`Release changed during build (${entry.id}): ${issue}`);
    if (entry.status === "Queued Publish") {
      await access(resolve("dist/field-guide", entry.slug, "index.html"));
    } else {
      try {
        await access(resolve("dist/field-guide", entry.slug, "index.html"));
        throw new Error(`Queued unpublish still exists in output: ${entry.slug}`);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
  console.log(`Verified ${entries.length} queued operation(s) against build output`);
}
async function acknowledge() {
  const entries = JSON.parse(await readFile(recordPath, "utf8"));
  let skipped = 0;
  for (const entry of entries) {
    const current = await currentEntry(entry);
    const issue = evaluateReleaseEntry(entry, current, "deployed");
    if (issue) {
      console.warn(`Skipping ${entry.id}: ${issue}; manual review required`);
      skipped++;
      continue;
    }
    const next = entry.status === "Queued Publish" ? "Deployed" : "Unpublished";
    const properties = { "Publication status": { select: { name: next } } };
    if (next === "Deployed") {
      const date = new Date().toISOString();
      properties["Last deployed"] = { date: { start: date } };
      if (!entry.firstPublished) properties["First published"] = { date: { start: date } };
    }
    await request(`/pages/${entry.id}`, { method: "PATCH", body: JSON.stringify({ properties }) });
    console.log(`Confirmed ${entry.id}: ${entry.status} -> ${next}`);
  }
  if (skipped) throw new Error(`${skipped} article(s) changed after build; manual review required`);
}
const mode = process.argv[2];
if (mode && !["capture", "verify-built", "acknowledge"].includes(mode)) throw new Error("Unknown editorial release mode");
if (mode) {
  if (!token) throw new Error("NOTION_API_TOKEN is required");
  if (mode === "capture") await capture();
  if (mode === "verify-built") await verifyBuilt();
  if (mode === "acknowledge") await acknowledge();
}
