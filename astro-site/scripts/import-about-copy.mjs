import { writeFile } from "node:fs/promises";

const token = process.env.NOTION_SITE_COPY_TOKEN;
if (!token) throw new Error("NOTION_SITE_COPY_TOKEN is missing.");

const pageLink = process.argv[2];
if (!pageLink) throw new Error("Pass the Notion About page link.");

const path = new URL(pageLink).pathname.replace(/\/$/, "");
const pageId = path.match(/[a-f0-9]{32}$/i)?.[0];
if (!pageId) throw new Error("Could not find a page ID in the Notion link.");

const response = await fetch(
  `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
    },
  },
);

if (!response.ok) throw new Error(`Notion returned HTTP ${response.status}.`);

const { results, has_more: hasMore } = await response.json();
if (hasMore) throw new Error("The draft exceeds the 100-block pilot limit.");

const paragraphs = results
  .filter((block) => block.type === "paragraph")
  .map((block) => block.paragraph.rich_text.map((part) => part.plain_text).join(""))
  .filter((paragraph) => paragraph.trim());

if (paragraphs.length === 0) {
  throw new Error("No paragraphs found. The draft file was left as it was.");
}

const draft = { heading: "About", paragraphs };
const output = new URL("../src/content/about-draft.json", import.meta.url);
await writeFile(output, JSON.stringify(draft, null, 2) + "\n");
console.log("Updated about-draft.json from Notion.");