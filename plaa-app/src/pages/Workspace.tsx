import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Sparkles, Plus, Loader2 } from "lucide-react";
import { api } from "@appdeploy/client";
import type { Block, BlockType, Project, ProjectStatus } from "../types";
import { DOC_TYPE_CONFIG } from "../types";
import { BlockRow } from "../components/BlockRow";
import { StyleProposalCard } from "../components/StyleProposalCard";
import { PagePreview } from "../components/PagePreview";

type Tab = "intake" | "style" | "canvas" | "export";

const TABS: { id: Tab; label: string }[] = [
  { id: "intake", label: "1. Intake" },
  { id: "style", label: "2. Style" },
  { id: "canvas", label: "3. Canvas" },
  { id: "export", label: "4. Export" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function Workspace({
  projectId,
  onBack,
  onOpenPrint,
}: {
  projectId: string;
  onBack: () => void;
  onOpenPrint: () => void;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<Tab>("intake");
  const [rawContent, setRawContent] = useState("");
  const [structuring, setStructuring] = useState(false);
  const [generatingStyles, setGeneratingStyles] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get(`/api/projects/${projectId}`);
    setProject(res.data.project);
    setRawContent(res.data.project.rawContent || "");
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (updates: Partial<Project>) => {
    if (!project) return;
    setSaving(true);
    try {
      const res = await api.put(`/api/projects/${projectId}`, updates);
      setProject(res.data.project);
    } finally {
      setSaving(false);
    }
  };

  const handleStructure = async () => {
    setStructuring(true);
    try {
      const res = await api.post(`/api/projects/${projectId}/structure`, { rawContent });
      setProject(res.data.project);
      setTab("style");
    } finally {
      setStructuring(false);
    }
  };

  const handleGenerateStyles = async () => {
    if (!project) return;
    setGeneratingStyles(true);
    try {
      const res = await api.post(`/api/projects/${projectId}/styles`, {
        brandPrimary: project.brandPrimary,
        brandSecondary: project.brandSecondary,
      });
      setProject(res.data.project);
    } finally {
      setGeneratingStyles(false);
    }
  };

  const updateBlock = (index: number, updates: Partial<Block>) => {
    if (!project) return;
    const blocks = [...project.blocks];
    blocks[index] = { ...blocks[index], ...updates };
    setProject({ ...project, blocks });
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (!project) return;
    const blocks = [...project.blocks];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    const updated = { ...project, blocks };
    setProject(updated);
    persist({ blocks });
  };

  const deleteBlock = (index: number) => {
    if (!project) return;
    const blocks = project.blocks.filter((_, i) => i !== index);
    setProject({ ...project, blocks });
    persist({ blocks });
  };

  const addBlock = (type: BlockType) => {
    if (!project) return;
    const blocks = [...project.blocks, { id: uid(), type, text: "" }];
    setProject({ ...project, blocks });
    persist({ blocks });
  };

  const rewriteBlock = async (index: number, instruction: string) => {
    if (!project) return;
    const block = project.blocks[index];
    const res = await api.post(`/api/projects/${projectId}/rewrite`, {
      text: block.text,
      instruction,
      docType: project.docType,
    });
    updateBlock(index, { text: res.data.text });
    const blocks = [...project.blocks];
    blocks[index] = { ...blocks[index], text: res.data.text };
    persist({ blocks });
  };

  const saveBlocksNow = () => {
    if (!project) return;
    persist({ blocks: project.blocks });
  };

  const selectStyle = (style: Project["selectedStyle"]) => {
    if (!project) return;
    setProject({ ...project, selectedStyle: style });
    persist({ selectedStyle: style });
  };

  const setStatus = (status: ProjectStatus) => {
    if (!project) return;
    setProject({ ...project, status });
    persist({ status });
  };

  if (!project) {
    return <div className="p-10 text-center text-gray-400 text-sm">Loading project…</div>;
  }

  const config = DOC_TYPE_CONFIG[project.docType];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-navy hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" /> All Projects
          </button>
          <h1 className="font-display text-2xl text-ink">{project.name}</h1>
          <p className="text-xs text-gray-400">{config.label} · {project.trimSize} {saving && "· saving…"}</p>
        </div>
        <nav className="flex bg-white border border-navy/10 rounded-lg p-1 gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm px-3 sm:px-4 py-2 rounded-md transition-colors ${
                tab === t.id ? "bg-navy text-white" : "text-gray-500 hover:bg-navy-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "intake" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-navy/10 rounded-xl p-5">
            <h2 className="font-display text-lg text-ink mb-1">Paste your content</h2>
            <p className="text-sm text-gray-500 mb-4">
              PLAA's Content Structuring Agent will detect {config.headingTermPlural.toLowerCase()}, sections, and structure automatically.
            </p>
            <textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder={config.samplePlaceholder}
              rows={16}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy/30 font-mono"
            />
            <button
              onClick={handleStructure}
              disabled={structuring || !rawContent.trim()}
              className="mt-4 flex items-center gap-2 bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-md text-sm transition-colors"
            >
              {structuring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {structuring ? "Structuring with AI…" : "Structure with AI"}
            </button>
          </div>

          <div className="bg-white border border-navy/10 rounded-xl p-5">
            <h2 className="font-display text-lg text-ink mb-3">Detected Content Map</h2>
            {project.blocks.length === 0 ? (
              <p className="text-sm text-gray-400">Run the AI structuring step to see your content map here.</p>
            ) : (
              <ul className="space-y-1.5 max-h-[28rem] overflow-y-auto">
                {project.blocks.map((b) => (
                  <li key={b.id} className="text-sm flex items-start gap-2 border-b border-gray-100 pb-1.5">
                    <span className="text-xs font-medium text-navy bg-navy-50 rounded px-1.5 py-0.5 shrink-0 mt-0.5">
                      {config.blockTypes.find((bt) => bt.value === b.type)?.label || b.type}
                    </span>
                    <span className="text-gray-600 truncate">{b.text || <em className="text-gray-300">empty</em>}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "style" && (
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-lg text-ink">Style Proposals</h2>
              <p className="text-sm text-gray-500">Three AI-generated directions — pick one to lock your layout system.</p>
            </div>
            <button
              onClick={handleGenerateStyles}
              disabled={generatingStyles}
              className="flex items-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50 text-navy-dark font-semibold px-4 py-2.5 rounded-md text-sm transition-colors"
            >
              {generatingStyles ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {project.styleProposals.length ? "Regenerate Proposals" : "Generate Proposals"}
            </button>
          </div>

          {project.styleProposals.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
              No style proposals yet. Generate three AI-designed directions to choose from.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {project.styleProposals.map((sp, i) => (
                <StyleProposalCard
                  key={i}
                  proposal={sp}
                  selected={project.selectedStyle?.name === sp.name}
                  onSelect={() => selectStyle(sp)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "canvas" && (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-ink">Blocks</h2>
              <div className="relative group">
                <button className="flex items-center gap-1 text-xs bg-navy-50 text-navy px-2.5 py-1.5 rounded-md">
                  <Plus className="w-3.5 h-3.5" /> Add Block
                </button>
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block z-10 min-w-[10rem]">
                  {config.blockTypes.map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => addBlock(bt.value)}
                      className="block w-full text-left text-xs px-3 py-2 hover:bg-navy-50 text-gray-700"
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="max-h-[40rem] overflow-y-auto pr-1">
              {project.blocks.map((b, i) => (
                <BlockRow
                  key={b.id}
                  block={b}
                  docType={project.docType}
                  isFirst={i === 0}
                  isLast={i === project.blocks.length - 1}
                  onChange={(updates) => updateBlock(i, updates)}
                  onMove={(dir) => moveBlock(i, dir)}
                  onDelete={() => deleteBlock(i)}
                  onRewrite={(instr) => rewriteBlock(i, instr)}
                />
              ))}
            </div>
            <button
              onClick={saveBlocksNow}
              className="w-full mt-2 bg-navy hover:bg-navy-dark text-white text-sm font-medium py-2 rounded-md"
            >
              Save Changes
            </button>
          </div>
          <div className="lg:col-span-3">
            <h2 className="font-display text-lg text-ink mb-3">Live Preview</h2>
            <div className="bg-gray-100 rounded-xl p-6 max-h-[44rem] overflow-y-auto">
              <PagePreview project={project} />
            </div>
          </div>
        </div>
      )}

      {tab === "export" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white border border-navy/10 rounded-xl p-5 h-fit">
            <h2 className="font-display text-lg text-ink mb-4">Publication Status</h2>
            <div className="space-y-2 mb-5">
              {(["draft", "in_review", "approved"] as ProjectStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-md border capitalize transition-colors ${
                    project.status === s ? "border-navy bg-navy-50 text-navy font-medium" : "border-gray-200 text-gray-500"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
            <dl className="text-sm text-gray-500 space-y-1 mb-5">
              <div className="flex justify-between"><dt>Blocks</dt><dd>{project.blocks.length}</dd></div>
              <div className="flex justify-between"><dt>Trim size</dt><dd>{project.trimSize}</dd></div>
              <div className="flex justify-between"><dt>Style</dt><dd>{project.selectedStyle?.name || "Not selected"}</dd></div>
            </dl>
            <button
              onClick={onOpenPrint}
              className="w-full bg-navy hover:bg-navy-dark text-white font-medium py-2.5 rounded-md text-sm"
            >
              Open Print / Export View
            </button>
          </div>
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg text-ink mb-3">Preview</h2>
            <div className="bg-gray-100 rounded-xl p-6 max-h-[44rem] overflow-y-auto">
              <PagePreview project={project} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
