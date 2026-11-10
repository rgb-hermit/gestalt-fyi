/**
 * Decide which queued publication records can safely be acknowledged after
 * GitHub Pages reports a successful production deployment.
 *
 * This is a pure guard: it never calls Notion or updates a page.
 */
export interface QueuedArticleVersion {
  notionPageId: string;
  slug: string;
  contentHash: string;
  publicationStatus: string | null;
}

export interface ReleaseConfirmation {
  confirmed: string[];
  skipped: { notionPageId: string; reason: string }[];
}

export function confirmDeployedArticles(
  deployedSuccessfully: boolean,
  built: QueuedArticleVersion[],
  current: QueuedArticleVersion[],
): ReleaseConfirmation {
  const confirmed: string[] = [];
  const skipped: ReleaseConfirmation["skipped"] = [];
  const currentById = new Map(current.map((entry) => [entry.notionPageId, entry]));

  if (currentById.size !== current.length) {
    throw new Error("Duplicate Notion page IDs in current release records.");
  }
  if (new Set(built.map((entry) => entry.notionPageId)).size !== built.length) {
    throw new Error("Duplicate Notion page IDs in built release records.");
  }

  for (const entry of built) {
    let reason: string | undefined;
    const latest = currentById.get(entry.notionPageId);

    if (!deployedSuccessfully) {
      reason = "Production deployment not confirmed.";
    } else if (entry.publicationStatus !== "Queued Publish") {
      reason = "Article was not queued in the built release.";
    } else if (!latest || latest.publicationStatus !== "Queued Publish") {
      reason = "Article is no longer queued in Notion.";
    } else if (!entry.contentHash || !latest.contentHash) {
      reason = "Missing article fingerprint.";
    } else if (entry.slug !== latest.slug || entry.contentHash !== latest.contentHash) {
      reason = "Article changed since the build.";
    }

    if (reason) skipped.push({ notionPageId: entry.notionPageId, reason });
    else confirmed.push(entry.notionPageId);
  }

  return { confirmed, skipped };
}
