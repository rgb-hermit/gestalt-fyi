const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
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
