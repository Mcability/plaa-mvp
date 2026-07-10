import { router, json, error, requireAuth, db, ai } from "@appdeploy/sdk";

const BLOCK_TYPES = [
  "heading",
  "subheading",
  "byline",
  "paragraph",
  "verse",
  "chorus",
  "pull_quote",
  "callout",
  "caption",
] as const;

const FONT_OPTIONS = [
  "Playfair Display",
  "EB Garamond",
  "Lora",
  "Merriweather",
  "Inter",
  "Poppins",
  "Work Sans",
] as const;

const DOC_TYPES = ["hymnal", "newsletter"] as const;

interface Block {
  id: string;
  type: (typeof BLOCK_TYPES)[number];
  text: string;
  subtext?: string;
}

interface StyleProposal {
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

interface ProjectRecord {
  userId: string;
  name: string;
  docType: (typeof DOC_TYPES)[number];
  trimSize: string;
  brandPrimary?: string;
  brandSecondary?: string;
  rawContent: string;
  blocks: Block[];
  styleProposals: StyleProposal[];
  selectedStyle: StyleProposal | null;
  status: "draft" | "in_review" | "approved";
  createdAt: number;
  updatedAt: number;
}

const ALLOWED_UPDATE_FIELDS = [
  "name",
  "docType",
  "trimSize",
  "brandPrimary",
  "brandSecondary",
  "rawContent",
  "blocks",
  "styleProposals",
  "selectedStyle",
  "status",
] as const;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

async function getOwnedProject(id: string, userId: string) {
  const [record] = await db.get<ProjectRecord>("projects", [id]);
  if (!record || record.userId !== userId) return null;
  return record;
}

const BLOCK_SCHEMA = {
  type: "object",
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: BLOCK_TYPES as unknown as string[] },
          text: { type: "string" },
          subtext: { type: "string" },
        },
        required: ["type", "text"],
      },
    },
  },
  required: ["blocks"],
};

const STYLE_SCHEMA = {
  type: "object",
  properties: {
    proposals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          vibe: { type: "string" },
          primary: { type: "string" },
          secondary: { type: "string" },
          accent: { type: "string" },
          background: { type: "string" },
          textColor: { type: "string" },
          headingFont: { type: "string", enum: FONT_OPTIONS as unknown as string[] },
          bodyFont: { type: "string", enum: FONT_OPTIONS as unknown as string[] },
        },
        required: ["name", "vibe", "primary", "secondary", "accent", "background", "textColor", "headingFont", "bodyFont"],
      },
    },
  },
  required: ["proposals"],
};

const REWRITE_SCHEMA = {
  type: "object",
  properties: {
    text: { type: "string" },
  },
  required: ["text"],
};

export const handler = router({
  "GET /api/_healthcheck": [async () => json({ message: "Success" })],

  "POST /api/projects": [
    requireAuth(),
    async (ctx) => {
      const body = ctx.body as Partial<ProjectRecord>;
      const name = (body.name || "").toString().trim();
      if (!name) return error("Project name is required", 400);
      const docType = DOC_TYPES.includes(body.docType as any) ? body.docType! : "hymnal";
      const now = Date.now();
      const record: ProjectRecord = {
        userId: ctx.user!.userId,
        name,
        docType,
        trimSize: (body.trimSize || "5.5x8.5in").toString(),
        brandPrimary: body.brandPrimary,
        brandSecondary: body.brandSecondary,
        rawContent: "",
        blocks: [],
        styleProposals: [],
        selectedStyle: null,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      };
      const [id] = await db.add("projects", [record as unknown as Record<string, unknown>]);
      if (!id) return error("Failed to create project", 500);
      return json({ project: { id, ...record } });
    },
  ],

  "GET /api/projects": [
    requireAuth(),
    async (ctx) => {
      const { items } = await db.list<ProjectRecord>("projects", { filter: { userId: ctx.user!.userId } });
      const projects = items.sort((a, b) => b.updatedAt - a.updatedAt);
      return json({ projects });
    },
  ],

  "GET /api/projects/:id": [
    requireAuth(),
    async (ctx) => {
      const project = await getOwnedProject(ctx.params.id, ctx.user!.userId);
      if (!project) return error("Project not found", 404);
      return json({ project: { id: ctx.params.id, ...project } });
    },
  ],

  "PUT /api/projects/:id": [
    requireAuth(),
    async (ctx) => {
      const existing = await getOwnedProject(ctx.params.id, ctx.user!.userId);
      if (!existing) return error("Project not found", 404);
      const body = (ctx.body || {}) as Partial<ProjectRecord>;
      const patch: Record<string, unknown> = {};
      for (const field of ALLOWED_UPDATE_FIELDS) {
        if (field in body) patch[field] = (body as Record<string, unknown>)[field];
      }
      const updated: ProjectRecord = { ...existing, ...patch, updatedAt: Date.now() } as ProjectRecord;
      const [ok] = await db.update("projects", [{ id: ctx.params.id, record: updated as unknown as Record<string, unknown> }]);
      if (!ok) return error("Failed to update project", 500);
      return json({ project: { id: ctx.params.id, ...updated } });
    },
  ],

  "DELETE /api/projects/:id": [
    requireAuth(),
    async (ctx) => {
      const existing = await getOwnedProject(ctx.params.id, ctx.user!.userId);
      if (!existing) return error("Project not found", 404);
      const [ok] = await db.delete("projects", [ctx.params.id]);
      if (!ok) return error("Failed to delete project", 500);
      return json({ deleted: true });
    },
  ],

  "POST /api/projects/:id/structure": [
    requireAuth(),
    async (ctx) => {
      const existing = await getOwnedProject(ctx.params.id, ctx.user!.userId);
      if (!existing) return error("Project not found", 404);
      const body = ctx.body as { rawContent?: string };
      const rawContent = (body.rawContent || "").toString();
      if (!rawContent.trim()) return error("rawContent is required", 400);

      const docTypeGuidance =
        existing.docType === "hymnal"
          ? "This is a HYMNAL. Identify the hymn title as a 'heading' block. Author/composer/meter info becomes a 'subheading' block with the info in subtext. Each numbered verse becomes its own 'verse' block (strip the leading number, keep the line breaks in 'text'). Any repeated chorus/refrain becomes a 'chorus' block. If multiple hymns are present, repeat this pattern in sequence."
          : "This is a NEWSLETTER/MAGAZINE article. The headline becomes a 'heading' block. The author line becomes a 'byline' block (author name in text, optional extra info in subtext). Body paragraphs become separate 'paragraph' blocks. A standout sentence can become a 'pull_quote' block. If multiple articles are present, repeat this pattern in sequence.";

      let result;
      try {
        result = await ai.generate({
          system:
            "You are the Content Structuring Agent inside a publishing layout tool. You convert raw manuscript text into a structured array of layout blocks. Always respond with valid structured output matching the schema. Preserve the author's original wording in 'text' fields - do not rewrite or summarize content.",
          prompt: `${docTypeGuidance}\n\nRAW CONTENT:\n"""\n${rawContent}\n"""`,
          schema: BLOCK_SCHEMA,
          thinkingMode: "FAST",
        });
      } catch {
        return error("AI structuring failed. Please try again.", 502);
      }

      let parsed: { blocks: Array<Omit<Block, "id">> };
      try {
        parsed = JSON.parse(result.text);
      } catch {
        return error("AI returned an unreadable response. Please try again.", 502);
      }

      const blocks: Block[] = (parsed.blocks || []).map((b) => ({
        id: uid(),
        type: BLOCK_TYPES.includes(b.type as any) ? b.type : "paragraph",
        text: (b.text || "").toString(),
        subtext: b.subtext ? b.subtext.toString() : undefined,
      }));

      const updated: ProjectRecord = { ...existing, rawContent, blocks, updatedAt: Date.now() };
      const [ok] = await db.update("projects", [{ id: ctx.params.id, record: updated as unknown as Record<string, unknown> }]);
      if (!ok) return error("Failed to save structured content", 500);
      return json({ project: { id: ctx.params.id, ...updated } });
    },
  ],

  "POST /api/projects/:id/styles": [
    requireAuth(),
    async (ctx) => {
      const existing = await getOwnedProject(ctx.params.id, ctx.user!.userId);
      if (!existing) return error("Project not found", 404);
      const body = ctx.body as { brandPrimary?: string; brandSecondary?: string };
      const brandPrimary = body.brandPrimary || existing.brandPrimary;
      const brandSecondary = body.brandSecondary || existing.brandSecondary;

      const vibe =
        existing.docType === "hymnal"
          ? "reverent, warm, timeless worship-collection design (think classic hymnals: navy/cream/gold, deep burgundy/ivory, or sage/parchment palettes)"
          : "editorial, energetic newsletter/magazine design with clear hierarchy and modern color pairings";

      const brandNote = brandPrimary
        ? `The user's brand colors are primary=${brandPrimary}${brandSecondary ? `, secondary=${brandSecondary}` : ""}. At least one proposal should meaningfully incorporate these brand colors.`
        : "No brand colors were specified - choose elegant, print-friendly palettes appropriate to the vibe.";

      let result;
      try {
        result = await ai.generate({
          system:
            "You are the Layout Designer Agent inside a publishing tool. You propose exactly 3 distinct visual style directions (palette + typography) for a print publication. All colors must be valid 6-digit hex codes with strong contrast between background and textColor (WCAG AA). Heading and body fonts must be different from each other within each proposal.",
          prompt: `Document type vibe: ${vibe}. ${brandNote} Propose 3 visually distinct, named style directions.`,
          schema: STYLE_SCHEMA,
          thinkingMode: "FAST",
        });
      } catch {
        return error("AI style generation failed. Please try again.", 502);
      }

      let parsed: { proposals: StyleProposal[] };
      try {
        parsed = JSON.parse(result.text);
      } catch {
        return error("AI returned an unreadable response. Please try again.", 502);
      }

      const proposals = (parsed.proposals || []).slice(0, 3);
      const updated: ProjectRecord = { ...existing, styleProposals: proposals, updatedAt: Date.now() };
      const [ok] = await db.update("projects", [{ id: ctx.params.id, record: updated as unknown as Record<string, unknown> }]);
      if (!ok) return error("Failed to save style proposals", 500);
      return json({ project: { id: ctx.params.id, ...updated } });
    },
  ],

  "POST /api/projects/:id/rewrite": [
    requireAuth(),
    async (ctx) => {
      const existing = await getOwnedProject(ctx.params.id, ctx.user!.userId);
      if (!existing) return error("Project not found", 404);
      const body = ctx.body as { text?: string; instruction?: string; docType?: string };
      const text = (body.text || "").toString();
      const instruction = (body.instruction || "condense").toString();
      if (!text.trim()) return error("text is required", 400);

      const instructionMap: Record<string, string> = {
        condense: "Condense this text to be noticeably shorter while preserving its core meaning.",
        expand: "Expand this text with one or two additional sentences of relevant detail, in the same voice.",
        devotional: "Rewrite this text with a warmer, more devotional and reverent tone, suitable for worship content.",
        formal: "Rewrite this text in a more formal, polished tone suitable for an official publication.",
        conversational: "Rewrite this text in a more conversational, approachable tone.",
        grammar: "Fix any grammar, spelling, and punctuation issues without otherwise changing the wording or meaning.",
      };

      let result;
      try {
        result = await ai.generate({
          system: "You are the Rewrite Agent inside a publishing tool. You rewrite a single block of text per the given instruction. Respond with only the rewritten text, no commentary.",
          prompt: `Instruction: ${instructionMap[instruction] || instructionMap.condense}\n\nOriginal text:\n"""\n${text}\n"""`,
          schema: REWRITE_SCHEMA,
          thinkingMode: "FAST",
        });
      } catch {
        return error("AI rewrite failed. Please try again.", 502);
      }

      let parsed: { text: string };
      try {
        parsed = JSON.parse(result.text);
      } catch {
        return error("AI returned an unreadable response. Please try again.", 502);
      }

      return json({ text: parsed.text || text });
    },
  ],
});
