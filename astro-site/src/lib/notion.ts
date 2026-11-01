const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  children?: NotionBlock[];
  [key: string]: any;
}

export async function getNotionBlocks(
  pageId: string
): Promise<NotionBlock[]> {
  const token = import.meta.env.NOTION_API_TOKEN;

  if (!token) {
    throw new Error("NOTION_API_TOKEN is not configured");
  }

  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(
      `${NOTION_API_URL}/blocks/${pageId}/children`
    );

    url.searchParams.set("page_size", "100");

    if (cursor) {
      url.searchParams.set("start_cursor", cursor);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Notion API request failed: ${response.status}`
      );
    }

    const data = await response.json();

    blocks.push(...data.results);
    cursor = data.next_cursor ?? undefined;
  } while (cursor);

  return blocks;
}


// load descendants of list items so nested lists are not flattened or lost.
export async function getArticleBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks = await getNotionBlocks(pageId);
  const childBlockTypes = new Set([
  "bulleted_list_item",
  "numbered_list_item",
  "to_do",
  "table",
]);
  async function loadChildren(items: NotionBlock[]): Promise<void> {
    for (const item of items) {
      if (childBlockTypes.has(item.type) && item.has_children) {
        item.children = await getNotionBlocks(item.id);
        await loadChildren(item.children);
      }
    }
  }
  await loadChildren(blocks);
  return blocks;
}


const FIELD_GUIDE_DATABASE_ID = "052459fcf9df4a0985d0a0e68375c93b";

interface NotionRichText {
  plain_text: string;
}

interface NotionProperty {
  type: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  select?: { name: string } | null;
  multi_select?: { name: string }[];
}

interface NotionDatabasePage {
  id: string;
  properties: Record<string, NotionProperty>;
}

export interface NotionFieldGuideEntry {
  notionPageId: string;
  title: string;
  slug: string;
  summary: string;
  domains: string[];
  types: string[];
  editorialStatus: string | null;
  publicationStatus: string | null;
  launchPriority: string | null;
}

function plainText(items: NotionRichText[] = []): string {
  return items.map((item) => item.plain_text).join("");
}

export async function getFieldGuideEntries(): Promise<NotionFieldGuideEntry[]> {
  const token = import.meta.env.NOTION_API_TOKEN;

  if (!token) {
    throw new Error("NOTION_API_TOKEN is not configured");
  }

  const pages: NotionDatabasePage[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetch(
      `${NOTION_API_URL}/databases/${FIELD_GUIDE_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Notion database query failed: ${response.status}`
      );
    }

    const data = await response.json();

    pages.push(...data.results);
    cursor = data.next_cursor ?? undefined;
  } while (cursor);

  return pages.map((page) => {
    const properties = page.properties;

    return {
      notionPageId: page.id,
      title: plainText(properties["Name"]?.title),
      slug: plainText(properties["Slug"]?.rich_text),
      summary: plainText(properties["Summary"]?.rich_text),
      domains: (properties["Domains"]?.multi_select ?? []).map(
        (option) => option.name
      ),
      // During migration, prefer the final multi-select property when present.
      // Never read the legacy single-select "Type" as a classification array.
      types: (
        properties["Type"]?.type === "multi_select"
          ? properties["Type"].multi_select
          : properties["Type Revision"]?.multi_select
      )?.map((option) => option.name) ?? [],
      editorialStatus:
        properties["Editorial status"]?.select?.name ?? null,
      publicationStatus:
        properties["Publication status"]?.select?.name ?? null,
      launchPriority:
        properties["Launch priority"]?.select?.name ?? null,
    };
  });
}


export function getPublishableEntries(
  entries: NotionFieldGuideEntry[]
): NotionFieldGuideEntry[] {
  return entries.filter((entry) => {
    // preserve articles that are already published.
    if (entry.publicationStatus === "Published") {
      return true;
    }

    // only publish queued articles once editorially ready.
    return (
      entry.publicationStatus === "Queued Publish" &&
      entry.editorialStatus === "Ready"
    );
  });
}
