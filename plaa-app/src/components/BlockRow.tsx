import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Wand2, Loader2 } from "lucide-react";
import type { Block, DocType } from "../types";
import { DOC_TYPE_CONFIG, REWRITE_INSTRUCTIONS } from "../types";

export function BlockRow({
  block,
  docType,
  isFirst,
  isLast,
  onChange,
  onMove,
  onDelete,
  onRewrite,
}: {
  block: Block;
  docType: DocType;
  isFirst: boolean;
  isLast: boolean;
  onChange: (updates: Partial<Block>) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
  onRewrite: (instruction: string) => Promise<void>;
}) {
  const [showRewrite, setShowRewrite] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const blockTypes = DOC_TYPE_CONFIG[docType].blockTypes;
  const hasSubtext = block.type === "subheading" || block.type === "byline";

  const handleRewrite = async (instruction: string) => {
    setRewriting(true);
    setShowRewrite(false);
    try {
      await onRewrite(instruction);
    } finally {
      setRewriting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white mb-3 relative">
      <div className="flex items-center justify-between mb-2">
        <select
          value={block.type}
          onChange={(e) => onChange({ type: e.target.value as Block["type"] })}
          className="text-xs font-medium text-navy bg-navy-50 border border-navy/20 rounded px-2 py-1"
        >
          {blockTypes.map((bt) => (
            <option key={bt.value} value={bt.value}>
              {bt.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <button
            disabled={rewriting}
            onClick={() => setShowRewrite((s) => !s)}
            className="p-1.5 text-gold-dark hover:bg-gold/10 rounded"
            aria-label="AI rewrite"
            title="AI rewrite"
          >
            {rewriting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          </button>
          <button disabled={isFirst} onClick={() => onMove("up")} className="p-1.5 text-gray-400 hover:text-navy disabled:opacity-30 rounded">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button disabled={isLast} onClick={() => onMove("down")} className="p-1.5 text-gray-400 hover:text-navy disabled:opacity-30 rounded">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showRewrite && (
        <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-gold/5 rounded-md border border-gold/20">
          {REWRITE_INSTRUCTIONS.map((ri) => (
            <button
              key={ri.value}
              onClick={() => handleRewrite(ri.value)}
              className="text-xs bg-white border border-gold/30 text-navy px-2 py-1 rounded hover:bg-gold/10"
            >
              {ri.label}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={block.text}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={block.type === "paragraph" || block.type === "pull_quote" || block.type === "callout" ? 3 : 2}
        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy/30 resize-y"
        placeholder="Block text…"
      />
      {hasSubtext && (
        <input
          value={block.subtext || ""}
          onChange={(e) => onChange({ subtext: e.target.value })}
          placeholder={block.type === "subheading" ? "Author · Composer · Meter" : "Author name"}
          className="w-full text-xs text-gray-600 border border-gray-200 rounded px-2 py-1.5 mt-1.5 focus:outline-none focus:ring-2 focus:ring-navy/30"
        />
      )}
    </div>
  );
}
