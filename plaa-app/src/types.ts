export type DocType = "hymnal" | "newsletter";

export type BlockType =
  | "heading"
  | "subheading"
  | "byline"
  | "paragraph"
  | "verse"
  | "chorus"
  | "pull_quote"
  | "callout"
  | "caption";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  subtext?: string;
}

export interface StyleProposal {
  name: string;
  vibe: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
}

export type ProjectStatus = "draft" | "in_review" | "approved";

export interface Project {
  id: string;
  userId: string;
  name: string;
  docType: DocType;
  trimSize: string;
  brandPrimary?: string;
  brandSecondary?: string;
  rawContent: string;
  blocks: Block[];
  styleProposals: StyleProposal[];
  selectedStyle: StyleProposal | null;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
}

export const FONT_OPTIONS = [
  "Playfair Display",
  "EB Garamond",
  "Lora",
  "Merriweather",
  "Inter",
  "Poppins",
  "Work Sans",
] as const;

export interface DocTypeConfig {
  label: string;
  description: string;
  defaultTrimSize: string;
  blockTypes: { value: BlockType; label: string }[];
  samplePlaceholder: string;
  headingTermPlural: string; // "Hymns" / "Articles"
}

export const DOC_TYPE_CONFIG: Record<DocType, DocTypeConfig> = {
  hymnal: {
    label: "Hymnal",
    description: "Verse & chorus structured worship collections",
    defaultTrimSize: "5.5x8.5in",
    headingTermPlural: "Hymns",
    blockTypes: [
      { value: "heading", label: "Hymn Title" },
      { value: "subheading", label: "Attribution (author / composer / meter)" },
      { value: "verse", label: "Verse" },
      { value: "chorus", label: "Chorus / Refrain" },
      { value: "caption", label: "Note" },
    ],
    samplePlaceholder:
      "Amazing Grace\nAuthor: John Newton · Meter: 8.6.8.6\n\n1. Amazing grace! How sweet the sound\nThat saved a wretch like me.\nI once was lost, but now am found,\nWas blind but now I see.\n\n2. 'Twas grace that taught my heart to fear,\nAnd grace my fears relieved.\nHow precious did that grace appear\nThe hour I first believed.",
  },
  newsletter: {
    label: "Newsletter / Magazine",
    description: "Article-flow layouts for recurring publications",
    defaultTrimSize: "8.5x11in",
    headingTermPlural: "Articles",
    blockTypes: [
      { value: "heading", label: "Headline" },
      { value: "byline", label: "Byline" },
      { value: "paragraph", label: "Body Paragraph" },
      { value: "pull_quote", label: "Pull Quote" },
      { value: "callout", label: "Callout / Sidebar" },
      { value: "caption", label: "Caption" },
    ],
    samplePlaceholder:
      "New Studio Opens Downtown\nBy Maria Chen\n\nAfter eighteen months of planning, the new community studio officially opened its doors this week, welcoming neighbors with open classes and a ribbon-cutting ceremony.\n\n\"This space belongs to everyone who walks through that door,\" said the studio's founder during the opening remarks.\n\nThe studio will offer rotating workshops, evening hours for working members, and a quarterly showcase open to the public.",
  },
};

export const REWRITE_INSTRUCTIONS = [
  { value: "condense", label: "Condense" },
  { value: "expand", label: "Expand" },
  { value: "devotional", label: "More Devotional" },
  { value: "formal", label: "More Formal" },
  { value: "conversational", label: "Conversational" },
  { value: "grammar", label: "Fix Grammar" },
] as const;
