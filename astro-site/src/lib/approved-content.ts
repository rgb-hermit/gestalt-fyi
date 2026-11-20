import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { assertApprovedContent } from "../../scripts/approved-content.mjs";
import type { NotionBlock, NotionDomain, NotionFieldGuideEntry } from "./notion";

/**
 * Only a promoted, committed snapshot is eligible for an ordinary site build.
 * Never fall back to live Notion when the snapshot is missing.
 */
export interface ApprovedArticle extends Pick<NotionFieldGuideEntry,
  "notionPageId" | "title" | "slug" | "summary" | "domains" | "types"> {
  blocks: NotionBlock[];
}

export interface ApprovedSnapshot {
  schemaVersion: 1;
  releaseId: string;
  domains: NotionDomain[];
  articles: ApprovedArticle[];
}

// Astro bundles this module into dist/.prerender; module-relative file URLs
// would point inside the build output rather than the checked-in source.
const snapshotPath = resolve(process.cwd(), "src/content/field-guide-approved.json");

export async function readApprovedSnapshot(): Promise<ApprovedSnapshot> {
  let source: string;
  try {
    source = await readFile(snapshotPath, "utf8");
  } catch (error) {
    throw new Error(
      "No approved Field Guide snapshot is available. Run the controlled initial editorial snapshot bootstrap before enabling snapshot builds.",
      { cause: error },
    );
  }
  return assertApprovedContent(JSON.parse(source)) as ApprovedSnapshot;
}

export async function getApprovedEntries(): Promise<ApprovedArticle[]> {
  return (await readApprovedSnapshot()).articles;
}

export async function getApprovedDomains(): Promise<NotionDomain[]> {
  return (await readApprovedSnapshot()).domains;
}

export async function getApprovedArticleBlocks(notionPageId: string): Promise<NotionBlock[]> {
  const article = (await readApprovedSnapshot()).articles.find(
    (entry) => entry.notionPageId === notionPageId,
  );
  if (!article) throw new Error(`Article not in approved snapshot: ${notionPageId}`);
  return article.blocks;
}
