/**
 * Pure release planning for Field Guide articles.
 *
 * This module does not read or write Notion, trigger deployments, or mutate
 * the current production manifest. Those operations must be coordinated by
 * the release workflow after a successful production deployment.
 */

export type PublicationStatus =
  | "Unpublished"
  | "Queued Publish"
  | "Deployed"
  | "Published"
  | "Queued Unpublish";

export interface ArticleReleaseInput {
  notionPageId: string;
  slug: string;
  editorialStatus: string | null;
  publicationStatus: string | null;
  contentHash: string;
}

export interface DeployedArticle {
  notionPageId: string;
  slug: string;
  contentHash: string;
}

export interface ReleasePlan {
  publish: DeployedArticle[];
  remove: DeployedArticle[];
  retain: DeployedArticle[];
  errors: string[];
}

/**
 * Plan an explicitly requested editorial release against the last confirmed
 * production manifest. No operation is performed by this function.
 *
 * An already-deployed article stays in the release unless removal is queued.
 * Queued changes are not assumed live until the deployment is confirmed.
 */
export function planEditorialRelease(
  entries: ArticleReleaseInput[],
  deployed: DeployedArticle[],
): ReleasePlan {
  const errors: string[] = [];
  const publish: DeployedArticle[] = [];
  const remove: DeployedArticle[] = [];
  const retain: DeployedArticle[] = [];

  const byId = new Map<string, ArticleReleaseInput>();
  const bySlug = new Map<string, string>();
  const deployedById = new Map<string, DeployedArticle>();

  for (const article of deployed) {
    if (deployedById.has(article.notionPageId)) {
      errors.push(`Duplicate deployed page ID: ${article.notionPageId}.`);
    }
    deployedById.set(article.notionPageId, article);
  }

  for (const entry of entries) {
    if (byId.has(entry.notionPageId)) {
      errors.push(`Duplicate Notion page ID: ${entry.notionPageId}.`);
    }
    byId.set(entry.notionPageId, entry);

    const previous = bySlug.get(entry.slug);
    if (previous && previous !== entry.notionPageId) {
      errors.push(`Duplicate slug: ${entry.slug}.`);
    }
    bySlug.set(entry.slug, entry.notionPageId);
  }

  for (const entry of entries) {
    const existing = deployedById.get(entry.notionPageId);
    const status = entry.publicationStatus;

    if (status === "Queued Unpublish") {
      if (existing) remove.push(existing);
      continue;
    }

    if (status === "Queued Publish") {
      if (entry.editorialStatus !== "Ready") {
        errors.push(`Queued article is not editorially Ready: ${entry.notionPageId}.`);
        continue;
      }
      if (!entry.contentHash || !entry.slug) {
        errors.push(`Queued article has incomplete release metadata: ${entry.notionPageId}.`);
        continue;
      }
      publish.push({
        notionPageId: entry.notionPageId,
        slug: entry.slug,
        contentHash: entry.contentHash,
      });
      continue;
    }

    if (existing) {
      // Keep the last deployed version, not a newer unqueued Notion revision.
      retain.push(existing);
    } else if (status === "Deployed" || status === "Published") {
      errors.push(`Article is marked ${status} but has no deployed record: ${entry.notionPageId}.`);
    }
  }

  for (const article of deployed) {
    if (!byId.has(article.notionPageId)) {
      // A missing Notion record is not permission to remove a live page.
      retain.push(article);
    }
  }

  const next = [...retain, ...publish];
  const finalSlugs = new Map<string, string>();
  for (const article of next) {
    const prior = finalSlugs.get(article.slug);
    if (prior && prior !== article.notionPageId) {
      errors.push(`Release would create duplicate slug: ${article.slug}.`);
    }
    finalSlugs.set(article.slug, article.notionPageId);
  }

  return { publish, remove, retain, errors };
}
