import { writeFile } from "node:fs/promises";

const token = process.env.NOTION_SITE_COPY_TOKEN;
if (!token) throw new Error("NOTION_SITE_COPY_TOKEN is missing.");

const [pageLink, page = "about"] = process.argv.slice(2);
if (page !== "home" && page !== "about") {
  throw new Error("Choose home or about.");
}
if (!pageLink) throw new Error("Pass the Notion page link.");

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
if (hasMore) throw new Error("The page exceeds the 100-block import limit.");

const plainText = (block) =>
  block[block.type].rich_text.map((part) => part.plain_text).join("");

const paragraphs = results
  .filter((block) => block.type === "paragraph")
  .map(plainText)
  .filter((paragraph) => paragraph.trim());

if (paragraphs.length === 0) {
  throw new Error("No paragraphs found. No copy was written.");
}

let heading = "About";
let filename = "about-draft.json";

if (page === "home") {
  const headingBlock = results.find((block) => block.type === "heading_1");
  heading = headingBlock ? plainText(headingBlock).trim() : "";
  if (!heading) throw new Error("Home needs a Heading 1 block in Notion.");
  filename = "home-copy.json";
}

const output = new URL(`../src/content/${filename}`, import.meta.url);
await writeFile(output, JSON.stringify({ heading, paragraphs }, null, 2) + "\n");
console.log(`Updated ${filename} from Notion.`);