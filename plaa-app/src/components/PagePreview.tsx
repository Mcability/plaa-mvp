import type { Block, DocType, Project, StyleProposal } from "../types";
import { paginateBlocks, parseTrimSize } from "../lib/paginate";

const DEFAULT_STYLE: StyleProposal = {
  name: "Default",
  vibe: "Clean & Classic",
  primary: "#064A76",
  secondary: "#C7A24A",
  accent: "#9C7C32",
  background: "#FFFFFF",
  textColor: "#1A1A1A",
  headingFont: "Playfair Display",
  bodyFont: "Inter",
};

function BlockView({ block, docType, style, verseNumber }: { block: Block; docType: DocType; style: StyleProposal; verseNumber?: number }) {
  const headingFont = `'${style.headingFont}', serif`;
  const bodyFont = `'${style.bodyFont}', sans-serif`;

  switch (block.type) {
    case "heading":
      return (
        <div className="mb-1">
          <h2 style={{ fontFamily: headingFont, color: style.primary }} className="text-2xl sm:text-3xl font-bold leading-tight">
            {block.text}
          </h2>
        </div>
      );
    case "subheading":
      return (
        <p style={{ fontFamily: bodyFont, color: style.accent }} className="text-xs sm:text-sm italic mb-3 mt-1">
          {block.text}
          {block.subtext ? ` — ${block.subtext}` : ""}
        </p>
      );
    case "byline":
      return (
        <p style={{ fontFamily: bodyFont, color: style.secondary }} className="text-xs uppercase tracking-wide mb-3">
          {block.text} {block.subtext ? `· ${block.subtext}` : ""}
        </p>
      );
    case "verse":
      return (
        <p style={{ fontFamily: bodyFont, color: style.textColor }} className="text-sm sm:text-base leading-relaxed mb-3 whitespace-pre-line">
          {docType === "hymnal" && verseNumber ? <span style={{ color: style.accent }} className="font-semibold mr-1">{verseNumber}.</span> : null}
          {block.text}
        </p>
      );
    case "chorus":
      return (
        <p
          style={{ fontFamily: bodyFont, color: style.secondary, borderColor: style.accent }}
          className="text-sm sm:text-base italic font-medium leading-relaxed mb-3 pl-3 border-l-2 whitespace-pre-line"
        >
          {block.text}
        </p>
      );
    case "pull_quote":
      return (
        <blockquote style={{ fontFamily: headingFont, color: style.primary, borderColor: style.accent }} className="text-lg sm:text-xl italic font-medium my-4 pl-4 border-l-4">
          “{block.text}”
        </blockquote>
      );
    case "callout":
      return (
        <div style={{ backgroundColor: `${style.accent}1A`, borderColor: style.accent, fontFamily: bodyFont, color: style.textColor }} className="text-sm rounded-md border p-3 my-3">
          {block.text}
        </div>
      );
    case "caption":
      return (
        <p style={{ fontFamily: bodyFont, color: style.textColor }} className="text-xs opacity-70 mb-3">
          {block.text}
        </p>
      );
    case "paragraph":
    default:
      return (
        <p style={{ fontFamily: bodyFont, color: style.textColor }} className="text-sm sm:text-base leading-relaxed mb-3">
          {block.text}
        </p>
      );
  }
}

export function PagePreview({
  project,
  printMode = false,
}: {
  project: Project;
  printMode?: boolean;
}) {
  const style = project.selectedStyle || DEFAULT_STYLE;
  const pages = paginateBlocks(project.blocks, project.docType);
  const { width, height } = parseTrimSize(project.trimSize);
  const aspect = width / height;

  if (pages.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm">
        No content yet. Structure your content in the Intake tab to see the layout preview here.
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-0">
      {pages.map((pageBlocks, pageIndex) => {
        let verseCounter = 0;
        return (
          <div
            key={pageIndex}
            className={`print-page mx-auto shadow-page rounded-sm overflow-hidden ${printMode ? "" : "max-w-md"}`}
            style={{
              backgroundColor: style.background,
              aspectRatio: `${aspect}`,
              width: printMode ? `${width}in` : undefined,
              height: printMode ? `${height}in` : undefined,
            }}
          >
            <div className="h-full flex flex-col p-6 sm:p-8">
              <div className="flex-1 overflow-hidden">
                {pageBlocks.map((b) => {
                  if (b.type === "verse") verseCounter += 1;
                  return <BlockView key={b.id} block={b} docType={project.docType} style={style} verseNumber={verseCounter} />;
                })}
              </div>
              <div
                style={{ fontFamily: `'${style.bodyFont}', sans-serif`, color: style.textColor, borderColor: `${style.textColor}22` }}
                className="pt-2 mt-2 border-t flex items-center justify-between text-[10px] opacity-60"
              >
                <span>{project.name}</span>
                <span>{pageIndex + 1}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
