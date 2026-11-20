import { writeFile, mkdir } from "node:fs/promises";
import { assertApprovedContent } from "./approved-content.mjs";

const token = process.env.NOTION_API_TOKEN;
if (!token) throw new Error("NOTION_API_TOKEN is required to capture the initial snapshot");
const databaseId = "052459fcf9df4a0985d0a0e68375c93b";
const domainsDatabaseId = "10af85e3a37844569dfffe2db04c6400";

async function notion(path, body) {
  const response = await fetch(`https://api.notion.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(`Notion ${path}: ${response.status} ${await response.text()}`);
  return response.json();
}
async function allPages(id) {
  const result = [];
  let cursor;
  do {
    const page = await notion(`databases/${id}/query`, {
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    result.push(...page.results);
    cursor = page.next_cursor;
  } while (cursor);
  return result;
}
async function allBlocks(id) {
  const result = [];
  let cursor;
  do {
    const page = await notion(`blocks/${id}/children?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ""}`);
    for (const block of page.results) {
      if (block.has_children) block.children = await allBlocks(block.id);
      result.push(block);
    }
    cursor = page.next_cursor;
  } while (cursor);
  return result;
}
const text = (property) => (property?.rich_text ?? property?.title ?? []).map((item) => item.plain_text).join("");
const selected = (property) => property?.select?.name ?? "";
const multi = (property) => (property?.multi_select ?? []).map((item) => item.name);

const [pages, domainPages] = await Promise.all([allPages(databaseId), allPages(domainsDatabaseId)]);
const domains = domainPages.map((page) => ({
  id: page.id,
  name: text(page.properties.Name ?? page.properties.Domain),
  slug: text(page.properties.Slug),
  description: text(page.properties.Description),
}));
const articles = [];
for (const page of pages) {
  const props = page.properties;
  const status = selected(props["Publication status"]);
  if (!["Published", "Deployed"].includes(status)) continue;
  articles.push({
    notionPageId: page.id,
    title: text(props.Name),
    slug: text(props.Slug),
    summary: text(props.Summary),
    domains: multi(props.Domains),
    types: multi(props.Type),
    blocks: await allBlocks(page.id),
  });
}
const snapshot = assertApprovedContent({
  schemaVersion: 1,
  releaseId: "initial-baseline-candidate",
  domains,
  articles,
});
await mkdir(".release", { recursive: true });
await writeFile(".release/initial-baseline-candidate.json", JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Captured ${articles.length} articles and ${domains.length} domains to .release/initial-baseline-candidate.json`);
console.log("Candidate only: verify against live publication before approving or committing.");
