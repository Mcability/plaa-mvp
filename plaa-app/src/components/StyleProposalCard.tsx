import { Check } from "lucide-react";
import type { StyleProposal } from "../types";

export function StyleProposalCard({
  proposal,
  selected,
  onSelect,
}: {
  proposal: StyleProposal;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`text-left rounded-xl overflow-hidden border-2 transition-all w-full ${
        selected ? "border-gold shadow-page" : "border-gray-200 hover:border-navy/30"
      }`}
    >
      <div
        className="p-5 h-40 flex flex-col justify-between"
        style={{ backgroundColor: proposal.background, color: proposal.textColor }}
      >
        <div>
          <div style={{ fontFamily: `'${proposal.headingFont}', serif`, color: proposal.primary }} className="text-xl font-semibold leading-tight">
            {proposal.name}
          </div>
          <div style={{ fontFamily: `'${proposal.bodyFont}', sans-serif` }} className="text-sm mt-1 opacity-80">
            The quick brown fox jumps gracefully across the page.
          </div>
        </div>
        <div className="flex gap-1.5">
          {[proposal.primary, proposal.secondary, proposal.accent].map((c, i) => (
            <span key={i} className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="bg-white p-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{proposal.vibe}</p>
          <p className="text-xs text-gray-500">
            {proposal.headingFont} / {proposal.bodyFont}
          </p>
        </div>
        {selected && (
          <span className="bg-gold text-navy-dark rounded-full p-1">
            <Check className="w-4 h-4" />
          </span>
        )}
      </div>
    </button>
  );
}
