/**
 * Portable, immutable Field Guide content format.
 * This module deliberately never reads Notion or environment credentials.
 */
export function validateApprovedContent(snapshot) {
  const errors = [];
  if (!snapshot || snapshot.schemaVersion !== 1) {
    return ["Unsupported or missing approved content schemaVersion"];
  }
  if (!Array.isArray(snapshot.domains) || !Array.isArray(snapshot.articles)) {
    return ["Approved content must include domains and articles arrays"];
  }
  if (!snapshot.releaseId || typeof snapshot.releaseId !== "string") {
    errors.push("Approved content requires a releaseId");
  }
  const domainNames = new Set(snapshot.domains.map((domain) => domain?.name));
  const slugs = new Set();
  const ids = new Set();
  for (const article of snapshot.articles) {
    if (!article || typeof article !== "object") {
      errors.push("Invalid article record");
      continue;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug ?? "")) {
      errors.push(`Invalid article slug: ${article.slug}`);
    }
    if (slugs.has(article.slug)) errors.push(`Duplicate article slug: ${article.slug}`);
    slugs.add(article.slug);
    if (!article.notionPageId || ids.has(article.notionPageId)) {
      errors.push(`Missing or duplicate Notion page ID: ${article.notionPageId}`);
    }
    ids.add(article.notionPageId);
    if (typeof article.title !== "string" || !article.title.trim()) {
      errors.push(`Missing article title: ${article.slug}`);
    }
    if (typeof article.summary !== "string" || !article.summary.trim()) {
      errors.push(`Missing article summary: ${article.slug}`);
    }
    if (!Array.isArray(article.domains) || !Array.isArray(article.types)) {
      errors.push(`Missing classification arrays: ${article.slug}`);
    }
    if (!Array.isArray(article.blocks)) {
      errors.push(`Missing article blocks: ${article.slug}`);
    } else {
      // signed notion-hosted file links expire; snapshot media must be durable.
      const inspect = (blocks) => {
        for (const block of blocks) {
          if (block.type === "image" && block.image?.type === "file") {
            errors.push(`Expiring notion image in article: ${article.slug}`);
          }
          if (Array.isArray(block.children)) inspect(block.children);
        }
      };
      inspect(article.blocks);
    }
    if (Array.isArray(article.domains)) {
      for (const domain of article.domains) {
        if (!domainNames.has(domain)) errors.push(`Unknown domain "${domain}" in article: ${article.slug}`);
      }
    }
  }
  for (const domain of snapshot.domains) {
    if (!domain || typeof domain.name !== "string" || typeof domain.description !== "string") {
      errors.push("Invalid domain record");
    }
  }
  return errors;
}

export function assertApprovedContent(snapshot) {
  const errors = validateApprovedContent(snapshot);
  if (errors.length) throw new Error(`Approved content validation failed:\n${errors.join("\n")}`);
  return snapshot;
}

/**
 * Apply only explicitly captured editorial operations to an approved baseline.
 * Other live Notion edits must never leak into an ordinary site build.
 */
export function applyEditorialOperations(baseline, operations, candidateArticles, domains) {
  assertApprovedContent(baseline);
  const articles = new Map(baseline.articles.map((article) => [article.notionPageId, article]));
  const candidates = new Map(candidateArticles.map((article) => [article.notionPageId, article]));
  for (const operation of operations) {
    if (operation.status === "Queued Unpublish") {
      articles.delete(operation.id);
    } else if (operation.status === "Queued Publish") {
      const candidate = candidates.get(operation.id);
      if (!candidate) throw new Error(`Missing queued article data: ${operation.id}`);
      articles.set(operation.id, candidate);
    } else {
      throw new Error(`Unsupported editorial operation: ${operation.status}`);
    }
  }
  return assertApprovedContent({
    schemaVersion: 1,
    releaseId: "candidate",
    domains: domains ?? baseline.domains,
    articles: [...articles.values()].sort((a, b) => a.slug.localeCompare(b.slug, "en")),
  });
}
