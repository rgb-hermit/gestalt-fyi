
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  envDir: process.cwd(),
  define: {
    "import.meta.env.NOTION_API_TOKEN": JSON.stringify(
      process.env.NOTION_API_TOKEN
    ),
  },
});

try {
  const { getFieldGuideEntries } = await server.ssrLoadModule(
    "/src/lib/notion.ts"
  );

  const entries = await getFieldGuideEntries();

  console.log(`Discovered ${entries.length} Field Guide records`);

  const counts = (property) =>
    Object.fromEntries(
      [...new Set(entries.map((entry) => entry[property]))].map(
        (value) => [
          value ?? "(empty)",
          entries.filter((entry) => entry[property] === value).length,
        ]
      )
    );

  console.log(
  "Types:",
  Object.fromEntries(
    [...new Set(entries.flatMap((entry) => entry.types))].map((type) => [
      type,
      entries.filter((entry) => entry.types.includes(type)).length,
    ])
  )
);
  console.log("Publication statuses:", counts("publicationStatus"));
  console.log("Launch priorities:", counts("launchPriority"));
  console.log(
    "Records missing a title or slug:",
    entries.filter((entry) => !entry.title || !entry.slug).length
  );
} finally {
  await server.close();
}
