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


// Load descendants of list items so nested lists are not flattened or lost.
export async function getArticleBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks = await getNotionBlocks(pageId);
  const listTypes = new Set(["bulleted_list_item", "numbered_list_item", "to_do"]);
  async function loadChildren(items: NotionBlock[]): Promise<void> {
    for (const item of items) {
      if (listTypes.has(item.type) && item.has_children) {
        item.children = await getNotionBlocks(item.id);
        await loadChildren(item.children);
      }
    }
  }
  await loadChildren(blocks);
  return blocks;
}
