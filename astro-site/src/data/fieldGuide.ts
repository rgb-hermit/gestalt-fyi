
export interface FieldGuideSection {
  id: string;
  heading: string;
  content: string;
}

export interface FieldGuideEntry {
  slug: string;
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
    title: "Accessibility",
    summary:
      "Designing products, services and environments for equitable access, addressing barriers for people with disabilities and a wider range of access needs.",
    domains: ["Accessibility & Inclusion", "UX & HCI"],
    editorialStatus: "In review",
    publicationStatus: "Unpublished",

sections: [
  { id: "definition", heading: "Definition", content: "" },
  { id: "why-it-matters", heading: "Why it matters", content: "" },
  { id: "in-practice", heading: "In practice", content: "" },
  { id: "examples", heading: "Examples", content: "" },
  {
    id: "considerations-limitations",
    heading: "Considerations & limitations",
    content: "",
  },
  {
    id: "evidence-further-reading",
    heading: "Evidence & further reading",
    content: "",
  },
],

  },
];
