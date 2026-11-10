import { createHash } from "node:crypto";

/**
 * A content fingerprint, not an editorial version number.
 *
 * Only fields used to render the article belong in the input. Callers must
 * exclude Notion timestamps, publication statuses and expiring file URLs.
 */
export function fingerprintArticle(content: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(sortObjectKeys(content)))
    .digest("hex");
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right, "en"))
        .map(([key, item]) => [key, sortObjectKeys(item)]),
    );
  }

  return value;
}

export interface ArticleVersion {
  notionPageId: string;
  slug: string;
  contentHash: string;
}

export interface ReleaseManifest {
  schemaVersion: 1;
  articles: ArticleVersion[];
}

/**
 * Reject malformed release metadata before it can affect production routing.
 * The manifest records identity only; immutable article content snapshots
 * must be stored separately before ordinary deployments can be isolated.
 */
export function parseReleaseManifest(value: unknown): ReleaseManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid release manifest.");
  }

  const manifest = value as Record<string, unknown>;
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.articles)) {
    throw new Error("Unsupported release manifest schema.");
  }

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const articles: ArticleVersion[] = [];

  for (const candidate of manifest.articles) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      throw new Error("Invalid release manifest article.");
    }

    const article = candidate as Record<string, unknown>;
    if (
      typeof article.notionPageId !== "string" ||
      !article.notionPageId.trim() ||
      typeof article.slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) ||
      typeof article.contentHash !== "string" ||
      !/^[a-f0-9]{64}$/.test(article.contentHash)
    ) {
      throw new Error("Invalid release manifest article metadata.");
    }

    if (ids.has(article.notionPageId) || slugs.has(article.slug)) {
      throw new Error("Duplicate article identity in release manifest.");
    }

    ids.add(article.notionPageId);
    slugs.add(article.slug);
    articles.push({
      notionPageId: article.notionPageId,
      slug: article.slug,
      contentHash: article.contentHash,
    });
  }

  return { schemaVersion: 1, articles };
}
