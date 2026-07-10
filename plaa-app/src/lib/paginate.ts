import type { Block, DocType } from "../types";

export function paginateBlocks(blocks: Block[], docType: DocType): Block[][] {
  if (blocks.length === 0) return [];

  if (docType === "hymnal") {
    const pages: Block[][] = [];
    let current: Block[] = [];
    blocks.forEach((b) => {
      if (b.type === "heading" && current.length > 0) {
        pages.push(current);
        current = [];
      }
      current.push(b);
    });
    if (current.length) pages.push(current);
    return pages;
  }

  // newsletter: pack by an approximate character budget per page
  const CAP = 1400;
  const pages: Block[][] = [];
  let current: Block[] = [];
  let budget = 0;
  blocks.forEach((b) => {
    const len = (b.text?.length || 0) + (b.subtext?.length || 0) + 40;
    const forcedBreak = b.type === "heading" && budget > 500;
    if (current.length > 0 && (budget + len > CAP || forcedBreak)) {
      pages.push(current);
      current = [];
      budget = 0;
    }
    current.push(b);
    budget += len;
  });
  if (current.length) pages.push(current);
  return pages;
}

export function parseTrimSize(trimSize: string): { width: number; height: number } {
  const match = trimSize.match(/([\d.]+)\s*x\s*([\d.]+)/i);
  if (!match) return { width: 5.5, height: 8.5 };
  return { width: parseFloat(match[1]), height: parseFloat(match[2]) };
}
