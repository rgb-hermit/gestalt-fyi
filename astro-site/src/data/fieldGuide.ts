
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
