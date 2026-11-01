
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
  const { getFieldGuideEntries, getPublishableEntries } =
    await server.ssrLoadModule("/src/lib/notion.ts");

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

  // test publication eligibility using simulated records.
  const testCases = [
    {
      publicationStatus: "Unpublished",
      editorialStatus: "Ready",
      expected: false,
    },
    {
      publicationStatus: "Queued Publish",
      editorialStatus: "Draft",
      expected: false,
    },
    {
      publicationStatus: "Queued Publish",
      editorialStatus: "Ready",
      expected: true,
    },
    {
      publicationStatus: "Published",
      editorialStatus: "Ready",
      expected: true,
    },
    {
      publicationStatus: "Published",
      editorialStatus: "Draft",
      expected: true,
    },
    {
      publicationStatus: "Queued Unpublish",
      editorialStatus: "Ready",
      expected: false,
    },
  ];

  for (const [index, testCase] of testCases.entries()) {
    const actual = getPublishableEntries([testCase]).length === 1;

    if (actual !== testCase.expected) {
      throw new Error(`publication eligibility test ${index + 1} failed`);
    }
  }

  console.log(
    `Publication eligibility tests passed: ${testCases.length}`
  );
} finally {
  await server.close();
}
