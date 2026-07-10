import { useState } from "react";
import { X } from "lucide-react";
import { DOC_TYPE_CONFIG, type DocType } from "../types";

export function NewProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; docType: DocType; trimSize: string; brandPrimary?: string; brandSecondary?: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [docType, setDocType] = useState<DocType>("hymnal");
  const [trimSize, setTrimSize] = useState(DOC_TYPE_CONFIG.hymnal.defaultTrimSize);
  const [brandPrimary, setBrandPrimary] = useState("#064A76");
  const [brandSecondary, setBrandSecondary] = useState("#C7A24A");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDocTypeChange = (next: DocType) => {
    setDocType(next);
    setTrimSize(DOC_TYPE_CONFIG[next].defaultTrimSize);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please give your project a name before continuing.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onCreate({ name: name.trim(), docType, trimSize, brandPrimary, brandSecondary });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-ink/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display text-2xl text-ink mb-1">New Project</h2>
        <p className="text-sm text-gray-500 mb-5">Set up the basics — you can refine everything later.</p>

        <label className="block text-sm font-medium text-ink mb-1">Project name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Only Believe Hymnal"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-navy/40"
        />
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <label className="block text-sm font-medium text-ink mb-1 mt-3">Document type</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {(Object.keys(DOC_TYPE_CONFIG) as DocType[]).map((dt) => (
            <button
              key={dt}
              onClick={() => handleDocTypeChange(dt)}
              className={`text-left border rounded-md px-3 py-2 text-sm transition-colors ${
                docType === dt ? "border-navy bg-navy-50 text-navy font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {DOC_TYPE_CONFIG[dt].label}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-ink mb-1">Trim size</label>
        <input
          value={trimSize}
          onChange={(e) => setTrimSize(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-navy/40"
        />

        <label className="block text-sm font-medium text-ink mb-1">Brand colors (optional)</label>
        <div className="flex gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 border border-gray-300 rounded-md px-2 py-1.5">
            <input type="color" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} className="w-7 h-7 border-0 p-0" />
            <span className="text-xs text-gray-500">Primary</span>
          </div>
          <div className="flex items-center gap-2 flex-1 border border-gray-300 rounded-md px-2 py-1.5">
            <input type="color" value={brandSecondary} onChange={(e) => setBrandSecondary(e.target.value)} className="w-7 h-7 border-0 p-0" />
            <span className="text-xs text-gray-500">Secondary</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-navy hover:bg-navy-dark text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create Project"}
        </button>
      </div>
    </div>
  );
}
