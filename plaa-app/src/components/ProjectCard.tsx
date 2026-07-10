import { BookOpen, Newspaper, Trash2 } from "lucide-react";
import type { Project } from "../types";
import { DOC_TYPE_CONFIG } from "../types";

const STATUS_STYLES: Record<Project["status"], string> = {
  draft: "bg-gray-100 text-gray-700",
  in_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
};

export function ProjectCard({
  project,
  onOpen,
  onDelete,
}: {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const Icon = project.docType === "hymnal" ? BookOpen : Newspaper;
  return (
    <div className="group relative bg-white border border-navy/10 rounded-xl shadow-sm hover:shadow-page transition-shadow overflow-hidden">
      <button onClick={onOpen} className="block w-full text-left p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-navy" />
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[project.status]}`}>
            {project.status.replace("_", " ")}
          </span>
        </div>
        <h3 className="font-display text-lg text-ink mb-1 truncate">{project.name}</h3>
        <p className="text-sm text-gray-500">
          {DOC_TYPE_CONFIG[project.docType].label} · {project.blocks.length} blocks
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Updated {new Date(project.updatedAt).toLocaleDateString()}
        </p>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete project"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-white/90 hover:bg-red-50 text-red-500 p-1.5 rounded-md border border-red-100"
        style={{ top: "3.5rem" }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
