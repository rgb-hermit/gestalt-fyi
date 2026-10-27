
export interface FieldGuideSection {
  id: string;
  heading: string;
  content: string;
  subsections?: {
    id: string;
    heading: string;
    content: string;
  }[];
}

export interface FieldGuideEntry {
  slug: string;
  notionPageId?: string;
  title: string;
  summary: string;
  domains: string[];
  editorialStatus: string;
  publicationStatus: string;
  sections?: FieldGuideSection[];
}

export const fieldGuideEntries: FieldGuideEntry[] = [
  {
    slug: "accessibility",
    notionPageId: "3fdbf19d054181209c7ae9a8748763c9",
    title: "Accessibility",
    summary:
      "Designing products, services and environments for equitable access, addressing barriers for people with disabilities and a wider range of access needs.",
    domains: ["Accessibility & Inclusion", "UX & HCI"],
    editorialStatus: "In review",
    publicationStatus: "Unpublished",

sections: [
  {
  id: "overview",
  heading: "Overview",
  content: "",
  subsections: [
    {
      id: "the-problem-with-the-default-user",
      heading: "The problem with the 'default' user",
      content: "",
    },
    {
      id: "access-needs-change",
      heading: "Access needs change",
      content: "",
    },
  ],
},
  { id: "in-practice", heading: "In practice", content: "" },
  { id: "considerations", heading: "Considerations", content: "" },
],

  },
];

// Internal content-rendering fixture: only routable during local Astro development.
// Never include in production builds, public indexes or relationship mapping.
if (import.meta.env.DEV) {
  fieldGuideEntries.push({
    slug: "article-component-test",
    notionPageId: "406bf19d0541819b8293ccfbc70ce5a9",
    title: "Article Component Test",
    summary: "Internal Notion component-rendering and article styling fixture.",
    domains: [],
    editorialStatus: "Backlog",
    publicationStatus: "Unpublished",
  });
}
