import { useEffect, useState } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { api } from "@appdeploy/client";
import type { Project } from "../types";
import { PagePreview } from "../components/PagePreview";

export function PrintView({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    api.get(`/api/projects/${projectId}`).then((res) => setProject(res.data.project));
  }, [projectId]);

  if (!project) {
    return <div className="p-10 text-center text-gray-400 text-sm">Loading print preview…</div>;
  }

  return (
    <div className="bg-gray-200 min-h-screen pb-20">
      <div className="print-hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-navy hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Editor
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-navy hover:bg-navy-dark text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </button>
      </div>
      <div className="py-10 px-4">
        <PagePreview project={project} printMode />
      </div>
    </div>
  );
}
